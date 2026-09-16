import { LOCALES, useI18n } from "@/i18n";
import { useProductionCopy } from "@/lib/production/copy";
import { cn } from "@/lib/utils";

export function ProductionLanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const t = useProductionCopy();

  return (
    <div className={cn("flex items-center gap-3", className)} role="group" aria-label={t.nav.language}>
      {LOCALES.map((item, index) => (
        <span key={item} className="flex items-center gap-3">
          {index > 0 ? (
            <span className="text-xs opacity-40" aria-hidden="true">
              /
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setLocale(item)}
            className={cn(
              "nav-link cursor-pointer border-0 bg-transparent p-0 text-xs uppercase tracking-brand text-inherit",
              locale === item && "is-active",
            )}
            aria-pressed={locale === item}
            aria-label={item === "fr" ? "Français" : "English"}
          >
            {item}
          </button>
        </span>
      ))}
    </div>
  );
}
