import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Package,
  Gamepad2,
  Users,
  Store,
  Star,
  CreditCard,
  Settings,
} from "lucide-react";

export async function AdminNav() {
  const t = await getTranslations("admin.nav");

  const items = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/orders", label: t("orders"), icon: Package },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/games", label: t("games"), icon: Gamepad2 },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/sellers", label: t("sellers"), icon: Store },
    { href: "/admin/reviews", label: t("reviews"), icon: Star },
    { href: "/admin/payments", label: t("payments"), icon: CreditCard },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-2 lg:flex-col lg:overflow-visible">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-bg-elevated hover:text-text"
        >
          <item.icon size={17} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
