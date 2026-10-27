# Database Design Document (DBDD)
**Make My Marriage — Wedding Website Platform**

| Field | Value |
|---|---|
| Document Version | 1.0 |
| Product Name | Make My Marriage |
| Release Scope | Version 1 (MVP) |

> **Note:** The original source file is `docs/DBDD.doc`. This Markdown version is a faithful conversion for readability. Do not treat this file as the authoritative source if it conflicts with the original. DBDD v1.0 supersedes PRD v1.0 where they conflict.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Database Technology](#2-database-technology)
3. [Database Architecture](#3-database-architecture)
4. [Collection Design](#4-collection-design)
5. [Collection Relationships](#5-collection-relationships)
6. [Index Design](#6-index-design)
7. [Data Validation](#7-data-validation)
8. [Database Security and Privacy](#8-database-security-and-privacy)
9. [Data Lifecycle and Deletion](#9-data-lifecycle-and-deletion)
10. [Database Backup and Recovery](#10-database-backup-and-recovery)
11. [Query Examples](#11-query-examples)
12. [Implementation Notes](#12-implementation-notes)
13. [Final Summary](#13-final-summary)

---

## 1. Introduction

### 1.1 Purpose

This document defines the database design for Make My Marriage Version 1. It covers:

- Collection names and their purposes.
- Field definitions, data types, and descriptions.
- Primary identifiers and references.
- Indexes and validation rules.
- Data privacy and security.
- Example database documents.
- Data access and lifecycle rules.

The database will be implemented using MongoDB Atlas, a managed cloud database service.

### 1.2 Project Overview

Make My Marriage is a reusable wedding website and management platform. The Platform Administrator creates wedding websites and Manager accounts. Each Manager manages their assigned wedding. Admin has a supervisory role, and guests access public wedding information without logging in.

The database must support multiple weddings while keeping each wedding's private data separate.

### 1.3 Database Design Principles

1. Each wedding must have a unique identifier.
2. Every wedding-specific record must be associated with the correct wedding.
3. Admin and Manager accounts must be stored securely.
4. Passwords must never be stored as plain text.
5. Guests must not need database user accounts or login credentials.
6. Each guest invitation must have a unique, secure token.
7. Guest RSVP responses must be associated with the correct guest and wedding.
8. Private wedding photos must be stored securely.
9. Guest contact information must not be exposed through public APIs.
10. Collections must be designed to support efficient queries and future growth.

---

## 2. Database Technology

### 2.1 MongoDB Atlas

MongoDB Atlas will be the primary database for the application. MongoDB stores data as BSON documents organized into collections.

The database will contain collections for:
- Users
- Weddings
- Events
- Tasks
- Expenses
- Guests
- Invitations
- RSVPs
- Photo albums
- Photos
- Notifications

### 2.2 Database Name

Proposed database name: `make_my_marriage`

The final database name can be adjusted during implementation.

### 2.3 Data Storage Approach

MongoDB will store application data and metadata. Wedding photos and other uploaded media will be stored in **Google Cloud Storage**, not directly inside MongoDB documents. MongoDB will store the photo metadata and the corresponding storage object key. This avoids storing large image files directly in the database.

---

## 3. Database Architecture

The following diagram represents the logical relationship between the collections.

```
                     USERS
                       |
                       | manager assignment
                       |
                    WEDDINGS
                       |
   +-------------------+--------------------+
   |          |         |         |         |
   v          v         v         v         v
 EVENTS     TASKS    EXPENSES   GUESTS   PHOTO ALBUMS
                                  |           |
                                  v           v
                             INVITATIONS    PHOTOS
                                  |
                                  v
                                 RSVPS

                NOTIFICATIONS
                     |
                     +----> Wedding / Guest / Invitation
```

This is a logical relationship diagram. In MongoDB, these relationships are represented through document identifiers such as `weddingId`, `guestId`, and `invitationId`.

---

## 4. Collection Design

### 4.1 `users` Collection

**Purpose:** Stores authenticated user accounts, including Admin and Manager accounts. Guests will not have user records because they do not log in.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique user identifier |
| `name` | String | User's full name |
| `email` | String | Login email address |
| `passwordHash` | String | Secure password hash |
| `role` | String | `admin` or `manager` |
| `weddingId` | ObjectId or null | Assigned wedding for a wedding-scoped Manager |
| `status` | String | `active`, `inactive`, or `suspended` |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last update timestamp |
| `lastLoginAt` | Date or null | Most recent successful login |

Platform-level administrators may have no wedding assignment. The precise distinction between the Platform Administrator and wedding-level Admin must follow the final role and permission rules.

**Example Document:**
```json
{
  "_id": "ObjectId",
  "name": "Wedding Manager",
  "email": "manager@example.com",
  "passwordHash": "secure_hash_value",
  "role": "manager",
  "weddingId": "ObjectId",
  "status": "active",
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z",
  "lastLoginAt": null
}
```

**Rules:**
- Never store plaintext passwords.
- Normalize email addresses before enforcing uniqueness.
- Only authenticated and authorized users can access protected management functions.
- Managers must be restricted to their assigned wedding.
- Guests must not be stored in this collection.

---

### 4.2 `weddings` Collection

**Purpose:** Stores the main configuration and public information for each wedding website. Each wedding has its own unique record.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique wedding identifier |
| `coupleNames` | Array of Strings | Names of the couple |
| `slug` | String | Public website identifier |
| `description` | String | Wedding introduction |
| `startDate` | Date or null | Main wedding date |
| `timezone` | String | Wedding's local time zone |
| `venueName` | String | Wedding venue name |
| `venueAddress` | String | Full venue address |
| `location` | Object | Latitude and longitude |
| `managerIds` | Array of ObjectIds | Assigned Manager accounts |
| `status` | String | `draft`, `active`, or `archived` |
| `livestream` | Object or null | Optional livestream configuration |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "coupleNames": ["Person One", "Person Two"],
  "slug": "person-one-person-two",
  "description": "Welcome to our wedding website",
  "startDate": "2027-01-15T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "venueName": "Example Wedding Hall",
  "venueAddress": "Example City, India",
  "location": { "latitude": 13.0, "longitude": 78.0 },
  "managerIds": ["ObjectId"],
  "status": "active",
  "livestream": {
    "enabled": false,
    "provider": null,
    "url": null
  },
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Each wedding must have a unique slug if slugs are globally unique.
- Public pages may expose only approved wedding fields.
- Manager assignments must be validated by the backend.
- Private guest information must not be stored in public wedding fields.
- The livestream URL must only be exposed according to the wedding's access policy.

---

### 4.3 `events` Collection

**Purpose:** Stores wedding events and schedules, such as ceremonies, receptions, and other functions.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique event identifier |
| `weddingId` | ObjectId | Parent wedding |
| `name` | String | Event name |
| `description` | String | Event details |
| `startTime` | Date | Event start time |
| `endTime` | Date or null | Event end time |
| `venueName` | String | Event venue |
| `venueAddress` | String | Venue address |
| `location` | Object or null | Optional coordinates |
| `isPublic` | Boolean | Whether event details are publicly visible |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "name": "Wedding Ceremony",
  "description": "Main wedding ceremony",
  "startTime": "2027-01-15T09:00:00Z",
  "endTime": "2027-01-15T12:00:00Z",
  "venueName": "Example Wedding Hall",
  "venueAddress": "Example City, India",
  "location": { "latitude": 13.0, "longitude": 78.0 },
  "isPublic": true,
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Every event must belong to one wedding.
- Event times should be stored as BSON Date values.
- The frontend should display times in the wedding's configured time zone.
- Only authorized users may create, update, or delete events.
- Public APIs must return only public event information.

---

### 4.4 `tasks` Collection

**Purpose:** Stores wedding planning tasks managed by the Manager.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique task identifier |
| `weddingId` | ObjectId | Parent wedding |
| `title` | String | Task title |
| `description` | String | Task details |
| `status` | String | `pending`, `in_progress`, `completed`, or `cancelled` |
| `priority` | String | `low`, `medium`, or `high` |
| `dueDate` | Date or null | Task deadline |
| `assignedTo` | ObjectId or null | Assigned user |
| `createdBy` | ObjectId | User who created the task |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "title": "Arrange wedding decorations",
  "description": "Coordinate decorations with the vendor",
  "status": "pending",
  "priority": "high",
  "dueDate": "2027-01-10T00:00:00Z",
  "assignedTo": "ObjectId",
  "createdBy": "ObjectId",
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Every task must belong to a wedding.
- Task status must use the approved values.
- The assigned user must be authorized for that wedding.
- Only permitted management users can change tasks.

---

### 4.5 `expenses` Collection

**Purpose:** Stores wedding-related expenses and supports budget tracking.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique expense identifier |
| `weddingId` | ObjectId | Parent wedding |
| `title` | String | Expense title |
| `category` | String | Expense category |
| `amount` | Decimal128 | Expense amount |
| `currency` | String | Currency code, such as `INR` |
| `expenseDate` | Date | Date of expense |
| `notes` | String or null | Additional information |
| `createdBy` | ObjectId | User who created the record |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "title": "Venue advance payment",
  "category": "venue",
  "amount": "Decimal128(25000.00)",
  "currency": "INR",
  "expenseDate": "2026-10-16T00:00:00Z",
  "notes": "Advance payment",
  "createdBy": "ObjectId",
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Store monetary values using Decimal128 or another precise monetary representation.
- Do not use binary floating-point values for financial calculations.
- Every expense must be associated with the correct wedding.
- Only authorized management users may view or modify expenses.

---

### 4.6 `guests` Collection

**Purpose:** Stores guest contact details and invitation-management information. Guests do not have login accounts.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique guest identifier |
| `weddingId` | ObjectId | Parent wedding |
| `name` | String | Guest name |
| `email` | String or null | Email address used for invitations |
| `phone` | String or null | Guest phone number |
| `invitationStatus` | String | `not_sent`, `sent`, `delivered`, `failed`, or `revoked` |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "name": "Guest One",
  "email": "guest@example.com",
  "phone": "+910000000000",
  "invitationStatus": "sent",
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Guest records must always be associated with a wedding.
- Guest contact details must be private.
- Public wedding APIs must never return the entire guest list.
- Guests must not be able to browse other guests' records.
- Email and phone fields must allow appropriate international formats.
- A guest may appear in more than one wedding, so their email or phone should not automatically be globally unique.

---

### 4.7 `invitations` Collection

**Purpose:** Stores individual invitations sent to guests. Each invitation has a unique, secure token that identifies the associated guest and wedding.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique invitation identifier |
| `weddingId` | ObjectId | Parent wedding |
| `guestId` | ObjectId | Associated guest |
| `tokenHash` | String | Hash of the invitation token |
| `status` | String | `pending`, `sent`, `failed`, `revoked`, or `expired` |
| `sentAt` | Date or null | Email sending timestamp |
| `expiresAt` | Date or null | Optional expiration timestamp |
| `revokedAt` | Date or null | Revocation timestamp |
| `createdBy` | ObjectId | Manager who created the invitation |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "guestId": "ObjectId",
  "tokenHash": "secure_token_hash",
  "status": "sent",
  "sentAt": "2026-10-16T10:00:00Z",
  "expiresAt": null,
  "revokedAt": null,
  "createdBy": "ObjectId",
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Generate a cryptographically secure, unpredictable token for each invitation.
- Store the token hash rather than the raw token where practical.
- Do not expose the token hash through APIs.
- Validate the token before accepting RSVP responses or granting private gallery access.
- A token must never authorize access to a different wedding.
- Support revoking and replacing invitation links.
- Define the expiration policy before implementation.
- OTP is not used in this flow.

> **Important design decision:** A guest does not need a user account. The invitation token provides the authorization needed for guest-specific actions. The backend must validate the token and its associated guest and wedding before allowing those actions.

---

### 4.8 `rsvps` Collection

**Purpose:** Stores each guest's RSVP response.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique RSVP identifier |
| `weddingId` | ObjectId | Parent wedding |
| `guestId` | ObjectId | Guest who responded |
| `invitationId` | ObjectId | Invitation used to authorize the response |
| `response` | String | `yes` or `no` |
| `respondedAt` | Date | Time of response |
| `updatedAt` | Date | Last response update |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "guestId": "ObjectId",
  "invitationId": "ObjectId",
  "response": "yes",
  "respondedAt": "2026-10-16T10:30:00Z",
  "updatedAt": "2026-10-16T10:30:00Z"
}
```

**Rules:**
- Only `yes` and `no` are accepted in Version 1.
- The backend must validate the invitation token before saving a response.
- The guest must be associated with the same wedding as the invitation.
- The system must define whether a guest can change a previously submitted response.
- Duplicate submissions must not create inconsistent RSVP records.

> **Recommended approach:** Maintain one current RSVP record per guest per wedding. Use an upsert or controlled update to change the response. If response history is needed later, introduce a separate RSVP history collection.

---

### 4.9 `photoAlbums` Collection

**Purpose:** Stores information about wedding photo albums.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique album identifier |
| `weddingId` | ObjectId | Parent wedding |
| `title` | String | Album title |
| `description` | String or null | Album description |
| `accessType` | String | `public` or `authorized_guests` |
| `createdBy` | ObjectId | User who created the album |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "title": "Wedding Memories",
  "description": "Photos from the wedding",
  "accessType": "authorized_guests",
  "createdBy": "ObjectId",
  "createdAt": "2026-10-16T10:00:00Z",
  "updatedAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Every album must belong to one wedding.
- The Manager must be authorized to create or update albums.
- A private album must not be accessible merely because someone knows its URL.
- Gallery authorization must be validated by the backend.

---

### 4.10 `photos` Collection

**Purpose:** Stores photo metadata. Actual photo files are stored in Google Cloud Storage.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique photo identifier |
| `weddingId` | ObjectId | Parent wedding |
| `albumId` | ObjectId | Parent album |
| `storageObjectKey` | String | Object key in Google Cloud Storage |
| `originalFileName` | String | Original filename |
| `contentType` | String | File MIME type |
| `sizeBytes` | Long | File size in bytes |
| `uploadedBy` | ObjectId | Manager who uploaded the photo |
| `createdAt` | Date | Upload timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "albumId": "ObjectId",
  "storageObjectKey": "wedding_id/album_id/photo_id.jpg",
  "originalFileName": "wedding-photo.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 1048576,
  "uploadedBy": "ObjectId",
  "createdAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Store photo binaries in Google Cloud Storage, not MongoDB.
- Keep private storage objects non-public.
- Do not store permanent public URLs for private photos.
- Check gallery authorization before issuing a short-lived signed URL.
- Validate upload size and file type.
- A photo's wedding and album must match.
- A Manager must only upload to an authorized wedding.

---

### 4.11 `notifications` Collection

**Purpose:** Stores the history and status of invitation and reminder emails.

**Fields:**

| Field | Data Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique notification identifier |
| `weddingId` | ObjectId | Parent wedding |
| `guestId` | ObjectId | Recipient guest |
| `invitationId` | ObjectId or null | Related invitation, if applicable |
| `type` | String | `invitation` or `reminder` |
| `status` | String | `queued`, `sent`, `delivered`, `failed`, or `bounced` |
| `providerMessageId` | String or null | Email provider's message ID |
| `sentAt` | Date or null | Sending timestamp |
| `createdAt` | Date | Creation timestamp |

**Example Document:**
```json
{
  "_id": "ObjectId",
  "weddingId": "ObjectId",
  "guestId": "ObjectId",
  "invitationId": "ObjectId",
  "type": "invitation",
  "status": "sent",
  "providerMessageId": "provider_message_id",
  "sentAt": "2026-10-16T10:00:00Z",
  "createdAt": "2026-10-16T10:00:00Z"
}
```

**Rules:**
- Do not store invitation tokens in notification logs.
- Store only the metadata required to track email delivery.
- Update delivery status when the email provider supplies reliable delivery events.
- Protect notification history from unauthorized access.

---

## 5. Collection Relationships

The following table summarizes how the collections relate to one another.

| Parent Collection | Related Collection | Relationship |
|---|---|---|
| `weddings` | `users` | A wedding can have assigned Managers |
| `weddings` | `events` | One wedding can have many events |
| `weddings` | `tasks` | One wedding can have many tasks |
| `weddings` | `expenses` | One wedding can have many expenses |
| `weddings` | `guests` | One wedding can have many guests |
| `guests` | `invitations` | One guest can have multiple invitation records over time |
| `invitations` | `rsvps` | An RSVP references the invitation used |
| `weddings` | `photoAlbums` | One wedding can have multiple albums |
| `photoAlbums` | `photos` | One album can have many photos |
| `guests` | `notifications` | A guest can receive multiple emails |
| `weddings` | `notifications` | One wedding can have many notification records |

### 5.1 Reference Strategy

MongoDB ObjectIds will be used to reference related records. For example, a task references its wedding through `weddingId`. The backend must verify that both the task and wedding belong to the correct authorized scope before performing an operation.

The database should not rely solely on references supplied by the frontend.

---

## 6. Index Design

Indexes help MongoDB retrieve records efficiently. The following indexes are recommended for Version 1.

| Collection | Field(s) | Index Type | Purpose |
|---|---|---|---|
| `users` | `emailNormalized` | Unique | Prevent duplicate login identities |
| `weddings` | `slug` | Unique | Find a wedding by public URL |
| `users` | `weddingId`, `role` | Compound | Find assigned users |
| `events` | `weddingId`, `startTime` | Compound | List wedding events by date |
| `tasks` | `weddingId`, `status`, `dueDate` | Compound | Filter tasks and deadlines |
| `expenses` | `weddingId`, `expenseDate` | Compound | Retrieve expenses by date |
| `guests` | `weddingId`, `name` | Compound | Search guest records |
| `invitations` | `tokenHash` | Unique | Validate an invitation token efficiently |
| `invitations` | `weddingId`, `guestId` | Non-unique | Find invitations for a guest |
| `rsvps` | `weddingId`, `guestId` | Unique | Keep one current RSVP per guest per wedding |
| `photoAlbums` | `weddingId`, `createdAt` | Compound | List albums for a wedding |
| `photos` | `weddingId`, `albumId`, `createdAt` | Compound | Retrieve album photos |
| `notifications` | `weddingId`, `guestId`, `createdAt` | Compound | Retrieve notification history |

These indexes should be created before the system goes to production. Additional indexes may be needed based on query patterns.

---

## 7. Data Validation

### 7.1 General Field Validation

- Required fields must be present.
- Identifiers must be valid ObjectIds.
- Dates must be valid timestamps.
- Strings must have reasonable length limits.
- Numeric fields must follow defined ranges.
- Enum fields must use approved values.
- All referenced records must exist and belong to the correct wedding.

### 7.2 Authentication Validation

- User email must be normalized consistently.
- Passwords must be securely hashed.
- Inactive or suspended accounts must not authenticate.
- Only authorized roles may access management APIs.
- Guest records must not be treated as authenticated user records.

### 7.3 RSVP Validation

- The invitation token must be valid.
- The invitation must not be revoked or expired under the chosen policy.
- The guest and invitation must belong to the same wedding.
- The response must be `yes` or `no`.
- A guest must not be able to submit an RSVP for another guest by changing an identifier.

### 7.4 Expense Validation

- Amounts must be valid non-negative monetary values.
- Currency must be a supported currency code.
- Amount calculations must avoid floating-point precision errors.

### 7.5 Photo Validation

- Uploads must satisfy allowed file-type and size rules.
- The referenced album must exist.
- The photo and album must belong to the same wedding.
- The uploader must be authorized to upload to that wedding.

---

## 8. Database Security and Privacy

### 8.1 Admin and Manager Data

Admin and Manager must authenticate before accessing protected dashboards. FastAPI must validate the user's role and permissions on every protected operation.

### 8.2 Guest Data

Guests do not need to log in. However, guest contact information and private RSVP details must remain protected.

Public wedding pages must not expose:
- Guest phone numbers.
- Guest email addresses.
- Full guest lists.
- Invitation token hashes or raw tokens.
- Private RSVP records.
- Internal notification records.

### 8.3 Wedding-Level Data Isolation

Every wedding-specific query must use the correct wedding scope.

```python
# Illustrative pseudocode only
task = await db.tasks.find_one({
    "_id": task_id,
    "weddingId": authorized_wedding_id
})
```

The backend must obtain `authorized_wedding_id` from the authenticated user's permissions or another validated authorization context. It must not blindly trust an identifier supplied by the browser.

### 8.4 Invitation Token Security

- Generate unpredictable tokens using a cryptographically secure generator.
- Store a token hash where practical.
- Never store raw invitation tokens in application logs.
- Support token revocation.
- Require HTTPS.
- Avoid placing tokens in analytics events or third-party tracking URLs.
- Rate-limit sensitive public endpoints.

### 8.5 Google Cloud Storage Security

- Keep private photos in a non-public bucket.
- Restrict storage access to authorized backend services.
- Do not expose service account credentials in frontend code.
- Issue short-lived signed URLs only after authorization.
- Ensure a signed URL grants access only to the intended object.
- Configure CDN behavior so private media cannot leak across users or weddings.

---

## 9. Data Lifecycle and Deletion

### 9.1 Wedding Archiving

When a wedding is archived:
- Its public website may be disabled or changed to read-only, according to the product rules.
- Management access should follow the selected policy.
- Existing data should remain available only to authorized users.
- Private gallery access should follow the wedding's retention policy.

### 9.2 Guest Removal

When a guest is removed:
- Revoke or invalidate their active invitation links.
- Prevent further RSVP changes through revoked links.
- Decide whether their previous RSVP is retained for audit purposes.
- Remove or anonymize personal data when required by the retention policy.

### 9.3 Wedding Deletion

Deletion should not automatically be treated as deleting only the main wedding document. The implementation must define how to handle related:
- Events
- Tasks
- Expenses
- Guests
- Invitations
- RSVPs
- Notifications
- Photo albums
- Photos in Google Cloud Storage

Use a controlled deletion or archival workflow so that database records and media files do not become inconsistent.

### 9.4 Retention Policy

The exact retention period for guest contact information, invitations, RSVP records, email logs, and uploaded photos remains to be finalized.

---

## 10. Database Backup and Recovery

MongoDB Atlas backup configuration must be selected based on the production plan and the project's recovery requirements.

The system should define:
- Backup frequency.
- Retention period.
- Recovery Point Objective (RPO).
- Recovery Time Objective (RTO).
- Who can restore a backup.
- How restoration is tested.
- How media in Google Cloud Storage is recovered.

Backup availability and recovery capabilities depend on the selected service plan and configuration.

---

## 11. Query Examples

The following examples illustrate common database operations. They are examples for design purposes, not complete production code.

### 11.1 Retrieve Events for a Wedding

```javascript
db.events.find({
  weddingId: ObjectId("WEDDING_OBJECT_ID")
}).sort({
  startTime: 1
})
```

### 11.2 Retrieve Guests for a Wedding

```javascript
db.guests.find({
  weddingId: ObjectId("WEDDING_OBJECT_ID")
}).sort({
  name: 1
})
```

This query must be executed only after the backend confirms that the requesting user is authorized to access the wedding's guest list.

### 11.3 Retrieve RSVP Summary

```javascript
db.rsvps.aggregate([
  {
    $match: {
      weddingId: ObjectId("WEDDING_OBJECT_ID")
    }
  },
  {
    $group: {
      _id: "$response",
      count: { $sum: 1 }
    }
  }
])
```

This query can support a dashboard summary of Yes and No responses.

### 11.4 Retrieve Pending Tasks

```javascript
db.tasks.find({
  weddingId: ObjectId("WEDDING_OBJECT_ID"),
  status: { $in: ["pending", "in_progress"] }
}).sort({
  dueDate: 1
})
```

### 11.5 Retrieve Photos for an Album

```javascript
db.photos.find({
  weddingId: ObjectId("WEDDING_OBJECT_ID"),
  albumId: ObjectId("ALBUM_OBJECT_ID")
}).sort({
  createdAt: -1
})
```

For private galleries, this query must run only after validating guest authorization for the wedding.

---

## 12. Implementation Notes

The following items should be confirmed during implementation:

1. Final role definitions for Platform Administrator and wedding-level Admin.
2. Whether a wedding can have multiple Managers.
3. Whether guest email addresses are mandatory for invitations.
4. Invitation expiration and revocation policies.
5. Whether guests can change their RSVP after submitting it.
6. Private gallery authorization rules for guests who lose their invitation links.
7. Wedding and guest data retention periods.
8. Exact MongoDB validation rules and indexes.
9. Backup and recovery requirements.
10. Any future requirements for additional guest categories or attendance counts.

---

## 13. Final Summary

The Make My Marriage database will use MongoDB Atlas with separate collections for users, weddings, events, tasks, expenses, guests, invitations, RSVPs, photo albums, photos, and notifications.

Each wedding will have its own identifier, and all wedding-related records will be scoped to that wedding.

Admin and Manager will authenticate using credentials. Guests will not have login accounts. Guests will use public website links to view public wedding information and secure invitation links for RSVP and other authorized guest-specific features.

Private photos will be stored in Google Cloud Storage, while MongoDB stores their metadata. FastAPI will enforce authentication, authorization, validation, and wedding-level data isolation.

This document provides the proposed database baseline for the Version 1 implementation. Exact validation rules, retention policies, and deployment-specific configurations will be finalized before production release.
