import React from "react";
import { useTranslation } from "react-i18next";
import {
  Cog,
  FlaskConical,
  History,
  Info,
  Sparkles,
  Cpu,
  CreditCard,
} from "lucide-react";
import VocalWriteTextLogo from "./icons/VocalWriteTextLogo";
import VocalWriteHand from "./icons/VocalWriteHand";
import { useSettings } from "../hooks/useSettings";
import {
  GeneralSettings,
  AdvancedSettings,
  HistorySettings,
  DebugSettings,
  AboutSettings,
  PostProcessingSettings,
  ModelsSettings,
  SubscriptionSettings,
} from "./settings";

export type SidebarSection = keyof typeof SECTIONS_CONFIG;

const SIDEBAR_COPY = {
  product: "Vocrit AI",
  tagline: "Dictée vocale prête à écrire partout.",
} as const;

interface IconProps {
  width?: number | string;
  height?: number | string;
  size?: number | string;
  className?: string;
  [key: string]: any;
}

interface SectionConfig {
  labelKey: string;
  icon: React.ComponentType<IconProps>;
  component: React.ComponentType;
  enabled: (settings: any) => boolean;
}

export const SECTIONS_CONFIG = {
  general: {
    labelKey: "sidebar.general",
    icon: VocalWriteHand,
    component: GeneralSettings,
    enabled: () => true,
  },
  models: {
    labelKey: "sidebar.models",
    icon: Cpu,
    component: ModelsSettings,
    enabled: () => true,
  },
  advanced: {
    labelKey: "sidebar.advanced",
    icon: Cog,
    component: AdvancedSettings,
    enabled: () => true,
  },
  history: {
    labelKey: "sidebar.history",
    icon: History,
    component: HistorySettings,
    enabled: () => true,
  },
  postprocessing: {
    labelKey: "sidebar.postProcessing",
    icon: Sparkles,
    component: PostProcessingSettings,
    enabled: (settings) => settings?.post_process_enabled ?? false,
  },
  subscription: {
    labelKey: "sidebar.subscription",
    icon: CreditCard,
    component: SubscriptionSettings,
    enabled: () => true,
  },
  debug: {
    labelKey: "sidebar.debug",
    icon: FlaskConical,
    component: DebugSettings,
    enabled: (settings) => settings?.debug_mode ?? false,
  },
  about: {
    labelKey: "sidebar.about",
    icon: Info,
    component: AboutSettings,
    enabled: () => true,
  },
} as const satisfies Record<string, SectionConfig>;

interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const availableSections = Object.entries(SECTIONS_CONFIG)
    .filter(([_, config]) => config.enabled(settings))
    .map(([id, config]) => ({ id: id as SidebarSection, ...config }));

  return (
    <aside className="flex flex-col w-52 h-full rounded-[28px] border border-white/70 bg-[#19130c] text-white shadow-[0_24px_70px_rgba(28,18,8,0.24)] overflow-hidden">
      <div className="p-4">
        <div className="rounded-2xl bg-white px-3 py-4 shadow-inner">
          <VocalWriteTextLogo width={132} />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200/80">
            {SIDEBAR_COPY.product}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug">
            {SIDEBAR_COPY.tagline}
          </p>
        </div>
      </div>
      <nav className="flex flex-col w-full gap-1 px-3 pb-3">
        {availableSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              className={`flex gap-3 items-center px-3 py-2.5 w-full rounded-2xl text-left transition-all ${
                isActive
                  ? "bg-amber-400 text-[#19130c] shadow-lg shadow-amber-950/20"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => onSectionChange(section.id)}
            >
              <Icon width={20} height={20} className="shrink-0" />
              <p
                className="text-sm font-semibold truncate"
                title={t(section.labelKey)}
              >
                {t(section.labelKey)}
              </p>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
