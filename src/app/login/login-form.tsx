"use client";

import { useActionState } from "react";
import { signIn } from "@/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="caja flex flex-col gap-4">
      <label className="block">
        <span className="etiqueta">Correo</span>
        <input name="email" type="email" autoComplete="email" required className="campo" />
      </label>
      <label className="block">
        <span className="etiqueta">Contraseña</span>
        <input name="password" type="password" autoComplete="current-password" required className="campo" />
      </label>
      {state?.error && (
        <p role="alert" className="font-bold text-choco">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-grande mt-2">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
