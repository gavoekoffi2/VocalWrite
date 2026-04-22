import React from "react";
import { useTranslation } from "react-i18next";
import { type } from "@tauri-apps/plugin-os";
import {
  Keyboard,
  Mic2,
  MousePointer2,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MicrophoneSelector } from "../MicrophoneSelector";
import { ShortcutInput } from "../ShortcutInput";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { OutputDeviceSelector } from "../OutputDeviceSelector";
import { PushToTalk } from "../PushToTalk";
import { AudioFeedback } from "../AudioFeedback";
import { useSettings } from "../../../hooks/useSettings";
import { VolumeSlider } from "../VolumeSlider";
import { MuteWhileRecording } from "../MuteWhileRecording";
import { ModelSettingsCard } from "./ModelSettingsCard";

const COPY = {
  badge: "Configuration essentielle",
  title: "Votre assistant de dictée est prêt",
  description:
    "Choisissez le raccourci clavier, gardez le mode appuyer-pour-parler, puis dictez dans n'importe quel logiciel. Le texte est collé automatiquement à l'endroit du curseur.",
  primaryStep: "Maintenir le raccourci",
  primaryStepDetail: "Parlez pendant que l'animation est visible.",
  secondaryStep: "Relâcher",
  secondaryStepDetail: "Vocrit transcrit puis colle le texte.",
  cards: [
    {
      title: "Raccourci",
      value: "Personnalisable",
      description: "Changez les touches selon votre habitude.",
    },
    {
      title: "Microphone",
      value: "Auto",
      description: "Sélectionnez un micro si l'ordinateur en a plusieurs.",
    },
    {
      title: "Collage",
      value: "Direct",
      description: "La transcription arrive dans l'application active.",
    },
  ],
  workflowTitle: "Utilisation rapide",
  settingsTitle: "Réglages prioritaires",
  soundTitle: "Audio et retour utilisateur",
} as const;

export const GeneralSettings: React.FC = () => {
  const { t } = useTranslation();
  const { audioFeedbackEnabled, getSetting, settings } = useSettings();
  const pushToTalk = getSetting("push_to_talk");
  const isLinux = type() === "linux";
  const currentShortcut =
    settings?.bindings?.transcribe?.current_binding?.replaceAll("+", " + ") ||
    "Ctrl + Space";

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-amber-900/10 bg-[#22170d] text-white shadow-[0_28px_80px_rgba(50,30,12,0.22)]">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-80 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative grid gap-6 p-6 md:grid-cols-[1.45fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-100">
              <ShieldCheck className="h-4 w-4" />
              <span>{COPY.badge}</span>
            </div>
            <h1 className="mt-5 max-w-xl text-3xl font-black leading-tight tracking-tight md:text-4xl">
              {COPY.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              {COPY.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-amber-300 px-4 py-3 text-[#22170d] shadow-lg shadow-black/20">
                <p className="text-xs font-bold uppercase tracking-[0.2em]">
                  {t("sidebar.general")}
                </p>
                <p className="mt-1 font-mono text-lg font-black">
                  {currentShortcut}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                  {t("settings.general.pushToTalk.label")}
                </p>
                <p className="mt-1 text-lg font-black">
                  {pushToTalk ? "Actif" : "Mode bascule"}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-100">
              {COPY.workflowTitle}
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3 rounded-2xl bg-white/10 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-[#22170d]">
                  <Keyboard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{COPY.primaryStep}</p>
                  <p className="text-xs leading-5 text-white/60">
                    {COPY.primaryStepDetail}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-2xl bg-white/10 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#22170d]">
                  <MousePointer2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{COPY.secondaryStep}</p>
                  <p className="text-xs leading-5 text-white/60">
                    {COPY.secondaryStepDetail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {COPY.cards.map((card, index) => {
          const Icon = [Keyboard, Mic2, Sparkles][index] ?? Settings2;
          return (
            <div
              key={card.title}
              className="rounded-3xl border border-amber-900/10 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[#22170d] px-3 py-1 text-xs font-bold text-amber-100">
                  {card.value}
                </span>
              </div>
              <h3 className="mt-4 text-base font-black">{card.title}</h3>
              <p className="mt-1 text-sm leading-5 text-mid-gray">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      <SettingsGroup title={COPY.settingsTitle}>
        <ShortcutInput shortcutId="transcribe" grouped={true} />
        <PushToTalk descriptionMode="tooltip" grouped={true} />
        {!isLinux && !pushToTalk && (
          <ShortcutInput shortcutId="cancel" grouped={true} />
        )}
      </SettingsGroup>
      <ModelSettingsCard />
      <SettingsGroup title={COPY.soundTitle}>
        <MicrophoneSelector descriptionMode="tooltip" grouped={true} />
        <MuteWhileRecording descriptionMode="tooltip" grouped={true} />
        <AudioFeedback descriptionMode="tooltip" grouped={true} />
        <OutputDeviceSelector
          descriptionMode="tooltip"
          grouped={true}
          disabled={!audioFeedbackEnabled}
        />
        <VolumeSlider disabled={!audioFeedbackEnabled} />
      </SettingsGroup>
    </div>
  );
};
