import { openai } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";
import { Pool } from "pg";

import { getEnhancedSystemPrompt } from "@/lib/chat-system-prompt";
import { createMCPClient, executeQuery } from "@/lib/mcp-client";

/**
 * POST /api/chat
 * Handles chat messages with OpenAI and MCP database tool calling
 *
 * Request body:
 * - messages: Array of chat messages from client
 * - shopId: Current user's shop ID (from session)
 *
 * Returns: Server-sent events stream with formatted AI responses
 */
export async function POST(req: Request) {
  try {
    const { messages, shopId } = await req.json();

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages:", messages);
      return new Response("Invalid request: missing messages", { status: 400 });
    }

    if (!shopId || typeof shopId !== "number") {
      console.error("Invalid shopId:", shopId);
      return new Response("Unauthorized: missing or invalid shopId", {
        status: 401,
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response("OpenAI API key is not configured", { status: 500 });
    }

    // Get enhanced system prompt with shopId context
    const systemPrompt = getEnhancedSystemPrompt(shopId);

    console.log("[Chat API] Starting stream for shopId:", shopId);
    console.log("[Chat API] Messages count:", messages.length);

    // First, get the AI's response (which may contain SQL queries)
    const initialResponse = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages,
      temperature: 0.3,
    });

    console.log("[Chat API] Initial response generated");

    let responseText = initialResponse.text;
    const sqlRegex = /\[SQL_QUERY\]([\s\S]*?)\[\/SQL_QUERY\]/g;
    let sqlMatch;
    let mcpClient: Pool | null = null;

    // Execute any SQL queries found in the response
    const queryResults: { query: string; result: unknown }[] = [];

    while ((sqlMatch = sqlRegex.exec(responseText)) !== null) {
      const query = sqlMatch[1].trim();
      console.log("[Chat API] Found SQL query to execute:", query);

      try {
        // Initialize MCP client if needed
        if (!mcpClient) {
          mcpClient = await createMCPClient();
        }

        // Execute the query
        const result = await executeQuery(mcpClient, query, shopId);
        queryResults.push({ query, result });

        console.log("[Chat API] Query executed successfully");
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Query execution failed";
        console.error("[Chat API] Query execution error:", errorMsg);

        // Replace the SQL query tag with error message
        responseText = responseText.replace(
          sqlMatch[0],
          `[QUERY_ERROR]${errorMsg}[/QUERY_ERROR]`
        );
      }
    }

    // If queries were executed, send results back to AI for analysis
    if (queryResults.length > 0) {
      console.log("[Chat API] Executing follow-up with query results");

      // Create a new message with query results for the AI to analyze
      const resultsMessage = `
System: The following SQL queries were executed with these results:

${queryResults.map((qr, i) => `Query ${i + 1}: ${qr.query}\nResults: ${JSON.stringify(qr.result)}`).join("\n\n")}

Please now provide the insights and analysis based on these results.`;

      // Get the final response with analyzed results
      const finalResponse = await streamText({
        model: openai("gpt-4o-mini"),
        system: systemPrompt,
        messages: [
          ...messages,
          {
            role: "assistant",
            content: responseText,
          },
          {
            role: "user",
            content: resultsMessage,
          },
        ],
        temperature: 0.3,
      });

      return finalResponse.toTextStreamResponse();
    } else {
      // No queries to execute, just stream the initial response
      return new Response(responseText, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({
        error: "Chat processing failed",
        details: process.env.NODE_ENV === "development" ? errorMsg : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
