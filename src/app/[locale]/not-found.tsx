import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Compass } from "lucide-react";

export default async function NotFound() {
  const [t, tCommon] = await Promise.all([getTranslations("errors"), getTranslations("common")]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center px-4 py-20 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Compass size={32} />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-text">{t("notFound")}</h1>
      <p className="mt-2 text-text-muted">{t("notFoundDesc")}</p>

      <ButtonLink href="/" className="mt-8">
        {tCommon("backHome")}
      </ButtonLink>
    </div>
  );
}
