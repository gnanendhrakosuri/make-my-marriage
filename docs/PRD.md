# Product Requirements Document (PRD)
**Make My Marriage — Wedding Website Platform**

| Field | Value |
|---|---|
| Document Version | 1.0 |
| Product Name | Make My Marriage |
| Release Scope | Version 1 (MVP) |
| Document Status | Finalized Feature Requirements |

> **Note:** The original source file is `docs/PRD.doc`. This Markdown version is a faithful conversion for readability. Do not treat this file as the authoritative source if it conflicts with the original.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Product Vision](#2-product-vision)
3. [Product Goals](#3-product-goals)
4. [User Roles and Permissions](#4-user-roles-and-permissions)
5. [Functional Requirements](#5-functional-requirements)
6. [Privacy and Security Requirements](#6-privacy-and-security-requirements)
7. [User Experience and Accessibility](#7-user-experience-and-accessibility)
8. [Version 1 Scope](#8-version-1-scope)
9. [Out of Scope for Version 1](#9-out-of-scope-for-version-1)
10. [Success Criteria](#10-success-criteria)
11. [Future Enhancements](#11-future-enhancements)
12. [Final Product Summary](#12-final-product-summary)

---

## 1. Product Overview

Make My Marriage is a reusable wedding website platform that allows different users to have their own personalized wedding websites using a common set of features and a consistent design.

The platform administrator creates wedding manager accounts and sets up their wedding websites. Wedding managers handle the day-to-day activities, including wedding event planning, guest management, digital invitations, RSVP tracking, reminders, and photo gallery management.

Guests can access their respective wedding websites through a shared link or QR code without creating an account. They can view wedding information, respond to event invitations, update their RSVP responses, and access authorized wedding photos.

The platform must be simple, accessible, mobile-friendly, and easy to use for people of all ages.

---

## 2. Product Vision

To provide a simple, centralized, and user-friendly platform that makes wedding planning and guest coordination easier while allowing guests to access wedding information and participate in wedding events conveniently.

---

## 3. Product Goals

- Provide a reusable wedding website template for different weddings.
- Simplify wedding planning and event management.
- Allow managers to coordinate guests, invitations, and RSVPs from one place.
- Provide guests with easy access to wedding details without requiring an account.
- Protect guest personal information and private wedding photographs.
- Enable guests to discover wedding locations through QR codes and website links.
- Provide email invitations and reminders.
- Deliver an accessible, intuitive experience across mobile and desktop devices.

---

## 4. User Roles and Permissions

### 4.1 Platform Administrator

The platform administrator is responsible for onboarding wedding managers and overseeing the platform.

**Responsibilities:**
- Create wedding manager accounts.
- Set up the corresponding wedding websites.
- Provide authorized login credentials or account access to managers.
- Oversee manager access and platform administration.
- Review the overall wedding setup when required.

### 4.2 Wedding Manager

The wedding manager is responsible for the day-to-day management of the assigned wedding.

**Responsibilities:**
- Log in using the credentials provided by the platform administrator.
- Manage wedding information and event schedules.
- Create and manage wedding tasks.
- Add and maintain guest information.
- Send digital invitations and email reminders.
- Monitor and manage RSVP responses.
- Upload and organize wedding photographs.
- Maintain wedding website information.
- Add and update live-stream information.
- Manage the wedding's guest-facing content.

### 4.3 Wedding Guest

Guests can access the relevant wedding website without creating an account.

**Capabilities:**
- View the couple's names and general wedding information.
- View all wedding events, dates, schedules, and venues.
- Access the website through a direct link or QR code.
- Verify their identity using OTP when accessing or updating RSVP information. *(Note: OTP is deferred to a future release — see README.md)*
- Select the events they plan to attend.
- Update their own RSVP responses.
- Access the private photo gallery after the required verification.
- View live-stream information when available.

**Restrictions:**
- Guests cannot access the administrative dashboard.
- Guests cannot view other guests' names, phone numbers, or RSVP responses.
- Guests cannot edit wedding events, dates, venues, or other administrative information.
- Guests cannot upload or manage wedding photographs in Version 1.

---

## 5. Functional Requirements

### 5.1 Authentication and Account Management

- The platform must provide secure login for authorized platform administrators and wedding managers.
- Wedding manager accounts must be created by the platform administrator.
- Public users must not be able to register themselves as administrators or wedding managers.
- Guests must not require an account or password to view public wedding information.
- Administrative access must be restricted according to the user's role and assigned wedding.

### 5.2 Wedding Website Setup

- The platform administrator must be able to set up wedding websites for different users.
- Each wedding must have its own wedding information and dedicated website link.
- Each wedding must use the common Make My Marriage template and feature set.
- Wedding information must remain separate between different weddings.
- The wedding manager must be able to maintain the wedding details they are authorized to manage.

Wedding information may include:
- Couple's names.
- Wedding title or welcome message.
- Wedding date and general information.
- Event schedules.
- Venue names and addresses.
- Directions or map links.
- Other relevant wedding announcements.

### 5.3 Wedding Dashboard

The dashboard must provide the wedding manager with an overview of wedding activities.

It should include:
- Upcoming wedding events.
- Pending and completed tasks.
- Guest and RSVP summaries.
- Upcoming reminders.
- Quick access to event management, guest management, invitations, tasks, and photos.

The administrator should be able to oversee the wedding setup and relevant activity information.

### 5.4 Wedding Event Management

The wedding manager must be able to create and manage multiple functions within a wedding.

Examples include:
- Haldi.
- Mehendi.
- Sangeet.
- Wedding ceremony.
- Reception.
- Other custom wedding functions.

Each event may include:
- Event name.
- Description.
- Date and time.
- Venue and address.
- Dress code or additional instructions.
- Relevant announcements.

The manager must be able to add, edit, and remove events as necessary. Guests must be able to view all published wedding events but must not be able to change event details.

### 5.5 Task Planner

The task planner must help the wedding manager organize wedding preparations.

Required capabilities:
- Create and edit tasks.
- Add task descriptions and deadlines.
- Assign responsibilities where applicable.
- Track pending and completed tasks.
- Set priorities where needed.
- View upcoming and overdue tasks.
- Receive or manage task reminders.

Budget and expense tracking are not part of this module in Version 1.

### 5.6 Guest Management

The wedding manager must be able to maintain the guest list.

Guest information may include:
- Guest name.
- Phone number.
- Email address, when available.
- Invitation status.
- RSVP status for each event.

Required capabilities:
- Add new guests.
- Edit guest information.
- Remove guests.
- View and manage the guest list.
- Track invitations and attendance responses.
- Review RSVP summaries by event.

Guest names, phone numbers, and other private information must only be accessible to authorized administrative users.

### 5.7 Digital Wedding Invitations

The wedding manager must be able to send invitations to guests.

Invitations should:
- Include the relevant wedding website link.
- Provide the couple's names and wedding details.
- Include event schedules and venue information.
- Allow guests to access the website easily.
- Provide a convenient way to respond to individual events.

The platform must support email invitations in Version 1. The manager must also be able to share the wedding website link through other channels outside the platform where appropriate.

### 5.8 QR Code

The platform must provide a wedding-specific QR code.

Requirements:
- Each wedding website must have its own QR code.
- Scanning the code must open the correct wedding website.
- The QR code should be suitable for use on printed or digital invitations.
- Guests must be able to access public wedding information without logging in.
- Private information must remain protected even if the QR code is shared publicly.

The QR code provides access to the wedding website; it must not grant unrestricted access to private guest information or protected content.

### 5.9 RSVP Management and OTP Verification

> **Important:** OTP verification described in this section is **deferred to a future release**. Version 1 uses unique invitation tokens instead. See `README.md` for the confirmed decision.

The RSVP feature must allow guests to indicate their attendance for individual wedding events.

Guest flow (as documented in PRD v1.0):
1. The guest opens the wedding website.
2. The guest selects the RSVP option.
3. The guest provides the required identifying information.
4. The guest verifies their identity using an OTP sent to their registered phone number.
5. The guest views their own RSVP information.
6. The guest selects whether they will attend each relevant event.
7. The guest submits their responses.
8. The guest can return later, verify their identity again when required, and update their own responses.

Requirements:
- RSVP must be available without creating a guest account.
- Guests must be able to respond separately to multiple wedding events.
- Guests must be able to change their responses.
- The system must prevent guests from viewing or modifying other guests' RSVP information.
- The manager must be able to review RSVP responses.
- The system must provide a clear confirmation after an RSVP is saved.

OTP verification is intended to protect access to private guest information and RSVP updates.

### 5.10 Email Notifications and Reminders

The platform must support email notifications in Version 1.

The wedding manager must be able to send:
- Wedding invitations.
- Upcoming event reminders.
- RSVP reminders for guests who have not responded.
- Relevant wedding announcements when needed.

Requirements:
- Notifications should include the relevant wedding information.
- Reminders should be associated with the correct wedding and event.
- The manager should be able to identify invitation and RSVP statuses.
- Notifications must not expose another guest's personal information.
- Guests should receive information relevant to their own invitation or the public wedding details.

WhatsApp and SMS notifications are excluded from Version 1.

### 5.11 Private Photo Gallery

The platform must provide a private gallery for wedding photographs.

Requirements:
- The wedding manager can upload, organize, and manage photos.
- Photos may be grouped by wedding function or album.
- Authorized guests can view the gallery after the required access verification.
- Guests must not be able to view another wedding's private gallery.
- Gallery access must not expose guest phone numbers, guest lists, or RSVP records.
- Public access to the private gallery must not be available in Version 1.

### 5.12 Live-Stream Information

The wedding manager must be able to add or update the wedding live-stream link when a stream is available.

Requirements:
- Guests can find the live-stream information from the wedding website.
- The website should clearly indicate when streaming information is available.
- Access to restricted stream links must follow the wedding's access rules.

The platform is required to display or link to a live stream; building a streaming service from scratch is not required for Version 1.

---

## 6. Privacy and Security Requirements

- Only authorized administrators and managers can access administrative features.
- Managers must only manage their assigned wedding.
- Guest personal information must not be publicly displayed.
- Guests must only access their own RSVP information.
- OTP verification must be used to protect the relevant private guest actions. *(OTP deferred to future release — see README.md)*
- Private photo galleries must require authorized access.
- Public wedding links and QR codes must not expose private information.
- Wedding data must remain separated between different wedding websites.
- Guests must not be able to modify event details or administrative records.
- The platform must provide clear access restrictions for private information.

---

## 7. User Experience and Accessibility

The platform must be designed for people of different ages and levels of technical experience.

Requirements:
- Simple and intuitive navigation.
- Clear labels and familiar terminology.
- Readable text with comfortable font sizes.
- Good text and background contrast.
- Large, clearly visible buttons for important actions.
- A responsive layout for mobile phones, tablets, and desktops.
- Minimal steps for common guest activities.
- Clear success, error, and confirmation messages.
- Accessible form labels and keyboard navigation.
- Consistent design across different wedding websites.
- Simple workflows for viewing events, submitting RSVPs, and accessing photographs.

The guest-facing website should prioritize simplicity and must not require guests to download an application.

---

## 8. Version 1 Scope

The following features are included in Version 1:

1. Administrator and wedding manager authentication.
2. Administrator-controlled manager onboarding.
3. Reusable wedding website template for multiple users.
4. Wedding setup and personalized wedding details.
5. Wedding dashboard.
6. Multiple wedding events and schedules.
7. Task planner.
8. Guest management.
9. Digital wedding invitations.
10. Wedding-specific QR codes.
11. RSVP management *(OTP replaced by invitation token in V1 — see README.md)*.
12. Email invitations and reminders.
13. Private photo gallery.
14. Live-stream information.
15. Guest privacy and role-based access.
16. Simple, accessible, mobile-friendly user experience.

---

## 9. Out of Scope for Version 1

The following features are not included in the initial release:

- Budget management.
- Expense tracking.
- Remaining-budget calculations.
- Guest login accounts.
- Public photo galleries.
- Guest photo uploads.
- WhatsApp notifications.
- SMS notifications.
- Self-service public registration for wedding managers.
- Multiple wedding websites managed by a single wedding manager, unless introduced as a future enhancement.
- A built-in live-streaming infrastructure.
- Advanced features not explicitly listed in the Version 1 scope.

---

## 10. Success Criteria

The initial release will be considered successful when:

- The platform administrator can create a wedding manager account and set up a wedding website.
- The manager can manage wedding details, events, tasks, guests, invitations, and photos.
- Guests can open the correct website through a link or QR code.
- Guests can view all published wedding events and venue details.
- Guests can verify their identity and submit or update their own RSVP responses.
- Guests cannot access other guests' private information.
- The manager can review guest responses and send email reminders.
- Authorized guests can access the private photo gallery.
- Wedding information remains separated between different weddings.
- The website is understandable and usable across mobile and desktop devices.
- Users can complete common activities without unnecessary complexity.

---

## 11. Future Enhancements

Potential future features may include:

- WhatsApp and SMS notifications.
- Public or selectively shareable photo galleries.
- Guest photo uploads.
- Seating arrangements and table management.
- Vendor management.
- Budget and expense tracking.
- More advanced wedding customization.
- Additional guest engagement features.

These enhancements should be considered only after the Version 1 requirements are delivered and evaluated.

---

## 12. Final Product Summary

Make My Marriage is a reusable wedding website platform that enables a platform administrator to onboard wedding managers and set up personalized wedding websites.

Wedding managers are responsible for the day-to-day planning and management of wedding events, guests, invitations, tasks, reminders, photographs, and website content. Guests can access the relevant wedding website without an account, view wedding information, respond to event invitations, and access authorized private photographs.

The platform's primary principles are **simplicity, privacy, accessibility, and ease of use** for people of all ages.

**Version 1 priority:** Deliver a simple, reliable, and privacy-conscious wedding management experience without unnecessary complexity.

---

### Deployment Technologies (from original document)

| Component | Technology |
|---|---|
| Frontend hosting | Google Cloud Run / VM |
| Backend hosting | Google Cloud Run / VM |
| Database hosting | MongoDB Atlas managed database |
| Media storage | Google Cloud Storage |
| Traffic distribution | Google Cloud Load Balancer |
| Optional content delivery | Google Cloud CDN |
