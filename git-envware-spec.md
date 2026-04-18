# git-envware Specification

## CLI Name
- **Binary:** `git-envware`
- **Command:** `git envware <command>`
- **Mode:** Must run under a Git repository with remote configured

## Core Concepts

### Identity
- Users identified by **SSH key** (no email required for CLI)
- User created automatically on first `init` if not exists

### Project
- **ID:** Git remote URL (e.g., `https://github.com/org/repo.git`)
- Unique per remote - cannot exist in multiple teams
- Created automatically on `init` if not exists

### Team
- Represents company/organization
- Contains multiple projects
- Billing is at team level

### Roles (hierarchical)
| Role   | Push (encrypt) | Pull (decrypt) |
|--------|---------------|----------------|
| Owner  | ✅ All .env.* | ✅ All .env.* |
| Admin  | ✅ All .env.* | ✅ All .env.* |
| Dev    | ✅ All .env.* | ✅ .env.development only |
| Test   | ❌ No         | ✅ .env.test only |

## Free Tier Limits
- **1 Team** (Personal)
- **3 Projects** per team
- **3 Users** per project

## Paid Packs

### Team Pack (10)
- +10 teams
- Each team includes: 3 projects + 3 users per project

### Project Pack (10)
- +10 projects in a team
- Each project includes: 3 users

### User Pack (10)
- +10 users in a project

## Commands

### `git envware init`
Setup project in current Git repo.
1. Verify Git repo exists
2. Verify remote is configured
3. Check/create user (by SSH key)
4. Check if project exists by remote
   - If exists and user is owner/member → error "already initialized"
   - If exists but user not member → warn "run git envware request"
   - If not exists → create project (user becomes owner)
5. Check team limits (max 3 projects for free)
6. If user has no team → create "Personal" team

### `git envware push`
Encrypt and sync secrets.
1. Verify Git repo + remote
2. Check user role in project
3. Validate `.gitignore`:
   - `.env*` MUST be in `.gitignore` (required)
   - `.env.crypto` MUST NOT be in `.gitignore` (will lose secrets!)
4. Encrypt files (according to role):
   - `.env`
   - `.env.development`
   - `.env.production`
   - `.env.test`
   - `.env.local`
5. Push to API

### `git envware pull`
Sync and decrypt secrets.
1. Verify Git repo + remote
2. Check user role in project
3. Pull encrypted files from API
4. Decrypt according to role:
   - Owner/Admin: all files
   - Dev: `.env.development` only
   - Test: `.env.test` only
5. Save decrypted files

### `git envware request [role]`
Request access to project.
- Roles available: `dev`, `test`, `admin`
- Generates request with fingerprint
- User must send fingerprint to owner via other channel

### `git envware accept <fingerprint> [team] [project] [role]`
Approve access request.
- Owner uses fingerprint to identify requester
- Assigns role (dev/test/admin)
- Adds user to project

### `git envware status`
Show current status.
- **Owner:** Shows billing info, packs purchased, teams count, projects
- **Admin/Dev/Test:** Shows personal data only

### `git envware team`
Manage teams (owner only).
- Subcommands: list, create, remove

### `git envware buy team [qty]`
Purchase team packs.
- Opens Stripe checkout
- Adds qty teams to account

### `git envware buy project [team] [qty]`
Purchase project packs.
- Opens Stripe checkout
- Adds qty projects to specified team

### `git envware buy user [team] [project] [qty]`
Purchase user packs.
- Opens Stripe checkout
- Adds qty users to specified project

### `git envware remove team <team>`
Remove team and all its projects (owner only).

### `git envware remove project <team> <project>`
Remove project from team (owner only).

### `git envware remove user <team> <project> <fingerprint>`
Remove user from project (owner/admin only).

## Files Processed
- `.env`
- `.env.development`
- `.env.production`
- `.env.test`
- `.env.local`
- `.env.crypto` (encrypted version - Git-tracked)

## Validation Rules
1. **Push requires:**
   - User is owner/admin/dev
   - `.env*` files in `.gitignore`
   - `.env.crypto` NOT in `.gitignore`

2. **Project uniqueness:**
   - Same remote cannot exist in multiple teams

3. **User in multiple projects:**
   - Same SSH key can participate in different projects/teams

---

*Specification created: 2026-04-18*