# Envware Backend 🌸

The core API powering [.envware](https://www.envware.dev). Built with Next.js, Prisma, and PostgreSQL (Neon).

## Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org) (App Router)
- **Database:** [PostgreSQL](https://postgresql.org) via [Neon](https://neon.tech)
- **ORM:** [Prisma](https://prisma.io)
- **Authentication:** JWT + SSH Key verification logic
- **Payments:** [Stripe](https://stripe.com)
- **Email:** [Resend](https://resend.com)
- **UI:** Tailwind CSS + DaisyUI (Admin & Landing Page)

## Core Responsibilities (E2EE Architecture)

1. **Multi-tenant Teams:** Projects belong to Teams. Users can be Owners, Admins, or Members.
2. **Granular Access:** Members only see projects they are explicitly assigned to within a team.
3. **Secret Storage:** Stores AES-256-GCM encrypted blobs. The backend never holds the decryption keys.
4. **Project Key Management:** Facilitates the secure exchange of E2EE Project Keys using RSA/SSH public keys.
5. **Subscription Logic:** Integrates with Stripe/Asaas to manage Premium plans and usage limits.
6. **Admin Dashboard:** Private metrics dashboard for monitoring growth and support messages.

## New Security Model (Pull-based Request/Approve)

The legacy `share` command was replaced by a more secure flow:
1. **Request:** A user requests access to `team/project` sending their public key.
2. **Approve:** The owner/admin encrypts the project key locally for the requester's public key.
3. **Sync:** The requester downloads the approved keys using `sync-access`.
4. **Team Invite:** Owners can use `team-invite --all` to grant instant access to all projects in a team.

## API Limits (Enforced)

- **FREE:** 1 Team, 10 Projects, 3 Members/Project.
- **PREMIUM:** 3 Teams, 100 Projects, 15 Members/Project.
- **ENTERPRISE:** Unlimited Teams, Unlimited Projects, Unlimited Members.

## Version Enforcement
The API requires CLI version **>= 1.3.0** via the `x-envware-version` header.

## Development

### Setup
1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Install dependencies:
```bash
bun install
```

### Database
Sync the database schema:
```bash
npx prisma generate
npx prisma db push
```

### Run
```bash
bun dev
```

---
Built with 🌸 by Humberto (Beto).
