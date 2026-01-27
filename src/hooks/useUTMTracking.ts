import { useEffect, useState } from 'react';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const UTM_STORAGE_KEY = 'encontro_utm_params';

export function useUTMTracking() {
  const [utmParams, setUtmParams] = useState<UTMParams>({});

  useEffect(() => {
    // Check URL for UTM params
    const urlParams = new URLSearchParams(window.location.search);
    const newUtmParams: UTMParams = {};
    
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
    
    utmKeys.forEach((key) => {
      const value = urlParams.get(key);
      if (value) {
        newUtmParams[key] = value;
      }
    });

    // If we have new UTM params, save them
    if (Object.keys(newUtmParams).length > 0) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(newUtmParams));
      setUtmParams(newUtmParams);
    } else {
      // Try to load from localStorage
      const stored = localStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        try {
          setUtmParams(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing UTM params from localStorage:', e);
        }
      }
    }
  }, []);

  return utmParams;
}

export function getStoredUTMParams(): UTMParams {
  const stored = localStorage.getItem(UTM_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return {};
    }
  }
  return {};
}
