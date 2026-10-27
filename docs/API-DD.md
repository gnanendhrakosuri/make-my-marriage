# API Design Document (API-DD)
**Make My Marriage — Wedding Website Platform**

| Field | Value |
|---|---|
| Document Version | 1.0 |
| Status | Initial API Design |
| Related Documents | PRD, SDD v1.2, Database Design Document |
| Frontend | Next.js |
| Backend | FastAPI |
| Database | MongoDB Atlas |
| Media Storage | Google Cloud Storage |
| API Style | REST API |
| Base Path | `/api/v1` |

---

## 1. Introduction


### 1.1 Purpose

This document defines the APIs required to implement the Make My Marriage platform.
It explains:
- Which APIs are required for each feature.
- Which HTTP methods are used.
- What data the frontend sends to the backend.
- What data the backend returns.
- Which APIs require authentication.
- Which APIs guests can access without logging in.
- How the backend validates requests.
- How the backend handles errors.
- How the APIs interact with MongoDB Atlas and external services.

### 1.2 Project Overview

Make My Marriage is a reusable wedding website and management platform. Multiple weddings can use the same platform while maintaining separate wedding information, guest lists, invitations, RSVP responses, expenses, tasks, and galleries.
The Platform Administrator creates wedding websites and Manager accounts. Admin provides wedding-level supervision, and Manager handles day-to-day wedding operations.
Guests can access public wedding information without creating an account or logging in.

### 1.3 API Design Principles

1. Use REST APIs for communication between Next.js and FastAPI.
2. Use JSON for standard request and response bodies.
3. Use HTTP status codes appropriately.
4. Require authentication for Admin and Manager management operations.
5. Validate permissions on the backend.
6. Scope wedding-specific operations to the correct wedding.
7. Do not expose private guest information through public APIs.
8. Use unique invitation links for guest-specific authorization.
9. Do not implement OTP authentication in Version 1.
10. Store photo files in Google Cloud Storage and their metadata in MongoDB Atlas.


## 2. API Architecture


### 2.1 Request Flow

Admin / Manager / Guest
           |
           v
    Next.js Frontend
           |
           v
      FastAPI Backend
           |
           +-------------------+
           |                   |
           v                   v
    MongoDB Atlas        External Services
           |             - Resend
           |             - Google Maps
           |             - YouTube Live
           |
           v
    Application Data

Photo upload/download:
Next.js <----authorized upload/access----> Google Cloud Storage
                     ^
                     |
                  FastAPI
The frontend calls FastAPI endpoints. FastAPI validates requests, checks permissions, performs business logic, and accesses MongoDB Atlas or other services.
For photo uploads, FastAPI can issue a short-lived signed upload URL so the frontend can upload directly to Google Cloud Storage without exposing cloud credentials.

### 2.2 Base URL

Development example:
http://localhost:8000/api/v1
Production example:
https://api.example.com/api/v1
The production domain is a placeholder and will be decided later.

### 2.3 Standard Request Format

Example:
POST /api/v1/weddings/{weddingId}/events
Content-Type: application/json
Authorization: Bearer <access_token>
Example JSON body:
{
  "name": "Wedding Ceremony",
  "description": "Main wedding ceremony",
  "startTime": "2027-01-15T09:00:00Z",
  "endTime": "2027-01-15T12:00:00Z",
  "venueName": "Example Wedding Hall",
  "venueAddress": "Example City, India",
  "isPublic": true
}
The backend must validate the user's identity, role, wedding assignment, and request fields before creating the event.

### 2.4 Standard Success Response

Example:
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "event_id",
    "weddingId": "wedding_id",
    "name": "Wedding Ceremony"
  }
}

### 2.5 Standard Error Response

Example:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data",
    "details": [
      {
        "field": "startTime",
        "message": "A valid start time is required"
      }
    ]
  }
}
The exact response schema should be applied consistently across API endpoints.


## 3. Authentication and Authorization


### 3.1 Authentication Rules

User Type
Login Required?
Access Method
Platform Administrator
Yes
Credentials and authorized platform access
Admin
Yes
Credentials and authorized dashboard access
Manager
Yes
Credentials and assigned wedding access
Guest
No
Public website and authorized invitation links
Guests do not create accounts or use a login page.

### 3.2 Authentication APIs

Method
Endpoint
Purpose
Access
POST
/auth/login
Authenticate Admin or Manager
Public endpoint; credentials required
POST
/auth/logout
End the current session
Authenticated
GET
/auth/me
Retrieve the current user's profile
Authenticated
POST
/auth/password-reset/request
Request a password reset
Public endpoint
POST
/auth/password-reset/confirm
Complete a password reset
Valid reset token
Password reset is a proposed supporting feature and should be confirmed in the final requirements.

### 3.3 Login API

Endpoint: POST /api/v1/auth/login
Request:
{
  "email": "manager@example.com",
  "password": "user_provided_password"
}
Successful response, illustrative session-based design:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Wedding Manager",
      "role": "manager",
      "weddingId": "wedding_id"
    }
  }
}
The server establishes the authenticated session using a secure mechanism, such as an HTTP-only secure cookie.
The response must not contain the user's password or password hash.
Expected behavior:
1. Validate the submitted credentials.
2. Verify that the account is active.
3. Establish the authenticated session.
4. Return the user's permitted profile and role.
5. Reject invalid credentials without revealing whether a particular email exists.
Authentication implementation note: Secure cookie-based sessions are a suitable option for a browser-based application. If bearer tokens are chosen instead, their issuance, storage, expiration, refresh, and revocation must be defined separately.

### 3.4 Logout API

Endpoint: POST /api/v1/auth/logout
Authentication: Required.
Purpose:
- End the current authenticated session.
- Clear or invalidate the relevant session credentials.
Successful response:
{
  "success": true,
  "message": "Logout successful"
}

### 3.5 Current User API

Endpoint: GET /api/v1/auth/me
Authentication: Required.
Example response:
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Wedding Manager",
    "email": "manager@example.com",
    "role": "manager",
    "weddingId": "wedding_id"
  }
}
The backend must return only information the authenticated user is allowed to access.


## 4. Platform Administration APIs

These APIs support platform onboarding.
The precise distinction between Platform Administrator and wedding-level Admin must follow the final role and permission definitions.

### 4.1 Create Wedding

Endpoint: POST /api/v1/admin/weddings
Authentication: Platform Administrator required.
Request:
{
  "coupleNames": [
    "Person One",
    "Person Two"
  ],
  "slug": "person-one-person-two",
  "description": "Welcome to our wedding",
  "startDate": "2027-01-15T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "venueName": "Example Wedding Hall",
  "venueAddress": "Example City, India"
}
Purpose:
- Create a new wedding record.
- Validate the requested slug.
- Store the wedding in MongoDB Atlas.
- Return the new wedding identifier.

### 4.2 List Weddings

Endpoint: GET /api/v1/admin/weddings
Authentication: Platform Administrator required.
Purpose:
- List weddings the Platform Administrator is authorized to manage.
- Support pagination and optional status filtering.
Example query:
GET /api/v1/admin/weddings?page=1&limit=20&status=active

### 4.3 Create Manager Account

Endpoint: POST /api/v1/admin/managers
Authentication: Platform Administrator required.
Request:
{
  "name": "Wedding Manager",
  "email": "manager@example.com",
  "weddingId": "wedding_id"
}
The account creation flow must establish a secure way for the Manager to set their password. The password should not be sent in plaintext through an email.
Recommended approach:
- Create the Manager account.
- Send a time-limited account activation or password-setup link.
- Allow the Manager to set a password securely.
This is an account setup flow, not OTP-based guest authentication.

### 4.4 List Managers

Endpoint: GET /api/v1/admin/managers
Authentication: Platform Administrator required.
Purpose:
- Retrieve authorized Manager accounts.
- Support pagination and filtering by wedding or account status.

### 4.5 Update Manager

Endpoint: PATCH /api/v1/admin/managers/{managerId}
Authentication: Platform Administrator required.
Purpose:
- Update permitted Manager details.
- Activate or deactivate an account.
- Change a Manager's wedding assignment when authorized.
The backend must prevent unauthorized changes to roles or assignments.


## 5. Wedding Website APIs


### 5.1 Get Public Wedding Details

Endpoint: GET /api/v1/public/weddings/{slug}
Authentication: Not required.
Purpose:
- Retrieve information intended for public display.
Example response:
{
  "success": true,
  "data": {
    "slug": "person-one-person-two",
    "coupleNames": [
      "Person One",
      "Person Two"
    ],
    "description": "Welcome to our wedding",
    "startDate": "2027-01-15T00:00:00Z",
    "timezone": "Asia/Kolkata",
    "venueName": "Example Wedding Hall",
    "venueAddress": "Example City, India"
  }
}
The response must not contain private guest information, internal user details, or invitation tokens.

### 5.2 Update Wedding Details

Endpoint: PATCH /api/v1/weddings/{weddingId}
Authentication: Authorized Admin or Manager, according to permissions.
Purpose:
- Update wedding information.
- Update the description, dates, venue, and other permitted fields.
The backend must check the user's wedding assignment and role before making changes.

### 5.3 Get Wedding Dashboard Summary

Endpoint: GET /api/v1/weddings/{weddingId}/dashboard
Authentication: Authorized Admin or Manager.
Purpose:
- Return summary information for the dashboard.
Possible response fields:
- Total guests.
- Invitations sent.
- RSVP Yes count.
- RSVP No count.
- Pending invitations.
- Upcoming events.
- Pending tasks.
- Expense totals.
The backend should calculate or retrieve only the metrics the user is permitted to see.


## 6. Event Management APIs

These APIs support wedding schedules and event details.
Method
Endpoint
Purpose
Access
POST
/weddings/{weddingId}/events
Create an event
Authorized Admin/Manager
GET
/weddings/{weddingId}/events
List events for management
Authorized Admin/Manager
GET
/weddings/{weddingId}/events/{eventId}
Retrieve one event
Authorized Admin/Manager
PATCH
/weddings/{weddingId}/events/{eventId}
Update an event
Authorized Admin/Manager
DELETE
/weddings/{weddingId}/events/{eventId}
Delete an event
Authorized Admin/Manager
GET
/public/weddings/{slug}/events
List public events
Public

### 6.1 Create Event

Endpoint: POST /api/v1/weddings/{weddingId}/events
Request:
{
  "name": "Wedding Ceremony",
  "description": "Main wedding ceremony",
  "startTime": "2027-01-15T09:00:00Z",
  "endTime": "2027-01-15T12:00:00Z",
  "venueName": "Example Wedding Hall",
  "venueAddress": "Example City, India",
  "isPublic": true
}
Validation:
- Event name is required.
- Start time must be valid.
- End time must not precede the start time.
- The Manager must be authorized for the wedding.


## 7. Task Planner APIs


### 7.1 Endpoints

Method
Endpoint
Purpose
POST
/weddings/{weddingId}/tasks
Create a task
GET
/weddings/{weddingId}/tasks
List tasks
GET
/weddings/{weddingId}/tasks/{taskId}
Retrieve a task
PATCH
/weddings/{weddingId}/tasks/{taskId}
Update a task
DELETE
/weddings/{weddingId}/tasks/{taskId}
Delete a task
All these endpoints require authenticated and authorized management access.

### 7.2 Create Task

Endpoint: POST /api/v1/weddings/{weddingId}/tasks
Request:
{
  "title": "Arrange decorations",
  "description": "Coordinate with the decoration vendor",
  "status": "pending",
  "priority": "high",
  "dueDate": "2027-01-10T00:00:00Z"
}
Supported task statuses:
- pending
- in_progress
- completed
- cancelled
Supported priorities:
- low
- medium
- high
The backend validates the status and priority values and associates the task with the correct wedding.


## 8. Expense Tracker APIs


### 8.1 Endpoints

Method
Endpoint
Purpose
POST
/weddings/{weddingId}/expenses
Create an expense
GET
/weddings/{weddingId}/expenses
List expenses
GET
/weddings/{weddingId}/expenses/{expenseId}
Retrieve one expense
PATCH
/weddings/{weddingId}/expenses/{expenseId}
Update an expense
DELETE
/weddings/{weddingId}/expenses/{expenseId}
Delete an expense
GET
/weddings/{weddingId}/expenses/summary
Retrieve expense totals
Authentication: Authorized management user required.

### 8.2 Create Expense

Endpoint: POST /api/v1/weddings/{weddingId}/expenses
Request:
{
  "title": "Venue advance",
  "category": "venue",
  "amount": "25000.00",
  "currency": "INR",
  "expenseDate": "2026-10-16T00:00:00Z",
  "notes": "Advance payment"
}
Validation:
- Amount must be a valid, non-negative monetary value.
- Currency must be supported.
- The expense must belong to the authorized wedding.
- Monetary calculations must use a precise representation.


## 9. Guest Management APIs


### 9.1 Endpoints

Method
Endpoint
Purpose
Access
POST
/weddings/{weddingId}/guests
Add a guest
Authorized Admin/Manager
GET
/weddings/{weddingId}/guests
List guests
Authorized Admin/Manager
GET
/weddings/{weddingId}/guests/{guestId}
Retrieve a guest
Authorized Admin/Manager
PATCH
/weddings/{weddingId}/guests/{guestId}
Update guest details
Authorized Admin/Manager
DELETE
/weddings/{weddingId}/guests/{guestId}
Remove a guest
Authorized Admin/Manager

### 9.2 Add Guest

Endpoint: POST /api/v1/weddings/{weddingId}/guests
Request:
{
  "name": "Guest One",
  "email": "guest@example.com",
  "phone": "+910000000000"
}
Purpose:
- Validate guest details.
- Create a guest record in MongoDB Atlas.
- Associate the guest with the correct wedding.
- Return the guest identifier.
Guest email and phone requirements should be confirmed. Email is needed for the current email invitation flow.

### 9.3 List Guests

Endpoint: GET /api/v1/weddings/{weddingId}/guests?page=1&limit=20
Authentication: Authorized Admin/Manager.
Purpose:
- Retrieve guests for the selected wedding.
- Support pagination and optional search.
- Return guest information only to authorized management users.
Guests must never be able to call this API to browse other guests' personal information.


## 10. Invitation APIs


### 10.1 Endpoints

Method
Endpoint
Purpose
Access
POST
/weddings/{weddingId}/invitations
Create and send an invitation
Authorized Admin/Manager
GET
/weddings/{weddingId}/invitations
List invitations
Authorized Admin/Manager
POST
/weddings/{weddingId}/invitations/{invitationId}/resend
Resend an invitation
Authorized Admin/Manager
POST
/weddings/{weddingId}/invitations/{invitationId}/revoke
Revoke an invitation
Authorized Admin/Manager
The email provider currently proposed is Resend.

### 10.2 Send Invitation

Endpoint: POST /api/v1/weddings/{weddingId}/invitations
Request:
{
  "guestId": "guest_id"
}
Expected flow:
1. Verify the Manager's permission for the wedding.
2. Verify that the guest belongs to that wedding.
3. Generate a cryptographically secure, unique invitation token.
4. Store the invitation record and token hash.
5. Construct the guest-specific invitation URL.
6. Send the email through the email service.
7. Record the delivery status when available.
8. Return the invitation status.
Example response:
{
  "success": true,
  "message": "Invitation processing started",
  "data": {
    "invitationId": "invitation_id",
    "status": "sent"
  }
}
The response should not expose the token hash or unnecessary token details.

### 10.3 Resend Invitation

Endpoint: POST /api/v1/weddings/{weddingId}/invitations/{invitationId}/resend
Purpose:
- Send another invitation email to the same guest.
- Reuse the existing valid link or issue a replacement link according to the invitation policy.
The chosen policy must be consistent with token expiration and revocation rules.

### 10.4 Revoke Invitation

Endpoint: POST /api/v1/weddings/{weddingId}/invitations/{invitationId}/revoke
Purpose:
- Invalidate the invitation link.
- Prevent further authorized actions through that token.
- Preserve appropriate historical records.


## 11. Guest RSVP APIs

These APIs are central to the guest experience.
Guests do not log in, create accounts, or use OTP. They use their individual invitation links.

### 11.1 Endpoints

Method
Endpoint
Purpose
Access
GET
/public/invitations/{token}
Validate invitation and show permitted details
Valid invitation token
GET
/public/invitations/{token}/rsvp
Retrieve current RSVP state
Valid invitation token
POST
/public/invitations/{token}/rsvp
Submit or update RSVP
Valid invitation token
GET
/weddings/{weddingId}/rsvps
List RSVP responses
Authorized Admin/Manager
GET
/weddings/{weddingId}/rsvps/summary
Retrieve RSVP totals
Authorized Admin/Manager
The {token} placeholder represents a secure, unpredictable invitation token. The actual raw token must never be returned by a general management API.

### 11.2 Validate Invitation

Endpoint: GET /api/v1/public/invitations/{token}
Purpose:
- Validate the invitation token.
- Check that the invitation is valid and not revoked or expired under the configured policy.
- Return permitted wedding and invitation details.
- Display the RSVP confirmation page.
Example response:
{
  "success": true,
  "data": {
    "guestName": "Guest One",
    "coupleNames": [
      "Person One",
      "Person Two"
    ],
    "weddingDate": "2027-01-15T00:00:00Z",
    "venueName": "Example Wedding Hall",
    "currentResponse": null,
    "canRespond": true
  }
}
The response must not expose other guests' information.
Important: A GET request must not automatically submit or change an RSVP. Email security scanners can automatically open links.

### 11.3 Submit RSVP

Endpoint: POST /api/v1/public/invitations/{token}/rsvp
Request:
{
  "response": "yes"
}
The allowed values are yes and no.
Expected flow:
1. Guest opens the unique invitation link.
2. Backend validates the invitation.
3. Frontend displays the RSVP page.
4. Guest selects Yes or No.
5. Guest confirms the selection.
6. Frontend submits the response.
7. Backend validates the token, guest, wedding, and response.
8. Backend creates or updates the guest's current RSVP.
9. Frontend displays a success message.
Example response:
{
  "success": true,
  "message": "Your RSVP has been saved",
  "data": {
    "response": "yes",
    "respondedAt": "2026-10-16T10:30:00Z"
  }
}
The system should maintain one current RSVP per guest per wedding unless the requirements later introduce event-specific attendance responses.

### 11.4 RSVP Summary

Endpoint: GET /api/v1/weddings/{weddingId}/rsvps/summary
Authentication: Authorized Admin/Manager.
Example response:
{
  "success": true,
  "data": {
    "totalGuests": 250,
    "respondedYes": 180,
    "respondedNo": 30,
    "notResponded": 40
  }
}
The figures are illustrative. The backend must calculate the actual counts using the wedding's guest and RSVP records.


## 12. Reminder APIs


### 12.1 Send Reminders

Endpoint: POST /api/v1/weddings/{weddingId}/reminders
Authentication: Authorized Admin/Manager.
Request:
{
  "guestIds": [
    "guest_id_1",
    "guest_id_2"
  ],
  "type": "rsvp_reminder"
}
Purpose:
- Send reminder emails to selected guests.
- Support reminders for guests who have not yet responded.
- Record notification status.
Possible reminder types:
- invitation_reminder
- rsvp_reminder
- event_reminder
The final reminder types and scheduling behavior should be confirmed before implementation.
Example response:
{
  "success": true,
  "message": "Reminder processing started",
  "data": {
    "requestedCount": 2,
    "status": "queued"
  }
}
The backend must validate that every selected guest belongs to the correct wedding.


## 13. Photo Gallery APIs

Photo metadata is stored in MongoDB Atlas, while image files are stored in Google Cloud Storage.

### 13.1 Endpoints

Method
Endpoint
Purpose
Access
POST
/weddings/{weddingId}/albums
Create an album
Authorized Admin/Manager
GET
/weddings/{weddingId}/albums
List albums for management
Authorized Admin/Manager
PATCH
/weddings/{weddingId}/albums/{albumId}
Update album details
Authorized Admin/Manager
DELETE
/weddings/{weddingId}/albums/{albumId}
Delete an album
Authorized Admin/Manager
POST
/weddings/{weddingId}/photos/upload-url
Generate a signed upload URL
Authorized Admin/Manager
POST
/weddings/{weddingId}/photos/complete
Confirm uploaded photo metadata
Authorized Admin/Manager
GET
/public/weddings/{slug}/gallery
Retrieve guest-accessible gallery
Public gallery or validated guest authorization, according to policy
GET
/public/photos/{photoId}/access
Request authorized access to a private photo
Authorized guest or management user

### 13.2 Create Album

Endpoint: POST /api/v1/weddings/{weddingId}/albums
Request:
{
  "title": "Wedding Memories",
  "description": "Photos from the wedding",
  "accessType": "authorized_guests"
}
The backend validates the Manager's permissions and stores the album metadata.

### 13.3 Request Photo Upload URL

Endpoint: POST /api/v1/weddings/{weddingId}/photos/upload-url
Request:
{
  "albumId": "album_id",
  "fileName": "wedding-photo.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 1048576
}
Example response:
{
  "success": true,
  "data": {
    "uploadUrl": "short_lived_signed_upload_url",
    "objectKey": "wedding_id/album_id/photo_id.jpg",
    "expiresAt": "2026-10-16T10:15:00Z"
  }
}
The URL is illustrative and must be generated by the backend through Google Cloud Storage.
The backend must:
- Validate the Manager's access.
- Validate the album and wedding.
- Enforce file size and content-type rules.
- Generate a short-lived signed upload URL.
- Avoid exposing Google Cloud credentials.

### 13.4 Complete Photo Upload

Endpoint: POST /api/v1/weddings/{weddingId}/photos/complete
Request:
{
  "albumId": "album_id",
  "objectKey": "wedding_id/album_id/photo_id.jpg",
  "fileName": "wedding-photo.jpg",
  "contentType": "image/jpeg",
  "sizeBytes": 1048576
}
The backend must verify that the expected object was uploaded and belongs to the authorized wedding before saving the photo metadata.

### 13.5 Retrieve Private Gallery

Endpoint: GET /api/v1/public/weddings/{slug}/gallery
The endpoint's public route name does not mean that all galleries are publicly accessible.
For a private gallery:
1. The guest opens an approved invitation or gallery access link.
2. The backend validates the invitation or other approved guest authorization mechanism.
3. The backend verifies the guest's authorization for that wedding.
4. The backend returns only the gallery content permitted to that guest.
5. Private photo access is issued through short-lived signed URLs or an authorized content endpoint.
Critical rule: A guest from Wedding A must never be able to access Wedding B's private gallery by changing a URL or identifier.
The final guest gallery access flow should specify how authorization is maintained when guests navigate from their invitation page to the gallery.


## 14. Wedding Location and QR Code APIs


### 14.1 Endpoints

Method
Endpoint
Purpose
Access
GET
/public/weddings/{slug}/location
Retrieve public venue information
Public
PATCH
/weddings/{weddingId}/location
Update wedding location
Authorized Admin/Manager
GET
/public/weddings/{slug}/qr
Retrieve or generate a QR code
Public

### 14.2 Update Location

Endpoint: PATCH /api/v1/weddings/{weddingId}/location
Request:
{
  "venueName": "Example Wedding Hall",
  "venueAddress": "Example City, India",
  "latitude": 13.0,
  "longitude": 78.0
}
The backend validates the input and saves the location in the wedding record.

### 14.3 Retrieve QR Code

Endpoint: GET /api/v1/public/weddings/{slug}/qr
Purpose:
- Provide a QR code that points to the wedding's approved location page or directions URL.
The QR code must not contain private guest information or invitation tokens.
The exact QR code generation library and whether the QR image is generated dynamically or stored will be decided during implementation.


## 15. Optional Livestream APIs


### 15.1 Endpoints

Method
Endpoint
Purpose
Access
PATCH
/weddings/{weddingId}/livestream
Configure livestream
Authorized Admin/Manager
GET
/public/weddings/{slug}/livestream
Retrieve permitted livestream details
Public or authorized guest, according to policy

### 15.2 Configure Livestream

Endpoint: PATCH /api/v1/weddings/{weddingId}/livestream
Request:
{
  "enabled": true,
  "provider": "youtube",
  "url": "https://www.youtube.com/example"
}
Validation:
- Only supported providers should be accepted.
- The URL must be validated.
- The livestream must belong to the selected wedding.
- The backend must enforce the wedding's intended viewing permissions.
Livestream is optional. The wedding website must continue working when it is disabled.


## 16. HTTP Status Codes

The backend should use standard HTTP status codes consistently.
Status Code
Meaning
Example
200 OK
Request successful
Retrieve events or update an RSVP
201 Created
Resource created
Create a guest or event
202 Accepted
Request accepted for asynchronous processing
Queue a batch of emails
204 No Content
Request successful without a response body
Delete a resource
400 Bad Request
Invalid request format or parameters
Malformed request
401 Unauthorized
Authentication missing or invalid
Manager session expired
403 Forbidden
User lacks permission
Manager attempts to access another wedding
404 Not Found
Resource not found or deliberately concealed
Unknown event
409 Conflict
Resource conflict
Duplicate wedding slug
422 Unprocessable Content
Request validation failed
Invalid RSVP value
429 Too Many Requests
Rate limit exceeded
Repeated invitation-token attempts
500 Internal Server Error
Unexpected server error
Unhandled application error
502 Bad Gateway
Upstream service failure
Email provider gateway failure
503 Service Unavailable
Service temporarily unavailable
Database or service outage
The API should avoid revealing sensitive details in error responses.


## 17. API Validation Rules


### 17.1 Authentication

- Validate credentials on the backend.
- Reject invalid or inactive accounts.
- Require authentication for protected dashboard APIs.
- Never return password hashes.
- Do not implement OTP for Version 1.

### 17.2 Wedding Isolation

- Validate the user's role and wedding assignment for every protected operation.
- Do not trust a weddingId supplied by the frontend without authorization checks.
- Confirm that referenced guests, events, tasks, invitations, albums, and photos belong to the expected wedding.
- Deny unauthorized cross-wedding requests.

### 17.3 Guest RSVP

- Validate the invitation token.
- Verify the token's status and expiration policy.
- Validate that the guest and invitation belong to the same wedding.
- Accept only yes or no.
- Do not allow the client to choose an arbitrary guestId to submit an RSVP.
- Avoid changing the RSVP through a GET request.
- Make repeated submissions safe and consistent.

### 17.4 Invitations and Emails

- Verify guest contact details.
- Validate the Manager's access.
- Prevent duplicate or unintended bulk email operations.
- Track email delivery status where available.
- Apply appropriate rate limits.
- Avoid exposing raw invitation tokens in logs.

### 17.5 Photo Uploads

- Validate file size and MIME type.
- Validate the album and wedding.
- Authorize the uploader.
- Use short-lived signed URLs.
- Verify uploads before creating permanent metadata records.


## 18. Pagination, Filtering, and Sorting

APIs returning large lists should support pagination.
Example:
GET /api/v1/weddings/{weddingId}/guests?page=1&limit=20&search=guest
Recommended query parameters:
- page: Page number.
- limit: Maximum number of records per page.
- search: Optional search term.
- status: Optional status filter.
- sortBy: Approved field to sort by.
- sortOrder: asc or desc.
Example response:
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
The backend must cap the maximum page size and allow sorting only on approved fields.


## 19. Security Requirements


### 19.1 Authentication Security

- Use HTTPS in production.
- Use secure session cookies or an explicitly designed token mechanism.
- Apply secure password hashing.
- Support logout and session invalidation.
- Rate-limit login attempts.
- Do not store sensitive credentials in frontend source code.

### 19.2 Guest Link Security

- Use unpredictable invitation tokens.
- Store token hashes where practical.
- Revoke compromised links.
- Avoid putting raw tokens into logs, analytics, or third-party tracking systems.
- Consider Referrer-Policy and page behavior to reduce token leakage.
- Validate guest authorization for every private operation.
- Do not require guest login or OTP.

### 19.3 Authorization Security

- Enforce permissions in FastAPI.
- Restrict Managers to their assigned weddings.
- Protect Admin-only and Platform Administrator operations.
- Do not assume that a hidden frontend button provides security.

### 19.4 API Security

- Validate request bodies and query parameters.
- Configure CORS for trusted frontend origins.
- Rate-limit sensitive public endpoints.
- Use safe error messages.
- Store secrets in an appropriate secrets manager or secure environment configuration.
- Avoid logging passwords, raw invitation tokens, and unnecessary guest personal information.


## 20. API Testing Strategy


### 20.1 Authentication Tests

- Admin can log in with valid credentials.
- Manager can log in with valid credentials.
- Invalid credentials are rejected.
- Unauthenticated requests cannot access protected APIs.
- Logout invalidates the session.
- A Manager cannot access another wedding's data.

### 20.2 Wedding and Event Tests

- An authorized user can create a wedding event.
- Invalid event data is rejected.
- A Manager can update only permitted records.
- Public event APIs do not expose private fields.

### 20.3 Guest and Invitation Tests

- A Manager can add a guest to the assigned wedding.
- An unauthorized user cannot retrieve guest contact information.
- Invitations are associated with the correct guest and wedding.
- Revoked or invalid invitation links are rejected.
- Email delivery failures are handled appropriately.

### 20.4 RSVP Tests

- A guest can open a valid invitation link without logging in.
- The guest can submit Yes or No.
- No OTP is requested.
- Invalid tokens are rejected.
- A guest cannot submit an RSVP for another guest.
- Email scanners opening a link do not automatically change an RSVP.
- Duplicate submissions do not create inconsistent records.

### 20.5 Gallery Tests

- Authorized guests can access their wedding's private gallery.
- Guests cannot access another wedding's private gallery.
- Public website access does not automatically grant private gallery access.
- Expired signed URLs cannot be used beyond their lifetime.
- Private images are not exposed through permanent public links.

### 20.6 Expense and Task Tests

- Valid records can be created and retrieved.
- Invalid amounts and statuses are rejected.
- Managers cannot access records belonging to another wedding.


## 21. API Design Decisions Pending

The following decisions can be finalized during implementation:
1. Final production API domain.
2. Exact authentication mechanism and session/token configuration.
3. Password reset and account activation details.
4. Final Platform Administrator versus wedding-level Admin permissions.
5. Invitation expiration and replacement policy.
6. Guest access to the gallery after the invitation link is lost.
7. Email provider configuration and retry behavior.
8. Exact QR code generation approach.
9. Whether livestream details require guest-specific authorization.
10. Final request and response schemas for each endpoint.
11. Whether bulk guest import or bulk invitation sending is required.
12. API versioning, monitoring, and rate-limit thresholds.


## 22. Final Summary

The Make My Marriage API layer will use FastAPI to connect the Next.js frontend with MongoDB Atlas, Google Cloud Storage, and the required external services.
The API design covers:
- Authentication for Admin and Manager.
- Platform administration and wedding creation.
- Wedding dashboard.
- Events, tasks, and expenses.
- Guest management.
- Digital invitations and email reminders.
- Guest RSVP through secure invitation links.
- Photo albums and private gallery access.
- Wedding location and QR code.
- Optional livestream integration.
Guests do not log in or create accounts. They can view public wedding information directly and use their unique invitation links for authorized RSVP and private-gallery features. OTP is not included in Version 1.
All wedding-specific APIs must enforce wedding-level authorization so that data from one wedding cannot be accessed by an unauthorized user from another wedding.
This document provides the initial API design baseline. Detailed request and response schemas, authentication configuration, and service-specific implementation choices should be finalized before development begins.
