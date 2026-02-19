# 📄 Product Requirements Document (PRD)

## 🕵 SherlockIT 2.0 – Mystery Solving Event App

# 1. 🎯 Product Overview

#### SherlockIT 2.0 is a mobile-first mystery-solving application used during an event where teams

#### explore multiple “worlds,” solve clues, and submit a final mystery solution.

#### The platform enables:

- Controlled access to puzzle worlds
- Real-time announcements
- Progress tracking
- A time-gated final submission system

# 2. 👥 Users & Roles

## 2.1 Team (Primary User)

- Logs in with team name + password
- Solves worlds
- Views announcements
- Submits final answer (once)

## 2.2 Admin (Organizer)

- Sends announcements
- Locks/unlocks worlds
- Opens final answer submission
- Tracks progress
- Views final submissions


# 3. 🧭 User Flow

## 3.1 Team Flow

#### 1. Splash screen → App branding

#### 2. Login (team credentials)

#### 3. Dashboard with worlds

#### 4. Enter world → Read storyline → Answer question

#### 5. Solve worlds → Unlock more worlds

#### 6. Receive announcements

#### 7. Last 30 mins → Final Answer unlocked

#### 8. Submit final answer once

# 4. 📱 Screens & Features

## 4.1 Splash Screen

### Purpose

#### Branding + loading state

### Requirements

- App name: SherlockIT 2.
- Optional mystery-themed background
- Auto redirect to login

## 4.2 Login Screen

### Functional Requirements

- Team name input
- Password input
- Login button
- Validation errors


### Business Rules

- One device per team login
- If already logged in elsewhere → block login or force logout

## 4.3 Dashboard (World Selection)

### Functional Requirements

- List of worlds
- States:

#### o 🔒 Locked

#### o 🔓 Unlocked

#### o ✅ Completed (color change)

- Clickable unlocked worlds
- Menu icon (Announcements + Team profile)

### Visual Rules

- Completed worlds appear in different color
- Locked worlds disabled

## 4.4 World Detail Screen

### Functional Requirements

- Title
- Storyline animation (letter-by-letter)
- One main question
- Answer input box
- Submit answer button

### Business Rules

- Unlimited attempts
- On correct answer:

#### o Mark world as completed

#### o Unlock next world (if configured)

#### o Change color on dashboard


## 4.5 Announcements Section

### Functional Requirements

- List of announcements
- Push notification support (optional but recommended)
- Timestamped messages

### Admin Rules

- Only admin can send announcements

## 4.6 Final Answer Screen (CRITICAL FEATURE)

### Availability

- Visible only during last **30 minutes**

### Fields

- Real World
- Villain
- Weapon

### Functional Requirements

- Single submission allowed
- Timestamp stored
- Confirmation dialog before submission
- Lock after submission

### Business Rules

- No edits allowed after submission
- Submission must be recorded with:

#### o Team ID

#### o Timestamp

#### o Answers


# 5. 🛠 Admin Panel Features

## 5.1 Announcement Management

- Create announcement
- Send to all teams
- Push notification trigger

## 5.2 World Control

- Lock / unlock worlds
- Configure world order
- Edit world content (title, story, question, answer)

## 5.3 Final Answer Control

- Toggle final answer visibility
- Set auto-open timer (last 30 min)
- Force open/close manually

## 5.4 Progress Monitoring

- Team-wise progress
- Worlds completed per team
- Attempt logs (optional)

## 5.5 Final Submission Dashboard

- List of all submissions
- Timestamp sorting
- Export option (CSV)


# 6. 🔐 Non-Functional Requirements

## 6.1 Security

- Auth-protected routes
- Prevent multiple device login
- Secure answer validation
- Final answer submission lock

## 6.2 Performance

- Story animation smooth
- Dashboard load < 2 sec
- Real-time announcements

## 6.3 Reliability

- Offline-safe UI (optional)
- Prevent duplicate submissions
- Server timestamp authority

# 5. 🗄 MongoDB Schema Design

## 5.1 Team Schema

##### {

_id,
teamName,
passwordHash,
activeSessionId,


completedWorlds: [worldId],
finalSubmitted: Boolean
}

## 5.2 World Schema

##### {

_id,
title,
story,
question,
answer,
order,
isLocked
}

## 5.3 Progress Schema (optional but cleaner)

##### {

teamId,
worldId,
attempts,
completedAt
}

## 5.4 Announcement Schema

##### {

message,
createdAt
}

## 5.5 Final Submission Schema

##### {

teamId,
realWorld,
villain,
weapon,
submittedAt
}

## 5.6 Event Control Schema (IMPORTANT)


##### {

finalAnswerOpen: Boolean,
finalAnswerStartTime: Date
}

#### This lets admin toggle OR time-gate final answer.

# 6. 🔐 Auth & Session Strategy

### Login

#### 1. Validate credentials

#### 2. Generate sessionId

#### 3. Store in DB

#### 4. Send JWT cookie

### Middleware

- Protect /dashboard, /world, /final
- Validate sessionId with DB

# 7. 🔁 Key API Routes

## Auth

POST /api/login
POST /api/logout

## Worlds

GET /api/worlds
GET /api/world/:id
POST /api/world/submit

## Announcements


GET /api/announcements
POST /api/admin/announcement

## Final Submission

GET /api/final/status
POST /api/final/submit

## Admin

POST /api/admin/world-lock
GET /api/admin/progress
GET /api/admin/final-submissions

# 8. ⚠ Edge Cases

- Team refresh during answer submission
- Final answer double click
- Admin unlock mid-attempt
- Network drop during final submission
- Case-insensitive answers

# 9. 📊 Success Metrics

- Completion rate
- Avg solve time per world
- Final submission accuracy
- Announcement engagement

# 10. 💡 Architecture Advice (Important for

# You)

#### Since you're using Next.js:

- Use **server actions** for answer validation → secure


- Keep answer checking server-side
- Use **ISR or caching** for worlds
- Use **middleware** for session enforcement
- Add unique index on FinalSubmission.teamId → prevents duplicates


