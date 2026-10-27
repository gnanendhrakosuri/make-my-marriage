# System Design Document (SDD)
**Make My Marriage — Wedding Website Platform**

| Field | Value |
|---|---|
| Document Version | 1.2 |
| Product Name | Make My Marriage |
| Release Scope | Version 1 (MVP) |

> **Note:** The original source file is `docs/SDD.doc`. This Markdown version is a faithful conversion for readability. Do not treat this file as the authoritative source if it conflicts with the original. SDD v1.2 supersedes PRD v1.0 where they conflict.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Technology Stack](#2-technology-stack)
3. [High-Level System Architecture](#3-high-level-system-architecture)
4. [User Roles and Permissions](#4-user-roles-and-permissions)
5. [Authentication and Access Control](#5-authentication-and-access-control)
6. [Multi-Wedding Architecture and Data Isolation](#6-multi-wedding-architecture-and-data-isolation)
7. [Database Design](#7-database-design)
8. [API Design Overview](#8-api-design-overview)
9. [Email and Notification Design](#9-email-and-notification-design)
10. [Photo Gallery Design](#10-photo-gallery-design)
11. [Wedding Location and QR Code](#11-wedding-location-and-qr-code)
12. [Livestream Information](#12-livestream-information)
13. [Frontend Application Design](#13-frontend-application-design)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Performance and Scalability](#15-performance-and-scalability)
16. [Reliability, Backups, and Monitoring](#16-reliability-backups-and-monitoring)
17. [Testing Strategy](#17-testing-strategy)
18. [Confirmed Decisions and Open Items](#18-confirmed-decisions-and-open-items)
19. [Recommended Implementation Order](#19-recommended-implementation-order)
20. [Final Summary](#20-final-summary)

---

## 1. Introduction

### 1.1 Purpose

This document describes the system design for Make My Marriage Version 1. It specifies the technology stack, architecture, component responsibilities, authentication model, data isolation strategy, and implementation guidance.

### 1.2 Goals

- Provide a simple wedding website that people of different age groups can use.
- Allow multiple couples to use the same platform with separate wedding websites.
- Allow the Platform Administrator to create Manager accounts and wedding websites.
- Provide authenticated dashboards for Admin and Manager.
- Allow Managers to manage events, tasks, expenses, guests, invitations, reminders, RSVPs, and photos.
- Allow guests to view wedding information without logging in.
- Provide unique invitation links for individual guests.
- Protect private guest information and wedding photo galleries.
- Support wedding location QR codes and optional livestream information.

### 1.3 Scope of Version 1

The following features are in scope:

1. Admin and Manager authentication.
2. Wedding setup and dashboard.
3. Event and schedule management.
4. Task planner.
5. Expense tracker.
6. Guest management.
7. Digital invitations.
8. Email invitations and reminders.
9. Guest-specific invitation links.
10. RSVP with Yes/No responses.
11. Public wedding website.
12. Wedding location and QR code.
13. Photo gallery with wedding-specific access control.
14. Optional livestream information or viewing.
15. Role-based permissions and wedding-level data isolation.

**OTP-based authentication is not included in Version 1.**

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js | Wedding websites, dashboards, and guest pages |
| Backend | FastAPI | REST APIs, business logic, authentication, and authorization |
| Database | MongoDB Atlas | Store users, weddings, events, guests, tasks, RSVPs, and related data |
| Media storage | Google Cloud Storage | Store wedding photos and other uploaded media |
| Email service | Resend | Send invitations and reminders |
| Maps and locations | Google Maps / Places | Display wedding venues and location information |
| Livestream | YouTube Live | Optional livestream integration |
| Identity integration | Google OAuth | Potential identity integration; exact usage remains to be finalized |
| Traffic distribution | Google Cloud Load Balancer | Distribute incoming traffic if selected for deployment |
| CDN | Google Cloud CDN | Optional content delivery and caching |
| Hosting | Google Cloud Run or Google Cloud VM | Hosting decision pending |

### 2.1 Stack Notes

- Next.js is responsible for the user interface.
- FastAPI handles API requests, business rules, authentication, and access checks.
- MongoDB Atlas stores application data.
- Google Cloud Storage stores uploaded photos and media.
- Resend handles outgoing invitation and reminder emails.
- Google Maps / Places supports venue information.
- YouTube Live can be used when livestreaming is enabled for a wedding.
- Google Cloud CDN is optional and should not bypass private-gallery authorization.
- Hosting will be selected later between Cloud Run and a Google Cloud VM.

The final library versions, package choices, and any required service licensing must be checked before implementation. The architecture does not assume that every external service or usage level is free.

---

## 3. High-Level System Architecture

### 3.1 Architecture Overview

```
              Users
                |
      +---------+----------+
      |                    |
   Admin /              Guests
   Manager                 |
      |                    |
      +---------+----------+
                |
          Next.js Frontend
                |
      Google Cloud Load Balancer
          (if selected)
                |
          FastAPI Backend
                |
    +-----------+------------+
    |           |            |
MongoDB Atlas  Google Cloud  External Services
               Storage       - Resend
                  |          - Google Maps
               Photos        - YouTube Live
```

The diagram represents the logical architecture. The final routing and hosting arrangement will depend on the deployment option selected.

### 3.2 Component Responsibilities

**Next.js frontend:**
- Admin login and dashboard.
- Manager login and dashboard.
- Wedding information pages.
- Event schedules and task management screens.
- Guest management and invitation screens.
- Guest-facing RSVP confirmation pages.
- Public wedding pages and authorized gallery pages.

**FastAPI backend:**
- Authenticate Admin and Manager.
- Enforce role-based permissions.
- Verify wedding ownership and wedding-specific access.
- Manage wedding, event, task, expense, guest, and invitation data.
- Process RSVP responses.
- Send invitation and reminder emails through the email service.
- Authorize private gallery access.
- Generate or validate wedding-specific QR code destinations.

**MongoDB Atlas:**
- Stores application records and relationships.
- Separates data by wedding.
- Stores guest RSVP status and invitation metadata.

**Google Cloud Storage:**
- Stores photo and media files.
- Supports private object storage and authorized delivery of gallery content.

**External services:**
- Resend: invitation and reminder delivery.
- Google Maps / Places: location display and venue lookup.
- YouTube Live: optional livestream access.

---

## 4. User Roles and Permissions

The platform has four user categories: Platform Administrator, Admin, Manager, and Guests.

### 4.1 Platform Administrator

The Platform Administrator is responsible for onboarding each wedding.

**Responsibilities:**
- Create a wedding website.
- Create the corresponding Manager account.
- Assign the Manager to the correct wedding.
- Configure the initial wedding setup.
- Manage platform-level onboarding.

The Platform Administrator must use an authenticated administrative interface. The exact separation between the Platform Administrator and the wedding-level Admin will be finalized during implementation planning.

### 4.2 Admin

The Admin is the supervisory role for the wedding.

**Responsibilities:**
- Log in using valid credentials.
- Access the Admin dashboard.
- Review wedding setup and management information.
- Review whether the wedding information and operations look correct.
- Access only the data and features permitted by the Admin role.

The precise extent of Admin editing permissions remains to be finalized. The current product direction emphasizes supervision and review.

### 4.3 Manager

The Manager is responsible for day-to-day wedding operations.

**Responsibilities:**
- Log in using valid credentials.
- Access the assigned wedding dashboard.
- Manage wedding details and schedules.
- Create and manage events.
- Plan and track tasks.
- Track expenses.
- Add and manage guests.
- Send digital invitations.
- Send reminders.
- View and manage RSVP responses.
- Upload and organize wedding photos.
- Configure the wedding location and QR code.
- Add livestream details when applicable.

A Manager must not access another wedding's management information unless explicitly authorized.

### 4.4 Guests

Guests do not need to log in or create accounts.

**Guests can:**
- Open the public wedding website.
- View permitted wedding information, including the couple's names, event dates, schedules, and venue.
- Open their individual invitation link.
- Submit their RSVP using Yes or No.
- Access the private gallery only when authorized for that wedding.
- View the livestream when it is enabled and available to them.

Guests must not be able to view other guests' personal information, phone numbers, invitation tokens, or private RSVP records.

### 4.5 Permission Summary

| Capability | Platform Administrator | Admin | Manager | Guest |
|---|---|---|---|---|
| Create wedding website | Yes | No by default | No by default | No |
| Create Manager account | Yes | No by default | No | No |
| Authenticate to dashboard | Yes | Yes | Yes | Not required |
| Review wedding information | As permitted | Yes | Yes | Public details only |
| Manage events and tasks | Platform-level as needed | Pending final permissions | Yes | No |
| Manage guests and invitations | Platform-level as needed | Pending final permissions | Yes | Own invitation only |
| Submit RSVP | No | No | No | Yes, through unique link |
| Upload gallery photos | No by default | Pending final permissions | Yes | No |
| View authorized wedding gallery | As permitted | As permitted | Yes | Yes, if authorized |
| View other guests' private data | Restricted | As permitted | Assigned wedding only | No |

---

## 5. Authentication and Access Control

### 5.1 Authentication Requirements

Admin and Manager must authenticate using their credentials. Guests do not authenticate through a login form.

**Admin authentication:**
1. Admin opens the login page.
2. Admin provides valid credentials.
3. The backend verifies the credentials.
4. The backend establishes an authenticated session or issues an appropriate authentication token.
5. The Admin can access the authorized dashboard and APIs.
6. Invalid or expired authentication must not grant access to protected resources.

**Manager authentication:**
1. The Platform Administrator creates the Manager account.
2. The Manager opens the login page.
3. The Manager provides valid credentials.
4. The backend verifies the credentials.
5. The backend establishes an authenticated session or issues an appropriate authentication token.
6. The Manager can access the assigned wedding's dashboard and permitted APIs.
7. The backend validates both the Manager's role and the wedding assignment for protected operations.

**Guest access:**
1. A guest opens the public wedding URL or their unique invitation link.
2. The guest can view public wedding details without logging in.
3. When the guest opens an invitation-specific feature, the backend validates the invitation token.
4. The guest can submit an RSVP through the authorized link.
5. If the guest requests a private gallery, the system checks whether the guest is authorized for that specific wedding.
6. The guest cannot access another wedding's private information.

### 5.2 Authentication Flow

```
            User opens website
                    |
           +--------+--------+
           |                 |
      Admin/Manager         Guest
           |                 |
      Login page        Public website
           |                 |
   Enter credentials    No login required
           |                 |
  Backend authentication  View public details
           |                 |
     +-----+-----+       Need protected action?
     |           |            |
   Valid       Invalid     Validate unique link
     |           |            |
Dashboard     Reject      +---+---+
                          |       |
                        Valid   Invalid
                          |       |
                    Allow only  Deny protected
                    permitted   action
                    operation
```

### 5.3 Security Rules

- Admin and Manager dashboards must require authentication.
- The backend must enforce permissions; hiding frontend screens is not sufficient.
- Manager requests must be scoped to the Manager's assigned wedding.
- Guests must not be asked to create an account or log in for normal guest access.
- Guest-specific actions must validate the corresponding invitation token or other approved authorization mechanism.
- Tokens must be unpredictable, protected from exposure, and revocable.
- OTP is not part of Version 1.
- Password storage and session/token handling must follow secure implementation practices.
- Sensitive guest details must never be returned by public wedding APIs.

The exact authentication mechanism, session lifetime, password reset flow, and whether Google OAuth will be used for Admin/Manager authentication remain implementation decisions.

---

## 6. Multi-Wedding Architecture and Data Isolation

### 6.1 Overview

The platform is a reusable template, not a separate custom application for every couple. Each wedding has its own wedding record, Manager assignment, guest list, events, tasks, invitations, RSVPs, and gallery.

```
Make My Marriage Platform
|
+-- Wedding A
|   +-- Manager A
|   +-- Events A
|   +-- Guests A
|   +-- Invitations A
|   +-- RSVPs A
|   +-- Gallery A
|
+-- Wedding B
    +-- Manager B
    +-- Events B
    +-- Guests B
    +-- Invitations B
    +-- RSVPs B
    +-- Gallery B
```

### 6.2 Wedding-Level Isolation

- Each wedding has a unique `weddingId`.
- Related records contain the appropriate `weddingId`.
- The backend derives or validates the wedding scope from authenticated user permissions or a validated guest invitation token.
- The backend must not trust a client-provided `weddingId` without checking authorization.
- A Manager can access only the assigned wedding's management data.
- A guest invitation token must be associated with one wedding and one guest.
- Gallery authorization must be checked against the relevant wedding.
- Public APIs must return only information intended for public viewing.

This design prevents accidental cross-wedding data exposure.

---

## 7. Database Design

MongoDB Atlas will store structured application records. The following collections are the proposed logical schema; exact field types, validation rules, indexes, and embedded-versus-referenced choices will be finalized during implementation.

### 7.1 `users` Collection

Stores authenticated platform users (Admin and Manager).

```json
{
  "_id": "user_id",
  "name": "Manager Name",
  "email": "manager@example.com",
  "passwordHash": "secure_password_hash",
  "role": "manager",
  "weddingId": "wedding_id",
  "status": "active",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Notes:**
- Passwords must never be stored in plaintext.
- Role values must be validated.
- `weddingId` is required for a wedding-scoped Manager.
- Platform Administrator accounts may use a platform-level scope rather than a wedding assignment.

### 7.2 `weddings` Collection

Stores the main wedding website configuration.

```json
{
  "_id": "wedding_id",
  "coupleNames": ["Name One", "Name Two"],
  "slug": "sample-wedding",
  "description": "Wedding information",
  "startDate": "timestamp",
  "venueName": "Wedding Venue",
  "venueAddress": "Venue Address",
  "location": { "latitude": 0, "longitude": 0 },
  "managerIds": ["manager_user_id"],
  "status": "active",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 7.3 `events` Collection

Stores wedding events and schedules.

```json
{
  "_id": "event_id",
  "weddingId": "wedding_id",
  "name": "Wedding Ceremony",
  "description": "Ceremony details",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "venueName": "Venue Name",
  "venueAddress": "Venue Address",
  "isPublic": true,
  "createdAt": "timestamp"
}
```

### 7.4 `tasks` Collection

Stores wedding planning tasks.

```json
{
  "_id": "task_id",
  "weddingId": "wedding_id",
  "title": "Arrange decorations",
  "description": "Decoration preparation",
  "status": "pending",
  "dueDate": "timestamp",
  "assignedTo": "manager_user_id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 7.5 `expenses` Collection

Stores wedding expenses.

```json
{
  "_id": "expense_id",
  "weddingId": "wedding_id",
  "title": "Venue payment",
  "category": "venue",
  "amount": 0,
  "currency": "INR",
  "expenseDate": "timestamp",
  "notes": "",
  "createdAt": "timestamp"
}
```

### 7.6 `guests` Collection

Stores guest information.

```json
{
  "_id": "guest_id",
  "weddingId": "wedding_id",
  "name": "Guest Name",
  "email": "guest@example.com",
  "phone": "guest_phone",
  "invitationStatus": "pending",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Guest email is required for email-based invitations. Guest information must be accessible only to authorized management users and to the guest-specific flows that require it.

### 7.7 `invitations` Collection

Stores invitation metadata and the status of guest invitation links.

```json
{
  "_id": "invitation_id",
  "weddingId": "wedding_id",
  "guestId": "guest_id",
  "tokenHash": "hashed_invitation_token",
  "status": "sent",
  "sentAt": "timestamp",
  "expiresAt": "timestamp",
  "revokedAt": null,
  "createdAt": "timestamp"
}
```

> The raw invitation token is never stored. Only the hash is stored.

### 7.8 `rsvps` Collection

Stores RSVP responses.

```json
{
  "_id": "rsvp_id",
  "weddingId": "wedding_id",
  "guestId": "guest_id",
  "invitationId": "invitation_id",
  "response": "yes",
  "respondedAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 7.9 `photoAlbums` Collection

Stores photo album metadata.

```json
{
  "_id": "album_id",
  "weddingId": "wedding_id",
  "title": "Wedding Memories",
  "description": "Photos from the wedding",
  "accessType": "authorized_guests",
  "createdBy": "manager_user_id",
  "createdAt": "timestamp"
}
```

### 7.10 `photos` Collection

Stores photo metadata. Actual files are in Google Cloud Storage.

```json
{
  "_id": "photo_id",
  "weddingId": "wedding_id",
  "albumId": "album_id",
  "storageObjectKey": "wedding_id/album_id/photo_id.jpg",
  "originalFileName": "wedding-photo.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 1048576,
  "uploadedBy": "manager_user_id",
  "createdAt": "timestamp"
}
```

### 7.11 `notifications` Collection

Stores email delivery history.

```json
{
  "_id": "notification_id",
  "weddingId": "wedding_id",
  "guestId": "guest_id",
  "invitationId": "invitation_id",
  "type": "invitation",
  "status": "sent",
  "providerMessageId": "provider_message_id",
  "sentAt": "timestamp",
  "createdAt": "timestamp"
}
```

---

## 8. API Design Overview

All API endpoints are versioned under `/api/v1`.

Main API groups:

| Group | Prefix | Access |
|---|---|---|
| Authentication | `/api/v1/auth/` | Mixed |
| Platform Admin | `/api/v1/admin/` | Platform Administrator |
| Wedding Management | `/api/v1/weddings/{id}/` | Authorized Admin or Manager |
| Public Wedding | `/api/v1/public/weddings/{slug}/` | Public |
| Health | `/api/v1/health` | Public |

> See `docs/API-DD.md` (or `docs/API-DD.doc`) for complete endpoint specifications, request/response formats, and validation rules.

---

## 9. Email and Notification Design

- Email service: **Resend** (proposed).
- Invitation emails include the unique invitation link: `/w/[slug]/invite/[token]`.
- Reminder emails are sent to guests who have not responded.
- Delivery status is tracked in the `notifications` collection.
- Raw invitation tokens must never appear in email logs.
- The system must handle email provider failures without losing invitation records.

---

## 10. Photo Gallery Design

- Photos are stored in **Google Cloud Storage** in a private (non-public) bucket.
- MongoDB stores only the metadata (object key, album, file info, uploader).
- **Upload flow:** FastAPI generates a short-lived signed upload URL → frontend uploads directly to GCS → frontend calls the complete endpoint → FastAPI saves metadata.
- **Guest access flow:** Guest presents invitation token → FastAPI validates token and wedding authorization → FastAPI generates short-lived signed download URLs → frontend displays photos.
- Signed URLs expire after a configured lifetime.
- Private photos must never have permanent public object URLs.
- A guest from Wedding A must never be able to access Wedding B's gallery.

---

## 11. Wedding Location and QR Code

- Venue location is stored as latitude/longitude coordinates in the `weddings` collection.
- Google Maps / Places is proposed for venue display and lookup.
- A wedding-specific QR code encodes the public wedding website URL.
- The QR code must not contain invitation tokens or private information.
- QR code generation library to be chosen during implementation.

---

## 12. Livestream Information

- Livestream details (provider, URL, enabled flag) are stored in the `weddings` document.
- YouTube Live is proposed as the provider.
- Livestream is optional; the wedding website must work correctly when it is disabled.
- The platform links to the stream; it does not host a streaming service.

---

## 13. Frontend Application Design

### 13.1 Route Map

| URL | Audience |
|---|---|
| `/` | Platform landing page |
| `/login` | Shared Admin and Manager sign-in (role-based redirect) |
| `/admin` | Platform Administrator dashboard |
| `/dashboard` | Wedding Manager dashboard |
| `/w/[slug]` | Public wedding website |
| `/w/[slug]/invite/[token]` | Guest RSVP page (token-authorized) |
| `/w/[slug]/gallery` | Private photo gallery (requires valid invitation token) |

### 13.2 Design Notes

- Next.js App Router is used.
- Vanilla CSS with design tokens defined in `globals.css`.
- Google Fonts or similar for typography.
- Responsive layout for mobile and desktop.
- The guest-facing website must not require guests to download an application.

---

## 14. Deployment Architecture

### 14.1 Proposed Components

| Component | Technology | Decision Status |
|---|---|---|
| Frontend hosting | Google Cloud Run or Google Cloud VM | Pending |
| Backend hosting | Google Cloud Run or Google Cloud VM | Pending |
| Database | MongoDB Atlas | Confirmed direction |
| Media storage | Google Cloud Storage | Confirmed direction |
| Load balancing | Google Cloud Load Balancer | Proposed |
| CDN | Google Cloud CDN | Optional |

### 14.2 Open Deployment Decisions

- Confirm Cloud Run versus Compute Engine VM.
- Confirm whether Google Cloud Load Balancer is needed.
- Confirm whether Google Cloud CDN is required.
- Finalize custom domain and URL structure.
- Define development, testing, and production environments.
- Finalize secret management, monitoring, and backup configuration.

---

## 15. Performance and Scalability

The current planning estimate is fewer than 10,000 guests across the platform. This is an estimate, not a finalized capacity commitment.

Initial considerations:
- Index frequently queried MongoDB fields.
- Paginate guest lists, task lists, and photo collections.
- Store images in Google Cloud Storage rather than MongoDB.
- Generate thumbnails and optimized image sizes where appropriate.
- Avoid loading the entire gallery at once.
- Use caching only for data that is safe to cache.
- Keep private gallery authorization checks in place even when a CDN is used.
- Monitor database latency, API response times, email delivery, and storage usage.

Load testing should establish the actual capacity and performance targets before production release.

---

## 16. Reliability, Backups, and Monitoring

### 16.1 Reliability

- Return clear errors when APIs fail.
- Handle email provider failures without losing invitation records.
- Avoid duplicate RSVP records when a guest repeats a submission.
- Make invitation sending and RSVP processing safe to retry where possible.
- Record delivery status for invitation and reminder emails.

### 16.2 Backups

- Configure MongoDB Atlas backups according to the selected plan and recovery requirements.
- Define retention and restoration procedures.
- Protect media files through appropriate storage controls and recovery policies.
- Test restoration rather than assuming backups are sufficient.

### 16.3 Monitoring

Monitor:
- Frontend and backend errors.
- API latency and failure rates.
- Login failures and suspicious access attempts.
- Invitation and reminder delivery failures.
- RSVP submission failures.
- Unauthorized gallery access attempts.
- Database health and storage consumption.

Logs must avoid sensitive data such as passwords, raw invitation tokens, and unnecessary guest contact details.

---

## 17. Testing Strategy

### 17.1 Authentication Tests

- Admin can log in using valid credentials.
- Manager can log in using valid credentials.
- Invalid credentials are rejected.
- Unauthenticated users cannot access protected dashboards or APIs.
- Logout ends the appropriate authenticated session.
- A Manager cannot access another wedding's management APIs.

### 17.2 Guest Access Tests

- Guests can open the public wedding website without logging in.
- Guests are not required to create an account.
- Public pages do not reveal private guest information.
- A valid invitation link opens the correct invitation.
- An invalid, revoked, or expired token is rejected according to the defined policy.
- Guests can submit Yes/No responses through their authorized invitation link.
- No OTP is required for the Version 1 guest RSVP flow.
- Email link scanners do not accidentally submit an RSVP.

### 17.3 Gallery Tests

- An authorized guest can access the intended wedding gallery.
- A guest from Wedding A cannot access Wedding B's private gallery.
- A public wedding URL alone does not grant private gallery access.
- Expired signed URLs stop working according to their configured lifetime.
- Private photos are not exposed through permanent public object URLs.

### 17.4 Data Isolation Tests

- A Manager can view only their assigned wedding's data.
- Guest, event, task, expense, invitation, RSVP, and photo records remain scoped to the correct wedding.
- Manipulating an ID in a request does not bypass authorization.
- Public API responses contain only approved fields.

### 17.5 Functional Tests

- Wedding creation and Manager account creation work.
- Events and tasks can be created, updated, and retrieved.
- Expenses can be recorded and reviewed.
- Invitations and reminders can be sent.
- RSVP responses are saved correctly.
- Photo uploads and gallery access work.
- Location QR codes open the correct location.
- Optional livestream details appear when enabled.

---

## 18. Confirmed Decisions and Open Items

### 18.1 Confirmed Decisions

| Area | Decision |
|---|---|
| Product | Reusable multi-wedding platform |
| Frontend | Next.js |
| Backend | FastAPI |
| Database | MongoDB Atlas |
| Media storage | Google Cloud Storage |
| Admin authentication | Required |
| Manager authentication | Required |
| Guest login | Not required |
| Guest accounts | Not required |
| Guest RSVP | Yes/No through a unique invitation link |
| OTP | Not included in Version 1 |
| Invitations | Email-based |
| Email service | Resend proposed |
| Location | Google Maps / Places proposed |
| Livestream | Optional; YouTube Live proposed |
| Gallery access | Authorized guests of the relevant wedding |
| Data isolation | Required between weddings |
| Load balancer | Google Cloud Load Balancer proposed |
| CDN | Google Cloud CDN optional |
| Expected scale | Fewer than 10,000 guests is a planning estimate, not a finalized requirement |

### 18.2 Decisions to Finalize Later

1. Cloud Run versus Compute Engine VM.
2. Whether a Google Cloud Load Balancer is needed for the selected deployment.
3. Whether Google Cloud CDN is needed and how private content will be excluded from unsafe caching.
4. The exact authentication/session implementation for Admin and Manager.
5. Whether Google OAuth will be used for Admin/Manager authentication or another identity integration.
6. Admin's exact editing permissions versus supervisory permissions.
7. Guest access and gallery authorization when a guest loses their invitation link.
8. Invitation expiration, revocation, and reissue policies.
9. What to do when a guest does not have an email address.
10. The custom domain and wedding URL format.
11. Exact package versions and final service configuration.
12. Capacity, availability, backup, and recovery targets.
13. Whether additional features are needed beyond the Version 1 scope.

---

## 19. Recommended Implementation Order

1. Establish the Next.js frontend and FastAPI backend.
2. Configure MongoDB Atlas and the application data model.
3. Implement Admin and Manager authentication.
4. Implement backend role-based authorization and wedding-level isolation.
5. Build Platform Administrator onboarding for wedding and Manager creation.
6. Build wedding setup and public wedding pages.
7. Implement event, task, and expense management.
8. Implement guest management.
9. Implement unique invitation tokens and email delivery through Resend.
10. Implement guest RSVP with Yes/No and a confirmation page.
11. Implement reminder emails.
12. Implement private gallery uploads and authorized guest access.
13. Implement venue details and QR codes.
14. Add optional livestream support.
15. Implement monitoring, backups, security checks, and deployment.
16. Test the complete workflow and cross-wedding access restrictions.

---

## 20. Final Summary

Make My Marriage is a reusable wedding website and management platform in which each wedding has separate data, a dedicated Manager, and controlled access to wedding-specific features.

The most important authentication requirement is:
- **Admin:** Must log in with valid credentials.
- **Manager:** Must log in with valid credentials.
- **Guest:** Does not log in or create an account.

Guests view public wedding details without authentication. For guest-specific actions, such as submitting an RSVP or accessing a private gallery, the system validates a unique invitation link or another approved authorization mechanism. OTP is not included in Version 1.

Next.js, FastAPI, MongoDB Atlas, and Google Cloud Storage form the core proposed stack. Resend, Google Maps / Places, YouTube Live, Google Cloud Load Balancer, and Google Cloud CDN are included as proposed integrations or infrastructure components, with hosting and remaining implementation choices to be finalized later.
