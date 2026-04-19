import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useSubscription } from "../../../hooks/useSubscription";
import { SettingsGroup } from "../../ui/SettingsGroup";

function tierLabel(tier: string | undefined, t: (k: string) => string): string {
  switch (tier) {
    case "premium":
      return t("subscription.tier.premium");
    case "admin_free":
      return t("subscription.tier.adminFree");
    default:
      return t("subscription.tier.free");
  }
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export const SubscriptionSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    status,
    loading,
    error,
    activate,
    deactivate,
    initiatePayment,
    checkPayment,
  } = useSubscription();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const usagePct =
    status && status.monthly_char_limit > 0
      ? Math.min(
          100,
          Math.round(
            (status.monthly_chars_used / status.monthly_char_limit) * 100,
          ),
        )
      : 0;

  const handleStartPayment = async () => {
    try {
      const session = await initiatePayment(email, phone);
      setSessionId(session.session_id);
      await openUrl(session.checkout_url);
    } catch (e) {
      console.error("Failed to start payment", e);
    }
  };

  const handleVerify = async () => {
    if (!sessionId) return;
    try {
      await checkPayment(sessionId);
    } catch (e) {
      console.error("Payment verification failed", e);
    }
  };

  const handleActivate = async () => {
    try {
      await activate(email, licenseKey);
      setLicenseKey("");
    } catch (e) {
      console.error("License activation failed", e);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <SettingsGroup title={t("subscription.title")}>
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-mid-gray">
              {t("subscription.currentPlan")}
            </span>
            <span className="font-medium">{tierLabel(status?.tier, t)}</span>
          </div>

          {status?.email && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-mid-gray">
                {t("subscription.account")}
              </span>
              <span className="font-medium">{status.email}</span>
            </div>
          )}

          {status?.expires_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-mid-gray">
                {t("subscription.expiresOn")}
              </span>
              <span className="font-medium">
                {formatDate(status.expires_at, i18n.language)}
              </span>
            </div>
          )}

          {status && !status.is_unlimited && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t("subscription.quotaLabel")}</span>
                <span className="text-mid-gray">
                  {status.monthly_chars_used.toLocaleString()} /{" "}
                  {status.monthly_char_limit.toLocaleString()}{" "}
                  {t("subscription.chars")}
                </span>
              </div>
              <div className="w-full h-2 bg-mid-gray/20 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usagePct >= 90 ? "bg-red-500" : "bg-logo-primary"
                  }`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>
          )}

          {status?.is_unlimited && (
            <p className="text-sm text-green-600">
              {status.tier === "admin_free"
                ? t("subscription.adminFreeNote")
                : t("subscription.unlimitedNote")}
            </p>
          )}
        </div>
      </SettingsGroup>

      {status && !status.is_unlimited && (
        <SettingsGroup title={t("subscription.subscribeTitle")}>
          <div className="flex flex-col gap-3 p-1">
            <p className="text-sm text-mid-gray">
              {t("subscription.subscribeBlurb", {
                price: status.price_xof.toLocaleString(),
                currency: status.price_currency,
              })}
            </p>

            <label className="flex flex-col gap-1 text-sm">
              <span>{t("subscription.emailLabel")}</span>
              <input
                type="email"
                className="border border-mid-gray/40 rounded px-2 py-1 bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span>{t("subscription.phoneLabel")}</span>
              <input
                type="tel"
                className="border border-mid-gray/40 rounded px-2 py-1 bg-background"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
              />
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleStartPayment}
                disabled={loading || !email || !phone}
                className="bg-logo-primary text-white rounded px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                {loading
                  ? t("subscription.processing")
                  : t("subscription.payCta")}
              </button>
              {sessionId && (
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="border border-mid-gray/40 rounded px-3 py-2 text-sm font-medium"
                >
                  {t("subscription.verifyPayment")}
                </button>
              )}
            </div>
          </div>
        </SettingsGroup>
      )}

      <SettingsGroup title={t("subscription.licenseTitle")}>
        <div className="flex flex-col gap-3 p-1">
          <p className="text-sm text-mid-gray">
            {t("subscription.licenseBlurb")}
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span>{t("subscription.emailLabel")}</span>
            <input
              type="email"
              className="border border-mid-gray/40 rounded px-2 py-1 bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>{t("subscription.licenseKeyLabel")}</span>
            <input
              type="text"
              className="border border-mid-gray/40 rounded px-2 py-1 bg-background font-mono"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="VOCRIT-XXXX-XXXX-XXXX"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleActivate}
              disabled={loading || !email || !licenseKey}
              className="bg-logo-primary text-white rounded px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              {t("subscription.activateCta")}
            </button>
            {status?.tier !== "free" && (
              <button
                onClick={deactivate}
                disabled={loading}
                className="border border-mid-gray/40 rounded px-3 py-2 text-sm font-medium"
              >
                {t("subscription.deactivateCta")}
              </button>
            )}
          </div>
        </div>
      </SettingsGroup>

      {error && (
        <p className="text-sm text-red-500">
          {t("subscription.errorPrefix")}: {error}
        </p>
      )}
    </div>
  );
};
