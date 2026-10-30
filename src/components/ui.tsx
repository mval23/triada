import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { StockStatus } from "@/lib/stock";
import { BackIcon } from "./icons";

export function PageHeader({ title, action, back }: { title: string; action?: ReactNode; back?: string }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {back && (
          <Link
            href={back}
            aria-label="Volver"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-choco"
          >
            <BackIcon />
          </Link>
        )}
        <h1 className="titulo break-words">{title}</h1>
      </div>
      {action}
    </header>
  );
}

export function RoundAction({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-choco text-crema"
    >
      {children}
    </Link>
  );
}

const STATUS_STYLES: Record<StockStatus, string> = {
  falta: "bg-choco text-crema",
  poco: "bg-poco text-choco",
  bien: "bg-crema text-rosa-texto",
};

const STATUS_LABELS: Record<StockStatus, string> = { falta: "Falta", poco: "Poco", bien: "Bien" };

export function StatusChip({ status }: { status: StockStatus }) {
  return <span className={`chip min-w-11 justify-center ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function CookieThumb({
  src,
  color,
  alt,
  size = 64,
  className = "rounded-2xl",
}: {
  src: string | null;
  color: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={`block shrink-0 ${className}`}
        style={{ width: size, height: size, background: color }}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 bg-white object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="caja text-center text-[15px]">{children}</p>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="etiqueta">{label}</span>
      {children}
    </label>
  );
}
