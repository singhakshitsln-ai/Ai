# FRANCIS — Vercel deployment (free-tier friendly)

This version uses Express.js on Vercel and PostgreSQL for persistent accounts, OAuth links, sessions, and cloud data. It does not use Render, SQLite files, or a persistent disk.

## 1. GitHub

1. Extract this ZIP.
2. Open your `akshit-droid533/Francis` repository.
3. Upload the contents of the `francis--main` folder into the repository root (including the `public` folder, `server.js`, `package.json`, and `vercel.json`).
4. Commit the changes. Do not upload `.env` files or secrets.

## 2. PostgreSQL database (Neon free plan)

1. Create a project at https://neon.tech/ .
2. In the Neon dashboard, copy the PostgreSQL connection string. Use the pooled connection string if Neon offers one. It should end with `?sslmode=require` (or include that parameter).
3. Keep the connection string private. Add it to Vercel as `DATABASE_URL`.
4. The server creates its tables automatically on the first request. `schema.sql` is included as a reference only; you normally do not need to run it manually.

Neon and Vercel free plans have usage limits and can change. No paid plan is required for the initial setup, but exceeding free quotas may require waiting, reducing usage, or choosing a paid plan.

## 3. Import into Vercel

1. Sign in at https://vercel.com/ using GitHub.
2. Choose **Add New → Project** and import `akshit-droid533/Francis`.
3. Keep the Root Directory as `./` (repository root).
4. Framework should be detected as **Express**. If asked, select **Express**.
5. Leave Build Command and Output Directory at their defaults/blank; do not set `public` as the output directory. Vercel serves the `public/` directory as static assets and runs `server.js` as the Express app.
6. Deploy.

## 4. Add Vercel environment variables

Open **Vercel → your project → Settings → Environment Variables**. Add these for Production (and Preview if you want preview testing):

- `NODE_ENV` = `production`
- `SESSION_SECRET` = a long random secret (at least 32 characters; do not reuse a password)
- `DATABASE_URL` = your Neon PostgreSQL connection string
- `OAUTH_BASE_URL` = your production Vercel URL, e.g. `https://your-project.vercel.app` (no trailing slash)
- `GOOGLE_CLIENT_ID` = Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` = Google OAuth client secret
- `GITHUB_CLIENT_ID` = GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` = GitHub OAuth app client secret

After changing variables, redeploy the project. Never commit real secrets to GitHub.

## 5. Google OAuth

In Google Cloud Console, configure an OAuth consent screen and create an OAuth Client ID of type **Web application**. Add your deployed domain to Authorized JavaScript origins if requested, and add this exact Authorized redirect URI:

`https://YOUR-PROJECT.vercel.app/auth/google/callback`

Use the same value of the deployed production URL in `OAUTH_BASE_URL`. If Google consent is in Testing mode, add your Google account as a test user.

## 6. GitHub OAuth

In GitHub → Settings → Developer settings → OAuth Apps → New OAuth App, set:

- Homepage URL: `https://YOUR-PROJECT.vercel.app`
- Authorization callback URL: `https://YOUR-PROJECT.vercel.app/auth/github/callback`

Copy the Client ID and generate a Client Secret. Put them in Vercel environment variables, then redeploy.

## 7. Test

Open `https://YOUR-PROJECT.vercel.app/api/health`. Expected response includes `ok: true`, `status: "online"`, and `database: "connected"`. Then test email signup/login, Google login, GitHub login, logout, and account data sync. `/api/auth/providers` shows which social providers are configured.

## Important notes

- Your old GitHub Pages URL `https://akshit-droid533.github.io/Francis/` cannot run Express.js. The Vercel deployment will have its own `*.vercel.app` URL.
- Replace every `https://YOUR-PROJECT.vercel.app/` placeholder in `public/index.html`, `public/sitemap.xml`, `public/robots.txt`, and QR defaults with the exact production Vercel URL after Vercel assigns it.
- Vercel serverless functions are not a traditional always-on server. The app uses PostgreSQL for persistent data; it does not write account data to local files.
- Rate limiting uses an in-memory limiter and is best-effort across serverless instances. For stronger distributed rate limiting, add a shared rate-limit store later.
- OAuth sign-in will remain unavailable until you add real Google and GitHub credentials.
- Do not add the database password or OAuth secrets to `public/`, HTML, JavaScript, or GitHub.
