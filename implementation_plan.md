# Full-Stack Settings Module Implementation

Transform the prototype settings UI into a production-ready settings system with full backend integration.

## User Review Required
> [!IMPORTANT]
> The current `DashboardView.tsx` is over 1,300 lines long. To keep the code maintainable, I propose extracting the settings UI into a dedicated `src/components/settings/` directory with separate components for each settings section (Profile, Security, APIs, etc.). The visual design will remain exactly the same.

## Open Questions
> [!NOTE]
> - Are there any specific encryption requirements for the API keys (e.g. standard AES-256-CBC with an env secret)?
> - Should "Logout Other Devices" actively terminate their socket connections, or just invalidate their JWTs? (I will plan to invalidate JWTs by adding a `tokenVersion` or managing active sessions in DB).

## Proposed Changes

---

### Backend: Models
#### [NEW] `backend/src/models/UserSettings.js`
- Create a Mongoose schema linked to `User` via `userId`.
- Include fields for: `preferences` (research depth, default model, etc.), `notifications` (email, weekly summary, etc.), `theme`, `security` (2FA enabled), `apiKeys` (encrypted), `analysis` (auto-save, threshold, etc.), `runtime` (socket streaming, quota alerts, etc.), and `workspace` (name, description, logo).

### Backend: Controllers & Routes
#### [NEW] `backend/src/controllers/settingsController.js`
- Implement robust REST endpoints to handle settings updates.
- Functions: `getSettings`, `updateProfile`, `updatePassword`, `updatePreferences`, `updateSecurity`, `updateRuntime`, `updateTheme`, `updateNotifications`, `updateApiKeys`, `updateWorkspace`, `deleteAccount`.
- Use `bcryptjs` for password hashing and verification.
- Use symmetric encryption for API keys (e.g. `crypto` module).

#### [NEW] `backend/src/routes/settingsRoutes.js`
- Define `GET` and `PUT`/`DELETE` endpoints routing to the controller.
- Protected by existing JWT auth middleware.

#### [MODIFY] `backend/src/server.js` (or `app.js`)
- Mount the new `/api/settings` route.

---

### Frontend: State & Validation
#### [NEW] `src/lib/validations/settings.ts`
- Create Zod schemas for all settings forms:
  - `profileSchema` (name, email, bio, company, country, timezone)
  - `passwordSchema` (min 8 chars, uppercase, lowercase, number, special char)
  - `preferencesSchema`, `apiKeysSchema`, etc.

#### [NEW] `src/api/settingsApi.ts`
- Create Axios API wrapper functions for all backend endpoints.

#### [NEW] `src/hooks/useSettings.ts`
- Create TanStack Query (`useQuery` / `useMutation`) hooks to handle data fetching, optimistic UI updates, and loading states for settings.

---

### Frontend: Components
#### [MODIFY] `src/components/DashboardView.tsx`
- Remove the inline `SettingsPane` and replace it with an import from the new modular structure.

#### [NEW] `src/components/settings/SettingsLayout.tsx`
- The main container for settings, maintaining the exact current UI layout.

#### [NEW] `src/components/settings/sections/...`
- Extract individual sections to keep components small:
  - `ProfileSettings.tsx` (React Hook Form integration)
  - `PasswordSettings.tsx` (React Hook Form + validation)
  - `WorkspaceSettings.tsx`
  - `NotificationSettings.tsx`
  - `ApiKeysSettings.tsx` (Show/Hide, Copy, Test Connection)
  - `AccountManagement.tsx` (Export data, Delete account flow)

## Verification Plan

### Automated Tests
- Run TypeScript compiler to ensure no strict type errors in the new modular structure.
- Run `vite build` to verify production readiness.

### Manual Verification
1. **Profile:** Update name/bio, verify the backend stores it, and the UI shows a success toast.
2. **Password:** Attempt to change the password. Verify Zod blocks weak passwords. Verify the backend requires the correct *current* password, hashes the new one, and logs out old sessions.
3. **API Keys:** Save an API key. Verify it is encrypted in MongoDB. Reload the page and ensure the UI masks the key.
4. **Account Deletion:** Verify the soft-delete/permanent-delete two-step modal works and hits the `DELETE` endpoint.
