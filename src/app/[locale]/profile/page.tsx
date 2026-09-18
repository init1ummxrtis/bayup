import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { User, Mail, Calendar } from "lucide-react";

export default async function ProfilePage() {
  const [session, t] = await Promise.all([auth(), getTranslations("profile")]);
  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">{t("title")}</h1>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-2xl font-bold text-primary">
            {user.name.charAt(0)}
          </span>
          <div>
            <p className="text-lg font-semibold text-text">{user.name}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3">
          <InfoRow icon={<User size={16} />} label="Name" value={user.name} />
          <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
          <InfoRow
            icon={<Calendar size={16} />}
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-text-subtle">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-medium text-text">{value}</p>
    </div>
  );
}
