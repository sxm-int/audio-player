# Premium Content Gating PR review

## Description

### Overview
This PR adds premium content restrictions to the audio player. Non-premium users see an upgrade modal when attempting to play premium tracks.

### Changes
- **Premium Badge**: Premium tracks display a "Premium" badge in the playlist
- **Upgrade Modal**: Prompts users to upgrade when playing premium content
- **Toast Notifications**: Shows success/error messages after upgrade attempts
- **Auto-play**: Premium track plays automatically after successful upgrade

### Technical Details
- Integrates with mock `/upgrade` API endpoint
- Modal manages focus trap and keyboard navigation
- Toast auto-dismisses after 5 seconds

## Testing Steps
Add PASS or FAIL to each step

### Premium Modal Flow
1. "Premium" badge → Shows on premium tracks
2. **Play a non-premium track** → Audio starts playing
3. **Play a premium track** → Modal opens
   - Premium track does NOT play
   - Modal shows track title, upgrade button, and "X" close button

### Modal Dismissal
4. **Click "X" or press Escape key** → Modal closes

### Upgrade Success Path
5. **Click "Upgrade Now"** → Button text changes to 'Upgrading...'
   - Premium track starts playing
   - Modal closes
   - Toast shows success message (auto-dismisses in 5 seconds)

### Upgrade Error Path 
NOTE: Modify `/upgrade` endpoint in handlers.ts to return an error.
6. **Click "Upgrade Now"** → Button text changes to 'Upgrading...'
   - Premium track does NOT play
   - Modal closes
   - Toast shows error message (auto-dismisses in 5 seconds)