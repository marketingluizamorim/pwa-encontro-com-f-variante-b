export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/**
 * UTM Tracking Hook - Disabled by user request.
 * Returns empty object.
 */
export function useUTMTracking() {
  return {};
}

/**
 * Get stored UTM params - Disabled by user request.
 * Returns empty object.
 */
export function getStoredUTMParams(): UTMParams {
  return {};
}
