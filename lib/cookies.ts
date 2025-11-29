// Utilidades para gestión de cookies

export type CookieConsent = "all" | "necessary" | null;

export const getCookieConsent = (): CookieConsent => {
  if (typeof window === "undefined") return null;
  const consent = localStorage.getItem("cookieConsent");
  return consent as CookieConsent;
};

export const setCookieConsent = (consent: CookieConsent) => {
  if (typeof window === "undefined") return;
  if (consent) {
    localStorage.setItem("cookieConsent", consent);
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
  } else {
    localStorage.removeItem("cookieConsent");
    localStorage.removeItem("cookieConsentDate");
  }
};

export const hasAnalyticsConsent = (): boolean => {
  return getCookieConsent() === "all";
};

export const hasMarketingConsent = (): boolean => {
  return getCookieConsent() === "all";
};

export const resetCookieConsent = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cookieConsent");
  localStorage.removeItem("cookieConsentDate");
};
