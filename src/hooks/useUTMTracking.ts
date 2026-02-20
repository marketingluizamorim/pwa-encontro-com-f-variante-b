const UTM_STORAGE_KEY = 'ecf_utm_params';
const UTM_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  src?: string;
  sck?: string;
  capturedAt?: number;
}

/** Read UTM params from the current URL and persist them in localStorage. */
export function useUTMTracking(): UTMParams {
  if (typeof window === 'undefined') return {};

  const search = new URLSearchParams(window.location.search);
  const hasUtm =
    search.has('utm_source') || search.has('src') || search.has('sck');

  if (hasUtm) {
    const params: UTMParams = {
      utm_source: search.get('utm_source') ?? undefined,
      utm_medium: search.get('utm_medium') ?? undefined,
      utm_campaign: search.get('utm_campaign') ?? undefined,
      utm_content: search.get('utm_content') ?? undefined,
      utm_term: search.get('utm_term') ?? undefined,
      src: search.get('src') ?? undefined,
      sck: search.get('sck') ?? undefined,
      capturedAt: Date.now(),
    };

    try {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
    } catch {
      // storage unavailable
    }

    return params;
  }

  return getStoredUTMParams();
}

/** Retrieve previously stored UTM params (within TTL). */
export function getStoredUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};

    const parsed: UTMParams = JSON.parse(raw);
    const age = Date.now() - (parsed.capturedAt ?? 0);
    if (age > UTM_TTL_MS) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}
