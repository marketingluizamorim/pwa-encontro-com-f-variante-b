import { triggerHaptic } from './haptics';
import { useSoundSettings } from '@/hooks/useSoundSettings';

// Check if sounds are muted
function isMuted(): boolean {
  return useSoundSettings.getState().isMuted;
}

// Audio context for generating notification sounds
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Generate a pleasant notification sound using Web Audio API
function playNotificationBeep(frequency = 800, duration = 0.15) {
  try {
    const ctx = getAudioContext();

    // Resume context if suspended (required for user interaction policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope for a pleasant sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

// Play a two-tone notification (more pleasant)
function playTwoToneNotification() {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);

    // Second tone (higher)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.25);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

// Match notification sound (celebratory)
function playMatchSound() {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  } catch (error) {
    console.warn('Could not play match sound:', error);
  }
}

// Notification types with sound and haptic feedback
export type NotificationType = 'message' | 'match' | 'like';

export function playNotification(type: NotificationType = 'message') {
  // Always trigger haptic feedback, only skip sound if muted
  const muted = isMuted();

  switch (type) {
    case 'message':
      if (!muted) playTwoToneNotification();
      triggerHaptic('light');
      break;
    case 'match':
      if (!muted) playMatchSound();
      triggerHaptic('success');
      break;
    case 'like':
      if (!muted) playNotificationBeep(659.25, 0.1); // E5
      triggerHaptic('medium');
      break;
    default:
      if (!muted) playNotificationBeep();
      triggerHaptic('light');
  }
}

// Initialize audio context on first user interaction
export function initializeAudio() {
  const handleInteraction = () => {
    getAudioContext();
    document.removeEventListener('click', handleInteraction);
    document.removeEventListener('touchstart', handleInteraction);
  };

  document.addEventListener('click', handleInteraction, { once: true });
  document.addEventListener('touchstart', handleInteraction, { once: true });
}
