import { Pool, PoolClient } from "pg";

// Initialize PostgreSQL connection pool using backend database URL
const databaseUrl = process.env.DATABASE_URL!;

let pool: Pool | null = null;

/**
 * Create and initialize PostgreSQL connection pool for direct database queries
 * This approach provides secure read-only access to the backend database:
 * - SELECT-only queries enforced in validateQuery()
 * - shopId filtering enforced in injectShopIdFilter()
 * - No mutations allowed
 * - Server-side execution for security
 */
export async function createMCPClient(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  try {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection fails
    });

    // Test the connection
    const client = await pool.connect();
    client.release();

    console.log("[MCP] PostgreSQL connection pool created successfully");
    return pool;
  } catch (error) {
    console.error("Failed to create PostgreSQL connection:", error);
    throw new Error(
      "Unable to initialize database connection. Please check your DATABASE_URL."
    );
  }
}

/**
 * Validate SQL query for security
 * Ensures only SELECT queries are allowed, blocks all mutations
 */
function validateQuery(query: string): { valid: boolean; error?: string } {
  const trimmedQuery = query.trim();

  // Must start with SELECT
  if (!/^SELECT/i.test(trimmedQuery)) {
    return {
      valid: false,
      error: "Only SELECT queries are allowed",
    };
  }

  // Block dangerous keywords that can modify data or affect database structure
  const dangerousKeywords = [
    "DROP",
    "DELETE",
    "INSERT",
    "UPDATE",
    "ALTER",
    "TRUNCATE",
    "EXEC",
    "EXECUTE",
    "CREATE",
    "GRANT",
    "REVOKE",
  ];

  for (const keyword of dangerousKeywords) {
    // Use word boundary to avoid matching partial words
    if (new RegExp(`\\b${keyword}\\b`, "i").test(trimmedQuery)) {
      return {
        valid: false,
        error: `Operation not allowed. Keyword "${keyword}" cannot be used.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Inject shopId filter into SQL query to enforce multi-tenancy
 * Automatically adds WHERE "shopId" = X or adds to existing WHERE clause
 * Handles both quoted and unquoted shopId references
 */
export function injectShopIdFilter(query: string, shopId: number): string {
  const trimmedQuery = query.trim();

  // Remove trailing semicolon if present
  const queryWithoutSemicolon = trimmedQuery.endsWith(";")
    ? trimmedQuery.slice(0, -1)
    : trimmedQuery;

  const shopIdFilter = `"shopId" = ${shopId}`;

  // Check if shopId is already in the query (quoted or unquoted) - if so, don't add it again
  if (/["']?shopid["']?\s*=/i.test(queryWithoutSemicolon)) {
    console.log("[MCP] shopId already present in query, skipping injection");
    return queryWithoutSemicolon;
  }

  // Check if query has existing WHERE clause
  const whereIndex = queryWithoutSemicolon.toLowerCase().lastIndexOf("where");

  if (whereIndex !== -1) {
    // Find the position after WHERE keyword
    const afterWhereIndex = whereIndex + 5;
    const beforeWhere = queryWithoutSemicolon.substring(0, afterWhereIndex);
    const afterWhere = queryWithoutSemicolon.substring(afterWhereIndex);

    // Add shopId filter with AND
    return `${beforeWhere} ${shopIdFilter} AND ${afterWhere}`;
  }

  // No WHERE clause, check for ORDER BY or GROUP BY to insert before them
  const orderByIndex = queryWithoutSemicolon
    .toLowerCase()
    .lastIndexOf("order by");
  const groupByIndex = queryWithoutSemicolon
    .toLowerCase()
    .lastIndexOf("group by");

  let insertIndex = queryWithoutSemicolon.length;

  if (orderByIndex !== -1) {
    insertIndex = Math.min(insertIndex, orderByIndex);
  }
  if (groupByIndex !== -1) {
    insertIndex = Math.min(insertIndex, groupByIndex);
  }

  // If there's something to insert before, add WHERE clause before it
  if (insertIndex < queryWithoutSemicolon.length) {
    const beforeClause = queryWithoutSemicolon.substring(0, insertIndex).trim();
    const afterClause = queryWithoutSemicolon.substring(insertIndex).trim();
    return `${beforeClause} WHERE ${shopIdFilter} ${afterClause}`;
  }

  // Add WHERE clause at the end
  return `${queryWithoutSemicolon} WHERE ${shopIdFilter}`;
}

/**
 * Execute a SQL query with full security validation
 * - Validates query is SELECT only
 * - Injects shopId filter for multi-tenancy
 * - Executes via PostgreSQL client
 * - Handles errors gracefully
 */
export async function executeQuery(
  pool: Pool,
  query: string,
  shopId: number
): Promise<unknown> {
  let client: PoolClient | null = null;

  try {
    // Step 1: Validate query
    const validation = validateQuery(query);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Step 2: Inject shopId filter
    const enhancedQuery = injectShopIdFilter(query, shopId);

    // Step 3: Log query execution (for debugging/audit, don't expose to user)
    console.log(`[Chat Query] Shop ${shopId}: ${enhancedQuery}`);

    // Step 4: Execute via PostgreSQL client
    client = await pool.connect();
    const result = await client.query(enhancedQuery);

    console.log(`[MCP] Query executed successfully, rows: ${result.rows.length}`);
    return result.rows;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Query execution error:", errorMessage);

    // Return user-friendly error message
    if (
      errorMessage.includes("Only SELECT") ||
      errorMessage.includes("not allowed")
    ) {
      throw new Error(
        "Operation not allowed. Only data retrieval queries are supported."
      );
    }

    if (errorMessage.includes("connection") || errorMessage.includes("ECONNREFUSED")) {
      throw new Error("Unable to connect to database. Please try again.");
    }

    if (errorMessage.includes("does not exist")) {
      throw new Error(`Database error: ${errorMessage}`);
    }

    // Generic error for any other database errors
    throw new Error(`An error occurred while processing your query: ${errorMessage}`);
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Close PostgreSQL connection pool
 * Resets the pool for next session
 */
export async function closeMCPClient(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("[MCP] PostgreSQL connection pool closed");
  }
}
