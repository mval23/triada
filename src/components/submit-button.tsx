"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type Props = ComponentProps<"button"> & { pendingText?: string; confirm?: string };

export function SubmitButton({
  children,
  pendingText,
  confirm,
  className = "btn-choco",
  onClick,
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
        onClick?.(event);
      }}
      {...props}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
