"use client";

import axios from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useState } from "react";

import LirioLogo from "@/assets/lirio-vector.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import supabaseClient from "./hooks/supabaseClient";

// Define types for state
interface Message {
  text: string;
  type: "error" | "success" | "info";
}

const MagicLinkAuth: React.FC = () => {
  const params = useSearchParams();

  const redirectReason = params.get("redirectReason");
  const [email, setEmail] = useState<string>(""); // State for the email input
  const [message, setMessage] = useState<Message | null>(null); // State for messages (success, error)
  const [loading, setLoading] = useState<boolean>(false); // State for loading spinner

  const codeIsExpired = window.location.href.includes("expired");

  React.useEffect(() => {
    async function setSession() {
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabaseClient?.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }

    setSession();
  }, []);

  // Handle form submission for sending the Magic Link
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email) {
      setMessage({
        text: "Insira um email válido.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null); // Clear any previous messages

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${email}?subdomain=${window.location.hostname}`,
      );

      const validationObject = await response.data;

      const isUserValid = validationObject?.isValid;

      if (!isUserValid) {
        return setMessage({
          text: "Usuário não é válido.",
          type: "error",
        });
      }

      // Call Supabase to send the Magic Link to the provided email
      const res = await supabaseClient?.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `http://localhost:3000/dashboard`, // Redirect URL after successful login (optional)
        },
      });

      if (res?.error) throw res.error;

      setMessage({
        text: "Verifique o seu email!",
        type: "success",
      });
    } catch (error: any) {
      setMessage({
        text: "Houve um erro inesperado. Tente novamente ou entre em contato. Código: #A45F",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8 md:left-16 md:top-16">
        <Image src={LirioLogo} alt="LirioLogo" width={48} />
      </div>

      <main className="flex h-screen items-center justify-center bg-[#FCFBF7] px-4 sm:px-8 md:px-0">
        <div className="w-full max-w-sm space-y-8 md:max-w-md">
          <h1 className="text-left text-2xl font-semibold">Entrar</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Insira seu endereço de e-mail"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              disabled={loading}
              className="w-full rounded bg-green-900 px-4 py-2 font-medium text-white hover:bg-green-950"
              type="submit"
            >
              {loading ? "Enviando Magic Link..." : "Enviar Magic Link"}
            </Button>
          </form>

          {codeIsExpired && (
            <p
              style={{
                color: "red",
                display: "block",
                marginTop: "1rem",
              }}
            >
              Tempo para logar expirou, tente novamente.
            </p>
          )}

          {redirectReason === "405" && (
            <p
              style={{
                color: "red",
              }}
            >
              Você foi redirecionado porque seu usuário não é valido ou seu
              token expirou. Por favor, acesse novamente.
            </p>
          )}

          {message && (
            <p
              style={{
                color:
                  message.type === "error"
                    ? "red"
                    : message.type === "success"
                      ? "green"
                      : "blue",
              }}
            >
              {message.text}
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default MagicLinkAuth;
