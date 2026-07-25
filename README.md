# Snapgram — Instagram Clone

A full-stack, Instagram-style social media app built as a technical assessment project.
Users can register, log in, reset a forgotten password, upload a profile photo, share
photo posts with captions, like, comment, share, follow other users, and message each
other directly.

## Features

- **Auth**: register, login (JWT), forgot password, reset password
- **Profiles**: bio, full name, avatar upload, follower/following counts with clickable
  lists of who's actually in them
- **Posts**: image upload + caption, home feed (people you follow), Explore grid (everyone)
- **Engagement**: like/unlike, comment, delete your own comments/posts, native share sheet
  (falls back to "copy link") on every post
- **Direct messages**: one-to-one conversations with text and/or image attachments,
  an inbox of recent conversations, and near-live updates while a thread is open (polling)
- **Search**: look up other users by username from the navbar, with a per-browser
  "recent searches" list (clear individual entries or all at once)
- **Dark mode** toggle, persisted per-browser
- **Mobile-responsive** layout, including a collapsing hamburger menu on small screens
- **Pagination** on the feed and explore grid

## Tech stack

| Layer     | Choice                                                                 |
|-----------|-------------------------------------------------------------------------|
| Frontend  | React 18 + Vite, React Router, Tailwind CSS, Axios                     |
| Backend   | Java 17, Spring Boot 3 (Web, Security, Data JPA, Validation), JJWT     |
| Database  | MySQL                                                                  |
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
  that can execute a JVM process — e.g. [Render](https://render.com),
  [Railway](https://railway.app), or [Fly.io](https://fly.io). The included
  `backend/Dockerfile` builds a container image ready for any of those. CI builds and
  tests it on every push/PR; the actual hosting deploy is a one-time manual setup on
  your chosen platform (point it at this repo/Dockerfile, add the env vars below).

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
- A local MySQL server (or adjust `DB_URL` to point elsewhere)

### 1. Backend

```bash
cd backend
# Create the database (or let ddl-auto=update create it — createDatabaseIfNotExist is on)
# Then just run:
mvn spring-boot:run
```

Backend env vars (all have local-dev defaults baked into `application.properties`,
override via your shell/IDE run config or a `.env`-loading tool):

| Variable | Purpose | Local default |
|---|---|---|
| `DB_URL` | JDBC URL | `jdbc:mysql://localhost:3306/instagram_clone?...` |
| `DB_USERNAME` / `DB_PASSWORD` | MySQL credentials | `root` / `password` |
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

All endpoints are prefixed with `/api`. JWT-protected endpoints expect
`Authorization: Bearer <token>`.

| Method | Endpoint | Auth? | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create an account, returns JWT + profile |
| POST | `/auth/login` | No | Log in with username/email + password |
| POST | `/auth/forgot-password` | No | Generate a reset token (dev-mode: returned in response) |
| POST | `/auth/reset-password` | No | Consume a reset token, set a new password |
| GET | `/users/me` | Yes | Current user's profile |
| GET | `/users/{username}` | No | Public profile lookup |
| GET | `/users/search/{query}` | No | Search usernames |
| PUT | `/users/me` | Yes | Update full name / bio |
| POST | `/users/me/avatar` | Yes | Upload a new avatar (multipart `file`) |
| POST | `/users/{username}/follow` | Yes | Toggle follow/unfollow |
| GET | `/users/{username}/followers` | No | List of users who follow `{username}` |
| GET | `/users/{username}/following` | No | List of users `{username}` follows |
| POST | `/posts/upload-image` | Yes | Upload a post image (multipart `file`), returns a URL |
| POST | `/posts` | Yes | Create a post (`imageUrl`, `caption`) |
| GET | `/posts/explore` | No | Paginated, all posts, newest first |
| GET | `/posts/feed` | Yes | Paginated, posts from people you follow (+ your own) |
| GET | `/posts/user/{username}` | No | Paginated, one user's posts |
| GET | `/posts/{id}` | No | Single post |
| DELETE | `/posts/{id}` | Yes (owner) | Delete a post |
| POST | `/posts/{id}/like` | Yes | Toggle like/unlike |
| GET | `/posts/{postId}/comments` | No | List comments on a post |
| POST | `/posts/{postId}/comments` | Yes | Add a comment |
| DELETE | `/posts/{postId}/comments/{commentId}` | Yes (author or post owner) | Delete a comment |
| GET | `/messages/conversations` | Yes | Your conversations, most recent first |
| GET | `/messages/{username}` | Yes | Full message thread with `{username}` |
| POST | `/messages/{username}` | Yes | Send a message (`text` and/or `imageUrl`) |
| POST | `/messages/upload-image` | Yes | Upload a message image (multipart `file`), returns a URL |

## Deployment guide

### Frontend → Vercel (via the included CI/CD pipeline)

1. Create a new Vercel project and link it to this GitHub repo, with **Root Directory**
   set to `frontend`. Do this once through the Vercel dashboard (or `vercel link` from
   `frontend/`) so a project exists to deploy into.
2. In the Vercel project settings, add the environment variable `VITE_API_BASE_URL`
   pointing at your deployed backend's base URL (no trailing slash).
3. In your GitHub repo settings → *Secrets and variables → Actions*, add:
   - `VERCEL_TOKEN` — from Vercel → Account Settings → Tokens
   - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` — found in `frontend/.vercel/project.json`
     after running `vercel link` locally once
4. Push to `main`. `.github/workflows/deploy.yml` builds+tests the backend, then builds
   the frontend and runs `vercel deploy --prebuilt --prod`, pulling the
   `VITE_API_BASE_URL` value you set in step 2 automatically via `vercel pull`.

### Backend → Render/Railway/Fly (or any host that runs a Docker image / JAR)

1. Point the platform at this repo with `backend/Dockerfile` as the build context, or
   run `mvn clean package` and ship the resulting JAR directly.
2. Provision a MySQL instance (PlanetScale, Railway MySQL, Aiven, or your host's
   managed MySQL) and set `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` accordingly.
3. Set `JWT_SECRET` to a long random string, `CORS_ALLOWED_ORIGINS` to your deployed
   Vercel URL, and `FRONTEND_URL` to the same, so password-reset links point at the
   right place.
4. Set `BLOB_READ_WRITE_TOKEN` from your Vercel project → Storage → Blob, so post/avatar
   image uploads work in production.

## Testing

```bash
cd backend
mvn test
```

Covers the JWT service (token issuance/validation/expiry) and end-to-end flows for
register → login, and create post → like → comment, run against an in-memory H2
database (see `src/test/resources/application.properties`) so no MySQL instance is
needed to run the suite.
