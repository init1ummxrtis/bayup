"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle size={32} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-text">{t("generic")}</h1>

      <Button size="lg" onClick={reset} className="mt-8">
        {tCommon("tryAgain")}
      </Button>
    </div>
  );
}
