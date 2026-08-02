import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success";

export interface ToastOptions {
  title?: string | undefined;
  description?: string | undefined;
  variant?: ToastVariant | undefined;
  duration?: number | undefined;
}

/**
 * Drop-in replacement for the shadcn `useToast` hook used across the
 * Developer Manager module. Backed by sonner in this project.
 */
export function toast({ title, description, variant = "default", duration }: ToastOptions) {
  const message = title ?? description ?? "";
  const opts: { description?: string; duration?: number } = {};
  if (title && description) opts.description = description;
  if (duration !== undefined) opts.duration = duration;

  if (variant === "destructive") return sonnerToast.error(message, opts);
  if (variant === "success") return sonnerToast.success(message, opts);
  return sonnerToast(message, opts);
}

export function useToast() {
  return { toast, dismiss: sonnerToast.dismiss };
}

export default useToast;
