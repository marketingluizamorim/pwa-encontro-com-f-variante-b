# Original Prices Backup (2026-02-22)

Use this file to restore original prices after testing.

## Plans (PlansGrid.tsx & create-payment/index.ts)
- Bronze: 12.90 (7 dias)
- Silver: 29.90 (Mais escolhido)
- Gold: 49.90 (Economia Completa)
- Special Offer: 15.90 (create-payment/index.ts reference)
- Special Reference: 15.90


## Special Offer (Plans.tsx)
- Special Offer: 14.90
- Gold Plan Reference: 49.90

## Timer (PlansGrid.tsx)
- Default: 7:34 (454 seconds)

## Subscriptions Durations (woovi-webhook/index.ts)
### ORIGINAL:
- Bronze: 7 days (+ 7 * 24 * 60 * 60 * 1000)
- Silver/Gold: 30 days (+ 30 * 24 * 60 * 60 * 1000)
- Special Offer: 90 days (+ 90 * 24 * 60 * 60 * 1000)

### TEST (ACTIVE):
- Bronze: 10 minutes (+ 10 * 60 * 1000)
- Silver: 20 minutes (+ 20 * 60 * 1000)
- Gold: 30 minutes (+ 30 * 60 * 1000)

