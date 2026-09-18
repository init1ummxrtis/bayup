"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

interface PaymentResultToastProps {
  message: string;
  kind: "success" | "error";
}

/**
 * Payment success/failed pages are server components (they load the order
 * and guard access there); this tiny client component is mounted once inside
 * them purely to fire the matching toast, without turning the whole page
 * client-side. The ref guards against React StrictMode's dev-only double
 * effect invocation so the toast never fires twice for a single page view.
 */
export function PaymentResultToast({ message, kind }: PaymentResultToastProps) {
  const { show } = useToast();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    hasShown.current = true;
    show(message, kind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
