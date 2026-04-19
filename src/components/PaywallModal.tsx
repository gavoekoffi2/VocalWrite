import React from "react";
import { useTranslation } from "react-i18next";
import { PaywallEvent } from "../hooks/useSubscription";

interface Props {
  event: PaywallEvent;
  onDismiss: () => void;
  onOpenSubscription: () => void;
}

export const PaywallModal: React.FC<Props> = ({
  event,
  onDismiss,
  onOpenSubscription,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("paywall.title")}</h2>
        <p className="text-sm text-mid-gray">{t("paywall.description")}</p>
        {event.transcript_in_clipboard && (
          <div className="text-xs bg-mid-gray/10 rounded p-3">
            {t("paywall.clipboardNotice", { count: event.blocked_text_length })}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onDismiss}
            className="border border-mid-gray/40 rounded px-3 py-2 text-sm"
          >
            {t("paywall.dismiss")}
          </button>
          <button
            onClick={onOpenSubscription}
            className="bg-logo-primary text-white rounded px-3 py-2 text-sm font-medium"
          >
            {t("paywall.subscribeCta")}
          </button>
        </div>
      </div>
    </div>
  );
};
