# Privacy Settings Implementation

## Overview
This document describes the privacy settings implementation for the Encontro com Fé app, allowing users to control their visibility and privacy preferences.

## Database Schema

### New Columns Added to `profiles` Table

```sql
-- Migration: add_privacy_settings_columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_last_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_distance BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_read_receipts BOOLEAN DEFAULT true;
```

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `show_online_status` | BOOLEAN | `true` | Controls if the user's online status is visible to others |
| `show_last_active` | BOOLEAN | `true` | Controls if the user's last active time is visible to others |
| `show_distance` | BOOLEAN | `true` | Controls if the user's distance is visible to others |
| `show_read_receipts` | BOOLEAN | `true` | Controls if read receipts are sent in messages |

## Frontend Implementation

### Settings Page (`src/features/discovery/pages/Settings.tsx`)

The settings page provides a UI for users to manage their privacy preferences:

#### State Management

```typescript
interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastActive: boolean;
  showDistance: boolean;
  showReadReceipts: boolean;
}
```

#### Persistence Strategy

1. **Optimistic Updates**: Settings are immediately updated in the UI and localStorage
2. **Database Sync**: Changes are persisted to Supabase asynchronously
3. **Error Handling**: If database sync fails, user is notified but local state remains

#### Key Functions

**`updatePrivacySetting(key, value)`**
- Updates a specific privacy setting
- Saves to localStorage for instant feedback
- Syncs to Supabase database
- Shows toast notification on success/error

```typescript
const updatePrivacySetting = async (key: keyof PrivacySettings, value: boolean) => {
  // 1. Optimistic Update
  const newSettings = { ...privacySettings, [key]: value };
  setPrivacySettings(newSettings);
  localStorage.setItem(`privacy_settings_${user?.id}`, JSON.stringify(newSettings));

  // 2. Persist to Supabase
  const dbKeyMap: Record<keyof PrivacySettings, string> = {
    showOnlineStatus: 'show_online_status',
    showLastActive: 'show_last_active',
    showDistance: 'show_distance',
    showReadReceipts: 'show_read_receipts'
  };

  const { error } = await supabase
    .from('profiles')
    .update({ [dbKeyMap[key]]: value })
    .eq('user_id', user?.id);

  if (error) throw error;
  toast.success('Configuração salva');
};
```

## Other Settings

### Sound Settings
- **Storage**: Zustand store with persistence
- **Hook**: `useSoundSettings` from `@/hooks/useSoundSettings`
- **Controls**: Notification sounds for messages and matches

### Push Notifications
- **Storage**: localStorage (`notifications_enabled_{userId}`)
- **Controls**: Push notification alerts

### Account Actions
- **Change Password**: Updates user password via Supabase Auth
- **Sign Out**: Logs user out and redirects to login
- **Deactivate Account**: Sets `is_active = false` in profiles table

## How Privacy Settings Affect the App

### 1. Online Status (`show_online_status`)
**When disabled:**
- User appears offline to others
- Other users cannot see real-time online indicator
- User can still use the app normally

**Implementation needed in:**
- Profile cards in discovery
- Match list
- Chat interface

### 2. Last Active (`show_last_active`)
**When disabled:**
- "Last seen" timestamp is hidden from others
- User's activity time is not displayed

**Implementation needed in:**
- Profile cards
- Chat headers
- Match details

### 3. Distance (`show_distance`)
**When disabled:**
- Distance information is hidden from other users
- User's approximate location is not revealed
- Location-based matching still works

**Implementation needed in:**
- Profile cards in discovery
- Match profiles

### 4. Read Receipts (`show_read_receipts`)
**When disabled:**
- Other users don't see when this user read their messages
- User can still see read receipts from others (if they have it enabled)

**Implementation needed in:**
- Chat message component
- Message status indicators

## Next Steps

To fully implement privacy settings, the following components need to be updated:

1. **Profile Card Component** - Respect `show_online_status`, `show_last_active`, `show_distance`
2. **Chat Component** - Respect `show_read_receipts`
3. **Discovery Feed** - Filter based on privacy settings
4. **Match List** - Show/hide information based on settings

## Testing Checklist

- [ ] Privacy settings save to database correctly
- [ ] Settings persist across sessions
- [ ] Optimistic updates work smoothly
- [ ] Error handling shows appropriate messages
- [ ] Online status respects privacy setting
- [ ] Last active time respects privacy setting
- [ ] Distance respects privacy setting
- [ ] Read receipts respect privacy setting
- [ ] Settings load correctly on page mount
- [ ] localStorage and database stay in sync

## Security Considerations

- Privacy settings are stored per-user in the database
- Settings are validated on the backend (RLS policies)
- Users can only modify their own privacy settings
- Default values are privacy-friendly (all enabled by default)
