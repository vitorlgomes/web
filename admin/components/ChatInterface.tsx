"use client";

import {
  ArrowUp,
  BarChart3,
  Clock,
  Orbit,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ChatInterfaceProps {
  shopId: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    text: "Quais são os produtos mais vendidos esta semana?",
    label: "Top Produtos",
  },
  {
    icon: BarChart3,
    text: "Qual é a receita total do mês atual?",
    label: "Receita",
  },
  {
    icon: ShoppingBag,
    text: "Quantos pedidos pendentes tenho agora?",
    label: "Pendentes",
  },
  {
    icon: Clock,
    text: "Mostre o horário com mais pedidos hoje",
    label: "Horário Pico",
  },
];

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const spacing = 30;
    const cols = Math.ceil(width / spacing);
    const rows = Math.ceil(height / spacing);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing + spacing / 2;
        const y = j * spacing + spacing / 2;
        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);
      particlesRef.current = initParticles(rect.width, rect.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const animate = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const maxDist = 120;

      particlesRef.current.forEach((particle) => {
        const dx = mouseX - particle.baseX;
        const dy = mouseY - particle.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * 25;
          const pushY = Math.sin(angle) * force * 25;

          particle.x += (particle.baseX - pushX - particle.x) * 0.15;
          particle.y += (particle.baseY - pushY - particle.y) * 0.15;
        } else {
          particle.x += (particle.baseX - particle.x) * 0.08;
          particle.y += (particle.baseY - particle.y) * 0.08;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 172, 123, ${particle.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export default function ChatInterface({ shopId }: ChatInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track mouse for particle effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) {
      const event = new MouseEvent("mousemove", {
        clientX: e.clientX,
        clientY: e.clientY,
      });
      canvas.dispatchEvent(event);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: input },
          ],
          shopId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      const messageId = `assistant-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages((prev) => {
          const messages = [...prev];
          const lastMessage = messages[messages.length - 1];

          if (lastMessage?.id === messageId) {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: assistantMessage,
            };
          }

          return messages;
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div
      className="chat-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      <ParticleBackground />
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(
            165deg,
            #fdfcfa 0%,
            #f8f6f1 50%,
            #f1f7f2 100%
          );
          position: relative;
          overflow: hidden;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .messages-area::-webkit-scrollbar {
          width: 6px;
        }

        .messages-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-area::-webkit-scrollbar-thumb {
          background: rgba(186, 172, 123, 0.3);
          border-radius: 3px;
        }

        .messages-area::-webkit-scrollbar-thumb:hover {
          background: rgba(186, 172, 123, 0.5);
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-container {
          width: 40px;
          height: 40px;
          min-width: 40px;
          min-height: 40px;
          aspect-ratio: 1;
          border-radius: 50%;
          background: linear-gradient(145deg, #baac7b 0%, #9a9066 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
          box-shadow:
            0 8px 20px rgba(186, 172, 123, 0.25),
            0 4px 8px rgba(0, 0, 0, 0.05);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .empty-subtitle {
          font-size: 0.95rem;
          color: #6d736d;
          text-align: center;
          max-width: 360px;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .prompts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
          max-width: 520px;
        }

        @media (max-width: 640px) {
          .prompts-grid {
            grid-template-columns: 1fr;
          }
        }

        .prompt-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(218, 229, 218, 0.6);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          animation: cardSlide 0.5s ease-out backwards;
        }

        .prompt-card:nth-child(1) {
          animation-delay: 0.1s;
        }
        .prompt-card:nth-child(2) {
          animation-delay: 0.2s;
        }
        .prompt-card:nth-child(3) {
          animation-delay: 0.3s;
        }
        .prompt-card:nth-child(4) {
          animation-delay: 0.4s;
        }

        @keyframes cardSlide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .prompt-card:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: #baac7b;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(186, 172, 123, 0.15);
        }

        .prompt-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .prompt-icon {
          width: 18px;
          height: 18px;
          color: #baac7b;
        }

        .prompt-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #baac7b;
        }

        .prompt-text {
          font-size: 0.875rem;
          color: #0b0c0b;
          line-height: 1.4;
        }

        /* Messages */
        .message-wrapper {
          display: flex;
          margin-bottom: 1.25rem;
          animation: messageSlide 0.4s ease-out;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message-wrapper.assistant {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 80%;
          padding: 1rem 1.25rem;
          border-radius: 20px;
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        .message-bubble.user {
          background: linear-gradient(135deg, #baac7b 0%, #a89b6a 100%);
          color: white;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 12px rgba(186, 172, 123, 0.3);
        }

        .message-bubble.assistant {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          color: #0b0c0b;
          border: 1px solid rgba(218, 229, 218, 0.5);
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .message-content {
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* Loading indicator */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(218, 229, 218, 0.5);
          border-radius: 20px;
          border-bottom-left-radius: 6px;
          animation: messageSlide 0.4s ease-out;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #baac7b;
          border-radius: 50%;
          animation: typingBounce 1.4s ease-in-out infinite;
        }

        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        /* Error message */
        .error-message {
          background: rgba(254, 226, 226, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(252, 165, 165, 0.5);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          color: #991b1b;
          font-size: 0.875rem;
          animation: shake 0.5s ease-out;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        /* Input Area */
        .input-area {
          padding: 1rem 1.5rem 1.5rem;
          position: relative;
          z-index: 10;
        }

        .input-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(218, 229, 218, 0.6);
          border-radius: 24px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: flex-end;
          gap: 12px;
          transition: all 0.3s ease;
          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.04),
            0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .input-container:focus-within {
          border-color: #baac7b;
          box-shadow:
            0 4px 24px rgba(186, 172, 123, 0.15),
            0 0 0 3px rgba(186, 172, 123, 0.1);
        }

        .chat-textarea {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.9375rem;
          color: #0b0c0b;
          resize: none;
          outline: none;
          line-height: 1.5;
          max-height: 120px;
          min-height: 24px;
          padding: 4px 0;
        }

        .chat-textarea::placeholder {
          color: #9ca39c;
        }

        .send-button {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #baac7b 0%, #a89b6a 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(186, 172, 123, 0.4);
        }

        .send-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .send-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.2s ease;
        }

        .send-button:hover:not(:disabled) .send-icon {
          transform: translateY(-2px);
        }

        .input-hint {
          text-align: center;
          font-size: 0.75rem;
          color: #9ca39c;
          margin-top: 0.75rem;
        }
      `}</style>

      {/* Messages Area */}
      <div className="messages-area" ref={messagesContainerRef}>
        {isEmpty && !isLoading && !error ? (
          <div className="empty-state">
            <div className="logo-container">
              <Orbit size={20} color="white" strokeWidth={1.5} />
            </div>
            <p className="empty-subtitle font-inter">
              Descubra tendências, analise vendas e tome decisões mais
              inteligentes.
            </p>
            <div className="prompts-grid">
              {SUGGESTED_PROMPTS.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="prompt-card"
                    type="button"
                  >
                    <div className="prompt-card-header">
                      <Icon className="prompt-icon" />
                      <span className="prompt-label">{prompt.label}</span>
                    </div>
                    <p className="prompt-text font-inter">{prompt.text}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-wrapper ${message.role}`}
              >
                <div className={`message-bubble ${message.role}`}>
                  <div className="message-content font-inter">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div className="message-wrapper assistant">
                <div className="error-message">
                  Desculpe, ocorreu um erro ao processar sua mensagem. Por
                  favor, tente novamente.
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre seus dados..."
              disabled={isLoading}
              className="chat-textarea font-inter"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-button"
            >
              <ArrowUp className="send-icon" strokeWidth={2.5} />
            </button>
          </div>
        </form>
        <p className="input-hint font-inter">
          Pressione Enter para enviar ou Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
