import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES } from "@/i18n";

const LanguageSwitcher = ({ scrolled = false }: { scrolled?: boolean }) => {
  const { i18n, t } = useTranslation();
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("nav.language")}
        title={t("nav.language")}
        className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
          scrolled
            ? "text-foreground hover:bg-muted"
            : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        }`}
      >
        <Globe className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase hidden md:inline">{current.code}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <DropdownMenuItem
            key={lng.code}
            onClick={() => i18n.changeLanguage(lng.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{lng.flag}</span>
              <span>{lng.label}</span>
            </span>
            {i18n.language === lng.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
