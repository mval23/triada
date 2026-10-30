import { signOut } from "@/actions/auth";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data: isMember } = await supabase.rpc("is_member");

  if (!isMember) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
        <h1 className="titulo">Falta un paso</h1>
        <p className="caja text-[15px]">
          Tu correo entró bien, pero todavía no está autorizado para ver los datos de Triada. Agrégalo a la tabla{" "}
          <strong>members</strong> en Supabase y vuelve a entrar.
        </p>
        <form action={signOut}>
          <button type="submit" className="btn-borde w-full">
            Cerrar sesión
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 pt-7 pb-32">{children}</main>
      <BottomNav />
    </>
  );
}
