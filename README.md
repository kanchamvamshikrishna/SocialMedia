# Snapgram — Instagram Clone

A full-stack, Instagram-style social media app built as a technical assessment project.
Users can register, log in, reset a forgotten password, upload a profile photo, share
photo posts with captions, like, comment, share, follow other users, and message each
other directly.

## Live demo

- **App**: https://social-media-seven-rouge.vercel.app
- **API**: https://snapgram-backend-waim.onrender.com/api/health

The backend is on Render's free tier, which spins down after 15 minutes of inactivity —
the first request after a while can take up to ~50s to wake it back up. That's normal for
the free tier, not a bug.

## CI/CD

`.github/workflows/deploy.yml` runs on every push/PR to `main`:
- **Backend**: `mvn clean verify` (Spring Boot, JUnit, H2 in-memory DB)
- **Frontend**: `npm ci && npm run build` (Vite)

Both must pass before code is considered mergeable. Actual deployment happens via each
platform's own native Git integration — Vercel auto-builds and deploys the frontend on
every push to `main` (Root Directory: `frontend`), and Render does the same for the
backend Docker image — so a green CI run and a live deploy happen from the same push.

## Features

- **Auth**: register, login (JWT), forgot password, reset password
- **Profiles**: bio, full name, avatar upload, follower/following counts with clickable
  lists of who's actually in them
- **Posts**: image upload + caption, home feed (people you follow), Explore grid (everyone)
- **Engagement**: like/unlike, comment, delete your own comments/posts, native share sheet
  (falls back to "copy link") on every post
- **Direct messages**: one-to-one conversations with text and/or image attachments,
  an inbox of recent conversations, and near-live updates while a thread is open (polling)
- **Notifications**: likes, comments, follows, new posts from people you follow, and
  messages all generate a notification, with an unread-count badge in the navbar
  (polling) and a notifications page to review/mark them read
- **Search**: look up other users by username from the navbar, with a per-browser
  "recent searches" list (clear individual entries or all at once)
- **Dark mode** toggle, persisted per-browser
- **Mobile-responsive** layout, including a collapsing hamburger menu on small screens
- **Pagination** on the feed and explore grid
- **Login required to view anything** — Explore, profiles, and posts are gated behind
  authentication (no public browsing); only auth pages are open

> For system design, architecture diagrams, and the scalability roadmap, see
> **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Tech stack

| Layer     | Choice                                                                 |
|-----------|-------------------------------------------------------------------------|
| Frontend  | React 18 + Vite, React Router, Tailwind CSS, Axios                     |
| Backend   | Java 17, Spring Boot 3 (Web, Security, Data JPA, Validation), JJWT     |
| Database  | PostgreSQL                                                             |
| Image storage | Vercel Blob in production; local disk in dev (see below) |
| Auth      | JWT (stateless), BCrypt password hashing                              |
| CI/CD     | GitHub Actions                                                         |
| Frontend hosting | Vercel                                                          |

### A note on architecture and Vercel

**Vercel does not run Java.** It hosts static sites and Node/Python/Go/Ruby serverless
functions — there's no Spring Boot runtime available on it. So this repo splits
concerns the same way the initial project scaffold already anticipated:

- The **frontend** (`frontend/`) is a static Vite build. It deploys to Vercel, and the
  CI/CD pipeline (`.github/workflows/deploy.yml`) does that automatically on every push
  to `main`.
- The **backend** (`backend/`) is a Spring Boot JAR/Docker image. It must run somewhere
  that can execute a JVM process — this project targets
  [Render](https://render.com) (free web service + free Postgres, no credit card),
  though [Railway](https://railway.app) or [Fly.io](https://fly.io) work too. The
  included `backend/Dockerfile` builds a container image ready for any of those. CI
  builds and tests it on every push/PR; the actual hosting deploy is a one-time manual
  setup on your chosen platform (point it at this repo/Dockerfile, add the env vars
  below).

The frontend only ever talks to the backend over HTTP via `VITE_API_BASE_URL` — once the
backend is deployed anywhere reachable, point the frontend at it and everything works.

## Project structure

```
instagram-clone/
├── .github/workflows/deploy.yml   # CI/CD: build+test backend, build+deploy frontend to Vercel
├── backend/                       # Spring Boot REST API
│   └── src/main/java/com/instagram/
│       ├── config/                # Security, JWT, CORS
│       ├── controller/            # REST endpoints
│       ├── dto/                   # Request/response payloads
│       ├── exception/             # Centralized error handling
│       ├── model/                 # JPA entities
│       ├── repository/            # Spring Data JPA repositories
│       └── service/                # Business logic
├── frontend/                      # React (Vite) SPA
│   └── src/
│       ├── components/            # Navbar, PostCard, LikeButton, CommentSection, ...
│       ├── context/                # AuthContext, ThemeContext
│       ├── pages/                  # Login, Register, Feed, Explore, Profile, ...
│       └── services/                # Axios API client + per-resource service modules
└── README.md
```

## Running locally

### Prerequisites

- Java 17+, Maven (or use your IDE's bundled Maven)
- Node.js 20+
- A local PostgreSQL server (or adjust `DB_URL` to point elsewhere)

### 1. Backend

Unlike MySQL, Postgres won't auto-create the database for you, so create it once:

```bash
createdb instagram_clone
# or: psql -U postgres -c "CREATE DATABASE instagram_clone;"
```

Then run the app (`ddl-auto=update` creates the tables on first start):

```bash
cd backend
mvn spring-boot:run
```

Backend env vars (all have local-dev defaults baked into `application.properties`,
override via your shell/IDE run config or a `.env`-loading tool):

| Variable | Purpose | Local default |
|---|---|---|
| `DB_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/instagram_clone` |
| `DB_USERNAME` / `DB_PASSWORD` | Postgres credentials | `postgres` / `password` |
| `JWT_SECRET` | HMAC signing key for JWTs | insecure placeholder — **must** be overridden in any real deployment |
| `JWT_EXPIRATION_MS` | Token lifetime | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173` |
| `FRONTEND_URL` | Used to build the password-reset link | `http://localhost:5173` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image uploads | empty → falls back to local disk, see below |
| `UPLOAD_LOCAL_DIR` | Where local-fallback uploads are written | `uploads` (relative to the backend's working dir) |
| `UPLOAD_PUBLIC_BASE_URL` | Base URL used to serve local-fallback uploads back | `http://localhost:8080/uploads` |

The backend runs on `http://localhost:8080`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # then edit VITE_API_BASE_URL if needed
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## "Forgot password" — how it actually works here

There's no transactional email provider wired into this build (dev-mode, by design for
this assessment). `POST /api/auth/forgot-password` still does the real work — it
generates a single-use, 1-hour-expiry reset token and persists it — but instead of
emailing the reset link, the API returns it directly in the JSON response
(`devResetLink` / `devResetToken`), and the frontend's Forgot Password page displays it
on-screen so you can click straight through to Reset Password. Swapping in a real
provider (Resend, SES, Nodemailer+SMTP, etc.) later only touches
`AuthService.forgotPassword()` in the backend — send the same link by email and drop the
two `dev*` fields from the response.

## Image uploads — how they work locally vs. in production

`BlobStorageService` has two modes:

- **`BLOB_READ_WRITE_TOKEN` set** (production): uploads go to real Vercel Blob storage
  over its HTTP API.
- **`BLOB_READ_WRITE_TOKEN` unset** (local dev, or anyone running this without a Vercel
  account): uploads are written to local disk under `UPLOAD_LOCAL_DIR` and served back
  through a `/uploads/**` static mapping (see `WebConfig`). No setup needed — post
  images, avatars, and message attachments all work out of the box locally.

## API reference

All endpoints are prefixed with `/api`. Every endpoint requires
`Authorization: Bearer <token>` **except** `/auth/**`, `/health`, and `/uploads/**` —
there is no public/anonymous browsing of profiles, posts, or Explore.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns JWT + profile (no auth) |
| POST | `/auth/login` | Log in with username/email + password (no auth) |
| POST | `/auth/forgot-password` | Generate a reset token (dev-mode: returned in response, no auth) |
| POST | `/auth/reset-password` | Consume a reset token, set a new password (no auth) |
| GET | `/users/me` | Current user's profile |
| GET | `/users/{username}` | Profile lookup |
| GET | `/users/search/{query}` | Search usernames |
| PUT | `/users/me` | Update full name / bio |
| POST | `/users/me/avatar` | Upload a new avatar (multipart `file`) |
| POST | `/users/{username}/follow` | Toggle follow/unfollow |
| GET | `/users/{username}/followers` | List of users who follow `{username}` |
| GET | `/users/{username}/following` | List of users `{username}` follows |
| POST | `/posts/upload-image` | Upload a post image (multipart `file`), returns a URL |
| POST | `/posts` | Create a post (`imageUrl`, `caption`) |
| GET | `/posts/explore` | Paginated, all posts, newest first |
| GET | `/posts/feed` | Paginated, posts from people you follow (+ your own) |
| GET | `/posts/user/{username}` | Paginated, one user's posts |
| GET | `/posts/{id}` | Single post |
| DELETE | `/posts/{id}` | Delete a post (owner only) |
| POST | `/posts/{id}/like` | Toggle like/unlike |
| GET | `/posts/{postId}/comments` | List comments on a post |
| POST | `/posts/{postId}/comments` | Add a comment |
| DELETE | `/posts/{postId}/comments/{commentId}` | Delete a comment (author or post owner) |
| GET | `/messages/conversations` | Your conversations, most recent first |
| GET | `/messages/{username}` | Full message thread with `{username}` |
| POST | `/messages/{username}` | Send a message (`text` and/or `imageUrl`) |
| POST | `/messages/upload-image` | Upload a message image (multipart `file`), returns a URL |
| GET | `/notifications` | Paginated notifications, most recent first |
| GET | `/notifications/unread-count` | `{ "count": N }` for the navbar badge |
| POST | `/notifications/{id}/read` | Mark one notification read |
| POST | `/notifications/read-all` | Mark all notifications read |

### Notifications — what triggers one

| Trigger | Type | Recipient(s) |
|---|---|---|
| Someone likes your post | `LIKE` | Post owner |
| Someone comments on your post | `COMMENT` | Post owner |
| Someone follows you | `FOLLOW` | The user being followed |
| Someone you follow creates a post | `POST` | All of their followers |
| Someone sends you a message | `MESSAGE` | The recipient |

You never get notified about your own actions (liking/commenting on your own post,
etc.). Unfollowing, unliking, or deleting content does not retroactively remove past
notifications.

## Deployment guide

### Frontend → Vercel

1. Create a new Vercel project and link it to this GitHub repo, with **Root Directory**
   set to `frontend`, through the Vercel dashboard. This wires up Vercel's native Git
   integration, which auto-builds and deploys on every push to `main` from then on — no
   deploy step needed in CI.
2. In the Vercel project settings, add the environment variable `VITE_API_BASE_URL`
   pointing at your deployed backend's base URL (no trailing slash).
3. Push to `main`. `.github/workflows/deploy.yml` builds+tests the backend and builds the
   frontend as a CI gate (fails fast on a broken build); Vercel deploys independently on
   the same push.

### Backend → Render (recommended: free, no credit card)

1. Create a free **PostgreSQL** instance on Render (Dashboard → New → PostgreSQL). Free
   instances expire 30 days after creation (14-day grace period after that) — plenty for
   an assessment review window; upgrade later if this becomes a long-lived deployment.
2. Create a free **Web Service** (Dashboard → New → Web Service), point it at this repo
   with `backend/Dockerfile` as the build context. Free web services spin down after 15
   minutes of inactivity and take ~1 minute to wake back up on the next request — normal
   for the free tier, not a bug.
3. Set `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` from the Postgres instance's connection
   details (Render shows an "External Database URL" you can split into these three, or
   just use `DATABASE_URL` directly if you prefer — either way, this app reads the three
   separately).
4. Set `JWT_SECRET` to a long random string, `CORS_ALLOWED_ORIGINS` to your deployed
   Vercel URL, and `FRONTEND_URL` to the same, so password-reset links point at the
   right place.
5. Set `BLOB_READ_WRITE_TOKEN` from your Vercel project → Storage → Blob, so post/avatar
   image uploads work in production.

Railway or Fly.io work too if you'd rather pay for Railway's Hobby tier or manage
Fly's `fly.toml` — the Dockerfile is portable to either.

## Testing

```bash
cd backend
mvn test
```

Covers the JWT service (token issuance/validation/expiry) and end-to-end flows for
register → login, and create post → like → comment, run against an in-memory H2
database (see `src/test/resources/application.properties`) so no PostgreSQL instance is
needed to run the suite.
