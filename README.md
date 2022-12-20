# Nylas Sample App

A brief demo of functionality available for user on Nylas Scheduler

## What's in the stack

- [Fly app deployment](https://fly.io) with [Docker](https://www.docker.com/)
- Production-ready [SQLite Database](https://sqlite.org)
- Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments
- Email/Password Authentication with [cookie-based sessions](https://remix.run/docs/en/v1/api/remix#createcookiesessionstorage)
- Database ORM with [Prisma](https://prisma.io)
- Styling with [Tailwind](https://tailwindcss.com/)
- End-to-end testing with [Cypress](https://cypress.io)
- Local third party request mocking with [MSW](https://mswjs.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)

Not a fan of bits of the stack? Fork it, change it, and use `npx create-remix --template your/repo`! Make it your own.

# Get Started

## Prerequisites

- Google Cloud Project with Calendar Scopes
- Nylas Application

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL="file:./data.db?connection_limit=1"`

`SESSION_SECRET`

- We are using session to manage user state

`NYLAS_CLIENT_ID`

- Nylas Dashboard >{YOUR_APP}> App Settings

`NYLAS_CLIENT_SECRET`

- Nylas Dashboard >{YOUR_APP}> App Settings

`GOOGLE_CLIENT_ID`

- GCP project credentials that you created

`GOOGLE_CLIENT_SECRET`

- GCP project credentials that you created

`GOOGLE_REDIRECT_URI=http://localhost:3000/callback`

- when you create a GCP project Credentials please add this url as one of the Authorized Redirect URI

`API_ENDPOINT`

- If you are using EU input that endpoint here
  - US - https://api.nylas.com
  - EU - https://ireland.api.nylas.com

`SCHEDULER_API=https://api.schedule.nylas.com`

- If you are using EU input that endpoint here - US - https://api.schedule.nylas.com - EU - https://ireland.api.schedule.nylas.com
  `SCHEDULER_WEB=https://schedule.nylas.com`
- If you are using EU input that endpoint here
  - US - https://schedule.nylas.com
  - EU - https://ireland.web.schedule.nylas.com

## Development

- This step only applies if you've opted out of having the CLI install dependencies for you:

  ```sh
  npx remix init
  ```

- Initial setup: _If you just generated this project, this step has been done for you._

  ```sh
  npm run setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

# User Flow

- https://www.loom.com/share/cb0ab9e2cb1a494e86fb43e5f08e631b
