import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar · Triada" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image src="/logo-marron.png" alt="Triada" width={140} height={144} priority />
        <p className="font-display text-xl text-rosa-texto">una para todos, todas para ti.</p>
      </div>
      <LoginForm />
      <p className="text-center text-[13px] text-suave">Solo pueden entrar los correos autorizados del equipo.</p>
    </main>
  );
}
