"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="titulo">Algo salió mal</h1>
      <p className="caja text-[15px]">{error.message || "Inténtalo de nuevo en un momento."}</p>
      <button type="button" onClick={reset} className="btn-choco">
        Intentar de nuevo
      </button>
    </div>
  );
}
