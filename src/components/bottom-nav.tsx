"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, BoxIcon, ClipboardIcon, CoinIcon, HomeIcon } from "./icons";

const TABS = [
  { href: "/", label: "Inicio", Icon: HomeIcon },
  { href: "/stock", label: "Stock", Icon: BoxIcon },
  { href: "/recetas", label: "Recetas", Icon: BookIcon },
  { href: "/pedidos", label: "Pedidos", Icon: ClipboardIcon },
  { href: "/deudas", label: "Deudas", Icon: CoinIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-choco bg-crema pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 pt-2 pb-3">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-[3px] text-xs ${active ? "font-bold text-choco" : "font-medium text-rosa-texto"}`}
            >
              <span
                className={`flex h-[30px] w-[52px] items-center justify-center rounded-full ${active ? "bg-choco text-crema" : ""}`}
              >
                <Icon />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
