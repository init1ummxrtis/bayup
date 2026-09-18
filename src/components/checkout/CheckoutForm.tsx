"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface CheckoutFormProps {
  productId: string;
  selectedValueIds: string[];
  defaultEmail: string;
}

export function CheckoutForm({ productId, selectedValueIds, defaultEmail }: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const tToast = useTranslations("toast");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const { show } = useToast();

  const [email, setEmail] = useState(defaultEmail);
  const [gamingUsername, setGamingUsername] = useState("");
  const [additionalInformation, setAdditionalInformation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          selectedValueIds,
          customerEmail: email,
          gamingUsername,
          additionalInformation: additionalInformation || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.error === "string" ? data.error : tErrors("generic"));
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      show(tToast("orderCreated"), "success");
      router.push(`/payment/${data.order.id}`);
    } catch {
      setError(tErrors("generic"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="mb-4 font-semibold text-text">{t("contactDetails")}</h2>

      <div className="flex flex-col gap-4">
        <Field label={t("email")}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
          />
        </Field>

        <Field label={t("gamingUsername")}>
          <input
            type="text"
            required
            minLength={2}
            value={gamingUsername}
            onChange={(e) => setGamingUsername(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-text outline-none focus:border-primary"
          />
        </Field>

        <Field label={t("additionalInformation")}>
          <textarea
            rows={3}
            value={additionalInformation}
            onChange={(e) => setAdditionalInformation(e.target.value)}
            placeholder={t("additionalInformationPlaceholder")}
            className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
          />
        </Field>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <Button type="submit" size="lg" loading={submitting} className="mt-6 w-full">
        {t("continueToPayment")}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}
