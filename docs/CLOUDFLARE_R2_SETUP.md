# Cloudflare R2 Storage & Photo Management Integration

## 1. Architecture Overview

Make My Marriage uses **Cloudflare R2 Object Storage** for high-resolution wedding photography, paired with **FastAPI** and **MongoDB Atlas** for metadata indexing and access control.

```
+───────────────────────────────────────────────────────────────────────────────────+
│                                  USER ROLES                                       │
│                                                                                   │
│  Wedding Manager (Authenticated)               Wedding Guest (Invitation Token)  │
+───────────────────────┬──────────────────────────────────────────┬────────────────+
                        │                                          │
                        ▼                                          ▼
             +─────────────────────+                    +─────────────────────+
             │  Dashboard Gallery  │                    │   Public Gallery    │
             │     (/dashboard)    │                    │ (/w/[slug]/gallery) │
             +──────────┬──────────+                    +──────────┬──────────+
                        │                                          │
                        │ Multipart Photo Upload                   │ Token-Authorized Fetch
                        ▼                                          ▼
             +────────────────────────────────────────────────────────────────+
             │                        FastAPI Backend                         │
             │      (/api/v1/weddings/{id}/albums, /public/.../gallery)       │
             +──────────────────┬───────────────────────────┬─────────────────+
                                │                           │
                 Boto3 S3 Client│              PyMongo Async│
             (Pre-signed URLs / │                           │ (Album & Photo
              Streamed Upload)  │                           │  Metadata Only)
                                ▼                           ▼
             +───────────────────────+             +─────────────────+
             │     Cloudflare R2     │             │  MongoDB Atlas  │
             │   make-my-marriage-   │             │   Collections:  │
             │         media         │             │  - photoAlbums  │
             +───────────────────────+             │  - photos       │
                                                   +─────────────────+
```

---

## 2. Security and Data Isolation Rules

1. **Zero Binary Storage in Database:**
   MongoDB Atlas stores only metadata:
   - `weddingId`
   - `albumId`
   - `storageObjectKey`
   - `originalFileName`
   - `contentType`
   - `sizeBytes`
   - `uploadedBy`
   - `createdAt`

2. **Tenant Scoping:**
   Object keys are strictly formatted as:
   `weddings/{weddingId}/albums/{albumId}/{unique_uuid}.{ext}`
   Cross-wedding photo access is rejected at both the database query and storage authorization layers.

3. **No Hardcoded Credentials:**
   R2 access keys are stored exclusively in server-side environment variables (`backend/.env`). No storage credentials are exposed to the Next.js frontend or committed to git.

4. **Private Album Protection:**
   Albums designated as `authorized_guests` are accessible only with a valid cryptographic invitation token issued to an invited guest of that specific wedding. Public requests only receive albums with `accessType: "public"`.

5. **Short-Lived Pre-signed URLs:**
   Private photos are served via AWS S3v4 signed URLs expiring within 1 hour. Permanent direct bucket URLs are never exposed for private wedding media.

---

## 3. Required Environment Variables

Add the following to `backend/.env`:

| Variable | Required | Description | Example |
|---|---|---|---|
| `R2_ACCOUNT_ID` | Yes | Cloudflare 32-character Account ID | `a1b2c3d4e5f6...` |
| `R2_ACCESS_KEY_ID` | Yes | R2 API Token Access Key ID | `0123456789abcdef...` |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API Token Secret Access Key | `fedcba9876543210...` |
| `R2_BUCKET_NAME` | Yes | R2 Bucket Name | `make-my-marriage-media` |
| `R2_ENDPOINT_URL` | Optional | Custom S3 endpoint override (defaults to `https://{account_id}.r2.cloudflarestorage.com`) | `https://...` |
| `R2_PUBLIC_DOMAIN` | Optional | Custom domain for public CDN delivery (leave blank for presigned URLs) | `https://media.makemymarriage.com` |

---

## 4. API Endpoints

### 4.1 Wedding Manager Endpoints (Authenticated)

- **`POST /api/v1/weddings/{weddingId}/albums`**
  Create a new album (`title`, `description`, `accessType`).
- **`GET /api/v1/weddings/{weddingId}/albums`**
  List all albums with photo counts and cover photo thumbnail.
- **`PATCH /api/v1/weddings/{weddingId}/albums/{albumId}`**
  Update album details and access policy.
- **`DELETE /api/v1/weddings/{weddingId}/albums/{albumId}`**
  Delete album and permanently remove all its photos from R2 and MongoDB.
- **`POST /api/v1/weddings/{weddingId}/albums/{albumId}/photos`**
  Upload one or multiple photos via multipart form data (validates file types: JPEG, PNG, WebP, GIF, HEIC; 25MB max per image).
- **`GET /api/v1/weddings/{weddingId}/albums/{albumId}/photos`**
  List photos for an album with freshly signed retrieval URLs.
- **`DELETE /api/v1/weddings/{weddingId}/albums/{albumId}/photos/{photoId}`**
  Permanently delete a photo from R2 and MongoDB.

### 4.2 Public & Guest Gallery Endpoints (Token-Authorized)

- **`GET /api/v1/public/weddings/{slug}/gallery`**
  Query parameter: `?token={invitation_token}`
  Header: `X-Invitation-Token: {token}`
  - Returns `isAuthorizedGuest: true` and all albums if a valid token is provided.
  - Returns `isAuthorizedGuest: false` and only public albums if no token or an invalid token is provided.
- **`GET /api/v1/public/weddings/{slug}/gallery/albums/{albumId}/photos`**
  Query parameter: `?token={invitation_token}`
  - Returns album photos with signed URLs. Rejects unauthorized access with `HTTP 403 Forbidden` if the album is private.

---

## 5. Cloudflare Dashboard Manual Configuration Guide

1. Log into [dash.cloudflare.com](https://dash.cloudflare.com)
2. In the sidebar, select **R2 Object Storage**.
3. Copy your **Account ID** from the URL bar (`dash.cloudflare.com/<ACCOUNT_ID>/r2/overview`).
4. Click **Create bucket**:
   - Bucket name: `make-my-marriage-media`
   - Location: APAC or closest region.
   - Click **Create bucket**.
5. Click **Manage R2 API Tokens** → **Create API token**:
   - Name: `make-my-marriage-backend`
   - Permissions: **Object Read & Write**
   - Apply to specific buckets: `make-my-marriage-media`
   - Click **Create API Token**.
6. Copy the **Access Key ID** and **Secret Access Key** into `backend/.env`.
