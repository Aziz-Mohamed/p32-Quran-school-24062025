# Setup Guide

Step-by-step instructions to get the Quran School app running locally.

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org) |
| npm | >= 9 | Bundled with Node.js |
| Expo CLI | Latest | No install needed — use `npx expo` |
| Supabase CLI | >= 1.x | `brew install supabase/tap/supabase` or see [docs](https://supabase.com/docs/guides/cli/getting-started) |
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) (required for local Supabase) |
| Xcode | >= 15 | Mac App Store (macOS only, for iOS Simulator) |
| Android Studio | Latest | [developer.android.com](https://developer.android.com/studio) (for Android emulator) |
| Git | >= 2.x | Pre-installed on macOS |

## Clone and Install

```bash
git clone <repo-url>
cd quran-school
npm install
```

For iOS builds (macOS only), install CocoaPods dependencies:

```bash
cd ios && pod install && cd ..
```

> This is only needed after cloning, or after adding/removing native dependencies.

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

The `.env` file needs two variables:

| Variable | Description | Local Value |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase API URL | `http://127.0.0.1:54321` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Printed by `supabase start` |

> `.env` is gitignored. Never commit credentials.

## Local Supabase Setup

Local Supabase runs PostgreSQL, Auth, Storage, Realtime, and Studio in Docker containers.

### 1. Start Supabase

Make sure Docker Desktop is running, then:

```bash
supabase start
```

This will pull Docker images on first run (may take a few minutes). On success, it prints:

```
API URL:       http://127.0.0.1:54321
GraphQL URL:   http://127.0.0.1:54321/graphql/v1
S3 Storage:    http://127.0.0.1:54321/storage/v1/s3
DB URL:        postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:    http://127.0.0.1:54323
Inbucket URL:  http://127.0.0.1:54324
anon key:      eyJ...
service_role key: eyJ...
```

Copy the `anon key` value into your `.env` file as `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Apply Migrations and Seed Data

```bash
supabase db reset
```

This runs all migrations in `supabase/migrations/` in order:
- `00001_consolidated_schema.sql` — Full schema (20 tables, functions, RLS policies, indexes, triggers) plus seed data (240 Quran rub' reference rows, sticker catalog)
- `00002_storage_buckets.sql` — Storage buckets for sticker/reward images
- `00003_cleanup_dead_code.sql` — Removes unused triggers

> Note: `seed.sql` is intentionally empty. All reference data is embedded in the consolidated migration for portability.

### 3. Browse with Supabase Studio

Open http://127.0.0.1:54323 to:
- Browse tables and their data
- Run SQL queries in the SQL editor
- View auth users
- Test RLS policies
- Inspect storage buckets

### 4. Stopping Supabase

```bash
supabase stop              # Preserves database data
supabase stop --no-backup  # Destroys all data (clean start next time)
```

## Running the App

```bash
# Start Expo dev server (interactive menu)
npm start

# Or run directly on a platform:
npm run ios       # Builds and opens in iOS Simulator
npm run android   # Builds and opens in Android emulator
npm run web       # Opens in browser
```

> `npm run ios` and `npm run android` create native development builds. For quick iteration without native changes, use `npm start` and press `i` (iOS), `a` (Android), or `w` (web).

## Creating Your First School

1. Start the app — you'll land on the login screen
2. Tap **"Create New School"**
3. Fill in:
   - School name (English; optionally Arabic)
   - Admin full name
   - Username (lowercase, alphanumeric, underscores)
   - Password (min 6 characters)
4. On success, you're automatically logged in as the school admin
5. The school slug (used for login) is auto-generated from the school name

## Creating Test Users

Once logged in as admin:

**Teachers**: Admin Dashboard > Teachers > Create Teacher
- Set full name, username, password
- Optionally assign to a class

**Students**: Admin Dashboard > Students > Create Student
- Set full name, username, password
- Assign to a class (required for scheduling)
- Optionally link to a parent

**Parents**: Admin Dashboard > Parents > Create Parent
- Set full name, username, password
- Link to children (students) after creation

**Logging in as a test user**:
- Username: whatever you set during creation
- School slug: shown on the admin dashboard header
- Password: whatever you set during creation

> Tip: The create-school screen has dev quick-login buttons for fast testing with different roles.

## Edge Functions (Local Development)

Edge Functions run in Deno. To serve them locally:

```bash
supabase functions serve
```

This starts all functions at `http://127.0.0.1:54321/functions/v1/<function-name>`.

Available functions:
| Function | Purpose |
|---|---|
| `create-school` | School + admin account creation |
| `create-member` | Admin creates new users |
| `reset-member-password` | Admin resets a member's password |
| `generate-sessions` | Generate scheduled sessions from class schedules |
| `send-notification` | Dispatch push notifications |
| `teacher-daily-summary` | Generate daily teacher summary |

## Connecting to Remote Supabase

For testing against a hosted Supabase project instead of local:

1. Update `.env`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-project-anon-key>
   ```

2. Ensure migrations have been applied to the remote database:
   ```bash
   supabase db push
   ```

3. Restart the dev server to pick up the new env vars:
   ```bash
   npx expo start --clear
   ```

## EAS Build (Distribution)

The project uses [EAS Build](https://docs.expo.dev/build/introduction/) for native builds. Configuration is in `eas.json`.

| Profile | Purpose | Distribution |
|---|---|---|
| `development` | Dev client with hot reload | Internal (team only) |
| `preview` | Testing build | Internal (team only) |
| `production` | Release build | App stores |

```bash
# Build for iOS
npx eas build --profile development --platform ios

# Build for Android
npx eas build --profile preview --platform android

# Production build
npx eas build --profile production --platform all
```

## Troubleshooting

### "Missing EXPO_PUBLIC_SUPABASE_URL"
- Ensure `.env` exists in the project root with both variables set
- Restart the dev server after creating/modifying `.env`

### Supabase CLI: "Cannot connect to Docker"
- Ensure Docker Desktop is running: `docker ps`
- On macOS, check that Docker has sufficient resources allocated (4GB+ RAM recommended)

### iOS build fails with CocoaPods errors
```bash
cd ios && pod install --repo-update && cd ..
```

### Android build fails with SDK errors
- Ensure `ANDROID_HOME` is set in your shell profile
- Open Android Studio > SDK Manager > install required SDK versions

### RLS policy errors ("permission denied for table ...")
- Verify the user has a profile row in the `profiles` table
- Check that the profile's `school_id` matches the target data's `school_id`
- Use Supabase Studio (SQL editor) to verify: `SELECT * FROM profiles WHERE id = '<user-id>'`

### RTL layout not applying after language switch
- RTL requires a full app restart (not just hot reload)
- Quit the app completely and reopen it
- Verify with: `import { I18nManager } from 'react-native'; console.log(I18nManager.isRTL)`

### Realtime not connecting
- Ensure `realtime` is enabled in `supabase/config.toml` (`enabled = true`)
- Check that relevant tables are added to the Realtime publication
- Look at Supabase logs: `supabase logs --service realtime`

### "crypto.getRandomValues is not supported"
- This can happen on older React Native versions. The project uses RN 0.81.5 which supports the Web Crypto API natively.
- Ensure you're not accidentally using an older bundled polyfill.
