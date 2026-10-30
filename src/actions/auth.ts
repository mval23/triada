"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { text } from "./helpers";

export type SignInState = { error?: string } | undefined;

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: text(formData, "email"),
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
