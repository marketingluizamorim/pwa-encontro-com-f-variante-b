/**
 * Haptic feedback utilities using the Web Vibration API.
 * Falls back gracefully on unsupported devices.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20], // short pause long
  error: [50, 30, 50, 30, 50], // three strong pulses
  warning: [30, 50, 30], // two medium pulses
};

/**
 * Trigger haptic feedback if supported by the device.
 * @param pattern - The type of haptic feedback to trigger
 * @returns true if vibration was triggered, false otherwise
 */
export function triggerHaptic(pattern: HapticPattern = 'medium'): boolean {
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return false;
  }

  try {
    return navigator.vibrate(patterns[pattern]);
  } catch {
    return false;
  }
}

/**
 * Cancel any ongoing vibration.
 */
export function cancelHaptic(): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(0);
  }
}
