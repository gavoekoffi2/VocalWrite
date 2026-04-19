import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type SubscriptionTier = "free" | "premium" | "admin_free";

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  email: string | null;
  expires_at: string | null;
  monthly_chars_used: number;
  monthly_char_limit: number;
  remaining_chars: number;
  is_unlimited: boolean;
  quota_window_started_at: string | null;
  price_xof: number;
  price_currency: string;
}

export interface PaymentSession {
  session_id: string;
  checkout_url: string;
  amount_xof: number;
  currency: string;
  provider: string;
}

export interface PaywallEvent {
  reason: string;
  blocked_text_length: number;
  transcript_in_clipboard: boolean;
}

/**
 * React hook that mirrors the Rust-side subscription state to the UI,
 * exposes the paywall callbacks, and listens for paywall events so the
 * screen can react when a transcription is blocked by quota.
 */
export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [paywall, setPaywall] = useState<PaywallEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await invoke<SubscriptionStatus>("get_subscription_status");
      setStatus(s);
    } catch (e) {
      console.warn("Failed to load subscription status", e);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unlistenStatus = listen<SubscriptionStatus>(
      "subscription-status-changed",
      (event) => setStatus(event.payload),
    );
    const unlistenPaywall = listen<PaywallEvent>(
      "subscription-paywall-required",
      (event) => setPaywall(event.payload),
    );

    return () => {
      unlistenStatus.then((fn) => fn());
      unlistenPaywall.then((fn) => fn());
    };
  }, [refresh]);

  const activate = useCallback(async (email: string, licenseKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const s = await invoke<SubscriptionStatus>("activate_license", {
        email,
        licenseKey,
      });
      setStatus(s);
      setPaywall(null);
      return s;
    } catch (e) {
      const msg = typeof e === "string" ? e : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await invoke<SubscriptionStatus>("deactivate_license");
      setStatus(s);
      return s;
    } catch (e) {
      const msg = typeof e === "string" ? e : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const initiatePayment = useCallback(async (email: string, phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await invoke<PaymentSession>(
        "initiate_subscription_payment",
        { email, phone },
      );
      return session;
    } catch (e) {
      const msg = typeof e === "string" ? e : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPayment = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const s = await invoke<SubscriptionStatus>("check_payment_and_activate", {
        sessionId,
      });
      setStatus(s);
      setPaywall(null);
      return s;
    } catch (e) {
      const msg = typeof e === "string" ? e : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    paywall,
    loading,
    error,
    refresh,
    activate,
    deactivate,
    initiatePayment,
    checkPayment,
    dismissPaywall: () => setPaywall(null),
  };
}
