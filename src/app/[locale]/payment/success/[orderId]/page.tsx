import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ButtonLink } from "@/components/ui/Button";
import { PaymentResultToast } from "@/components/payment/PaymentResultToast";
import { CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function PaymentSuccessPage({ params }: PageProps) {
  const { orderId } = await params;
  const [session, t, tToast] = await Promise.all([
    auth(),
    getTranslations("payment.success"),
    getTranslations("toast"),
  ]);
  if (!session?.user) notFound();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <PaymentResultToast message={tToast("paymentSuccessful")} kind="success" />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <CheckCircle2 size={32} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-text">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("subtitle")}</p>

      <div className="mt-8 flex w-full gap-3">
        <ButtonLink href={`/profile/orders/${order.id}`} className="flex-1">
          {t("viewOrder")}
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" className="flex-1">
          {t("backHome")}
        </ButtonLink>
      </div>
    </div>
  );
}
