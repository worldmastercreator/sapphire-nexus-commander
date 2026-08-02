import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

/**
 * Drop-in replacement for the shadcn `useToast` hook used across the
 * Developer Manager module. Backed by sonner in this project.
 */
export function toast({ title, description, variant = "default", duration }: ToastOptions) {
  const message = title ?? description ?? "";
  const opts = { description: title ? description : undefined, duration };

  if (variant === "destructive") return sonnerToast.error(message, opts);
  if (variant === "success") return sonnerToast.success(message, opts);
  return sonnerToast(message, opts);
}

export function useToast() {
  return { toast, dismiss: sonnerToast.dismiss };
}

export default useToast;
