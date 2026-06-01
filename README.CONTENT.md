# FindPoint - Dokumentacioni i Projektit për Mbrojtje

## 1. Përshkrimi i Projektit

**Çfarë është aplikacioni:**
FindPoint është një aplikacion mobile (React Native/Expo) dhe web platform për menaxhimin e objekteve të humbura dhe të gjetura në komunitet universitare.

**Qëllimi:**
Të ndihmojë studentët dhe stafin të gjejnë objektet e humbura dhe t'i lidhë me pronësit real përmes një platforme të sigurt dhe të centralizuar.

**Problemi që zgjidh:**
- Objektet e humbura shpesh nuk kthehen përkundrazi ruhen në pikat e humbjeve të pabashkësuara
- Mungesa e informimit të qartë ndërmjet pronësit dhe gjetësit
- Nuk ekziston një mekanizëm i rregulluar për raportimin dhe rikuperimin e objekteve

**Lloji i aplikacionit:**
Mobile App (React Native/Expo) me Backend API (Node.js/Express) dhe Dashboard Admin Web

---

## 2. Arkitektura e Përgjithshme

### Arkitektura Frontend-it
- **Modeli:** Client-side React Native
- **Navigim:** Expo Router (file-based routing)
- **State Management:** Context API + AsyncStorage (për sesionet)
- **HTTP Client:** Axios me interceptors për JWT
- **Tipuri i aplikacionit:** Tabbed navigation + Modal flows

### Arkitektura Backend-it
- **Modeli:** REST API (Node.js + Express)
- **Shtresa të arkitekturës:** MVC (Model-View-Controller)
- **Autentikimi:** JWT (7-day expiration)
- **Database:** MySQL relacional
- **Siguria:** bcryptjs për password hashing

### Komunikimi Frontend-Backend
```
Frontend (Expo) ─── HTTP/REST ─── Backend (Express)
         ↓                              ↓
    AsyncStorage                    MySQL DB
```

- Frontend bën HTTP requests me JWT në Authorization header
- Backend validizon tokenit dhe kthehet me JSON responses
- Base URL dinamik: `http://<host>:3000/api`

### API-të Kryesore
```
/api/auth        - Register, Login, Profile (GET /me, PUT /me, DELETE /me)
/api/items       - Lost/Found items CRUD (GET /, POST /, PUT /:id, PATCH /:id/found)
/api/admin       - Admin dashboard, User management, Item moderation, Reports
/api/chat        - Conversations, Messages
/api/notifications - User notifications
/api/categories  - Item categories (Phones, Wallets, Keys, etc.)
/api/locations   - University locations
```

---

## 3. Frontend

### Teknologjitë e Përdorura
| Teknologjia | Versioni | Përdorimi |
|---|---|---|
| React Native | 0.81.5 | Mobile UI framework |
| Expo | ~54.0.33 | Build & deploy platform |
| Expo Router | ~6.0.23 | Navigation (file-based) |
| React | 19.1.0 | Core library |
| Axios | ^1.15.0 | HTTP client |
| AsyncStorage | 2.2.0 | Local token storage |
| React Navigation | ^7.1.8 | Bottom tabs navigator |

### Struktura e Folderave
```
ubtfindpointapp/
├── app/                    # Expo Router pages (file-based routing)
│   ├── index.tsx          # Splash screen
│   ├── login.tsx          # Login page
│   ├── register.tsx       # Register page
│   ├── (tabs)/            # Tab-based navigation group
│   │   ├── home/          # Home tab (search items)
│   │   ├── addItems/      # Add lost/found item form
│   │   ├── foundItems/    # Browse found items
│   │   ├── lostItems/     # Browse lost items
│   │   ├── items/         # My items list
│   │   ├── profile/       # User profile
│   │   └── notifications/ # User notifications
│   ├── admin/             # Admin dashboard (role-based)
│   └── chat/              # Chat conversations
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication logic
│   │   ├── admin/         # Admin functionality
│   │   ├── items/         # Item management
│   │   ├── chat/          # Chat functionality
│   │   └── profile/       # User profile
│   └── services/
│       ├── api.js         # Axios instance + interceptors
│       ├── session.ts     # Token management
│       └── notifications.js # Notification service
├── assets/                # Images, fonts
├── constants/             # Theme colors, constants
└── hooks/                 # Custom React hooks
```

### Komponentët Kryesorë
- **Modern Navbar:** Top navigation bar
- **Themed View/Text:** Theme-aware components
- **Icon Components:** Expo vector icons
- **Collapsible:** Expandable sections
- **Parallax Scroll View:** Animated scrolling

### Pages Kryesore
1. **Login/Register:** Authentication
2. **Home Tab:** Search & browse items
3. **Add Items:** Form për të raportuar objektet e humbura/gjetura
4. **Lost/Found Items:** Browsing & filtering
5. **My Items:** User-submitted items management
6. **Profile:** Edit user info, view activity
7. **Admin Dashboard:** Moderation panel (users, items, reports)
8. **Chat:** Direct messaging between users
9. **Notifications:** Real-time updates

### Context, Hooks, Services
- **AsyncStorage:** Stores JWT token locally
- **API Service (Axios):** Centralized HTTP requests with token injection
- **Session Service:** Login/logout logic
- **Color Scheme Hook:** Dark/light theme support
- **Notification Service:** Handles push notifications

### Routing
**Expo Router (File-based):**
- `/` → Splash/Home
- `/login` → Login page
- `/register` → Register page
- `/(tabs)/*` → Tab navigation (home, addItems, foundItems, etc.)
- `/admin/*` → Admin panel
- `/chat/[conversationId]` → Individual chat

**Bottom Tabs:**
- Home (search)
- Add Items (create)
- My Items (my submissions)
- Notifications
- Profile

### State Management
- **Local State:** React hooks (useState)
- **Session State:** AsyncStorage (persistent token)
- **Navigation State:** Expo Router
- **Context API:** Shared user data (nëse implementuar)

### Zgjedhja e Kësaj Strukture
✅ **Expo Router** – Simple file-based routing si Next.js
✅ **Bottom Tabs** – Intuitive mobile UX
✅ **Axios Interceptors** – Automatic JWT token handling
✅ **AsyncStorage** – Offline-first token persistence
✅ **Feature-based folders** – Easy to scale & maintain

---

## 4. Backend

### Teknologjitë e Përdorura
| Teknologjia | Versioni | Përdorimi |
|---|---|---|
| Node.js | ^18 | Runtime |
| Express | ^5.2.1 | Web framework |
| JWT | ^9.0.3 | Token authentication |
| bcryptjs | ^3.0.3 | Password hashing |
| MySQL2 | ^3.22.0 | Database driver |
| Multer | ^1.4.5 | File upload handling |
| Nodemon | ^3.1.14 | Development auto-reload |
| CORS | ^2.8.6 | Cross-origin requests |

### Struktura e Folderave
```
backend/
├── src/
│   ├── server.js              # Express app initialization
│   ├── initDb.js              # Database initialization
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── multer.js          # File upload config
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── adminController.js
│   │   ├── chatController.js
│   │   ├── notificationController.js
│   │   ├── categoryController.js
│   │   ├── locationController.js
│   │   └── dashboardController.js
│   ├── routes/                # API endpoints
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── locationRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   └── adminMiddleware.js # Admin role verification
│   ├── services/
│   │   └── authService.js     # Auth business logic
│   ├── repositories/          # Database operations
│   │   ├── userRepository.js
│   │   ├── itemRepository.js
│   │   ├── adminRepository.js
│   │   ├── notificationRepository.js
│   │   └── others...
│   └── utils/
│       └── auth.js            # JWT parsing & verification
└── db/
    └── schema.sql             # Database schema
```

### Controllers
**authController.js**
- `register(req, res)` – User signup
- `login(req, res)` – User login, returns JWT + user profile
- `me(req, res)` – Get current user profile
- `updateMe(req, res)` – Update profile (name, faculty, phone, bio, avatar)
- `deleteMe(req, res)` – Delete account

**itemController.js**
- `addItem()` – Create lost/found item
- `uploadItem()` – Create item with file uploads
- `listItems()` – Get all items (with filters: type, status, userId)
- `listMyItems()` – Get user's own items
- `updateMyItem()` – Edit item details
- `markMyItemFound()` – Change item status to "found"
- `reportItem()` – Report problematic items
- `deleteMyItem()` – Delete own item

**adminController.js**
- `getAdminDashboard()` – Dashboard statistics
- `downloadAdminDashboardPdf()` – Export stats as PDF
- `getAdminUsers()` – List all users (with search)
- `updateAdminUser()` – Update user details
- `toggleAdminUserBlock()` – Block/unblock user
- `getAdminItems()` – List items for moderation
- `approveAdminItem()` – Approve pending item
- `moderateAdminItem()` – Reject or take action on item
- `getAdminReports()` – View flagged items
- `reviewAdminReport()` – Resolve report

**chatController.js**
- `getConversations()` – List user's conversations
- `getMessages()` – Get messages in conversation
- `sendMessage()` – Send new message
- `startConversation()` – Create new chat

**notificationController.js**
- `getNotifications()` – Get user's notifications
- `readNotification()` – Mark as read
- `readAllNotifications()` – Bulk mark as read

### Routes
```
POST   /api/auth/register        – User signup
POST   /api/auth/login           – User login
GET    /api/auth/me              – Get profile
PUT    /api/auth/me              – Update profile
DELETE /api/auth/me              – Delete account

GET    /api/items                – List items (public)
GET    /api/items/mine           – My items
POST   /api/items                – Create item
POST   /api/items/upload         – Create item with files
PUT    /api/items/:id            – Update item
PATCH  /api/items/:id/found      – Mark as found
POST   /api/items/:id/report     – Report item
DELETE /api/items/:id            – Delete item

[ADMIN] /api/admin/dashboard              – Dashboard stats
[ADMIN] /api/admin/dashboard/report.pdf   – PDF export
[ADMIN] /api/admin/users                  – List users
[ADMIN] /api/admin/items                  – Moderation queue
[ADMIN] /api/admin/reports                – Flagged reports

GET    /api/chat                 – Get conversations
POST   /api/chat/send            – Send message
GET    /api/notifications        – Get notifications
PATCH  /api/notifications/:id    – Mark as read

GET    /api/categories           – List categories
GET    /api/locations            – List locations
```

### Middleware
**requireAdmin (adminMiddleware.js)**
- Checks JWT token
- Verifies user.role === 'admin'
- Returns 403 if not admin
- Attached to all `/api/admin/*` routes

### Services
**authService.js** – Core authentication logic
- `registerUser(fullName, email, password)`
  - Hash password with bcryptjs (salt rounds: 10)
  - Check for duplicates
  - Insert into database
- `loginUser(email, password)`
  - Find user by email
  - Compare hashed password
  - Generate JWT token (7-day expiration)
  - Update lastLogin timestamp
- `getUserProfile(userId)` – Get detailed user info
- `saveUserProfile(userId, payload)` – Update user info
- `removeUserAccount(userId)` – Delete user & related data

**utils/auth.js** – JWT utilities
- `getTokenFromRequest(req)` – Extract token from Authorization header or query param
- `getUserIdFromRequest(req)` – Verify & extract userId from token
- `requireUserId(req)` – Throw if not authenticated

### Repositories
Data access layer (all database queries):
- **userRepository.js** – User CRUD operations
- **itemRepository.js** – Item CRUD, filtering, moderation
- **adminRepository.js** – Dashboard stats, admin logs, PDF generation
- **notificationRepository.js** – Notification CRUD
- **categoryRepository.js** – Categories
- **locationRepository.js** – Locations
- **chatRepository.js** – Conversations & messages

### Models (Implicit in Database Schema)

**Database-level models:** Users, Items, Conversations, Messages, Notifications, Reports, Admin Activity

See **Section 5: Database** for detailed schema.

### Zgjedhja e Kësaj Strukture

✅ **MVC Pattern** – Clear separation of concerns
✅ **Repositories** – Abstraction over raw SQL queries
✅ **Middleware** – Role-based access control
✅ **Services** – Reusable business logic (e.g., password hashing, JWT)
✅ **Express** – Lightweight & widely-used for REST APIs
✅ **JWT** – Stateless authentication (scalable)
✅ **bcryptjs** – Industry-standard password hashing

---

## 5. Databaza

### SQL Schema Overview

**11 tabela të ndërlidhura:**
1. `users`
2. `user_profiles`
3. `categories`
4. `locations`
5. `items`
6. `media`
7. `conversations`
8. `messages`
9. `item_reports`
10. `admin_activity`
11. `notifications`

---

### Përshkrimi i Secilës Tabele

#### 1. **users** (Tabela Kryesore)
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| userId | INT (PK) | Auto-increment primary key |
| fullName | VARCHAR(100) | User's full name |
| email | VARCHAR(100) UNIQUE | Unique email (login credential) |
| passwordHash | VARCHAR(255) | bcryptjs hashed password |
| role | ENUM('user', 'admin') | User type (default: 'user') |
| faculty | VARCHAR(100) | University faculty/department |
| phoneNumber | VARCHAR(20) | Contact phone |
| profilePictureUrl | VARCHAR(255) | Avatar URL |
| isActive | BOOLEAN | Account active flag |
| isBlocked | BOOLEAN | Admin block flag |
| createdAt | TIMESTAMP | Account creation date |
| lastLogin | TIMESTAMP NULL | Last login time |

**Primary Key:** userId
**Unique:** email
**Indekset:** email (for login queries)

---

#### 2. **user_profiles**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| profile_id | INT (PK) | Auto-increment |
| user_id | INT UNIQUE (FK) | Reference to users.userId |
| bio | TEXT | User bio/description |
| avatar_url | VARCHAR(255) | Profile picture |
| faculty | VARCHAR(100) | Faculty |
| phone_number | VARCHAR(20) | Phone |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

**Foreign Key:** user_id → users(userId) ON DELETE CASCADE
**Relationship:** 1:1 with users

**Qëllimi:** Extended profile data (optional fields separated from main users table)

---

#### 3. **categories**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| category_id | INT (PK) | Auto-increment |
| name | VARCHAR(100) UNIQUE | Category name (Phones, Wallets, Keys, etc.) |

**Primary Key:** category_id
**Unique:** name

**Qëllimi:** Taxonomy for item classification

---

#### 4. **locations**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| location_id | INT (PK) | Auto-increment |
| name | VARCHAR(100) UNIQUE | Location name (e.g., "Main Campus", "Dormitory A") |

**Primary Key:** location_id
**Unique:** name

**Qëllimi:** Predefined university locations

---

#### 5. **items** (Tabela Qendrore)
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| item_id | INT (PK) | Auto-increment |
| user_id | INT NULL (FK) | Creator of report (nullable for anonymous) |
| title | VARCHAR(255) | Item name/title |
| description | TEXT | Detailed description |
| type | ENUM('lost', 'found') | Lost or found item |
| status | ENUM('open','claimed','resolved','expired') | Current state |
| moderation_status | ENUM('pending','approved','rejected') | Admin approval status |
| category_id | INT (FK) | Item category |
| location_id | INT (FK) | Where found/lost |
| date | DATE | When lost/found |
| reward | VARCHAR(100) | Reward offered (if any) |
| is_anonymous | BOOLEAN | Anonymous posting flag |
| created_at | TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | Last update |

**Foreign Keys:**
- user_id → users(userId)
- category_id → categories(category_id)
- location_id → locations(location_id)

**Indekset:** user_id, category_id, location_id, moderation_status

**Workflow:**
1. User submits item → moderation_status = "pending"
2. Admin reviews → moderation_status = "approved" or "rejected"
3. Once approved → visible to other users
4. Status changes: open → claimed → resolved

---

#### 6. **media**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| media_id | INT (PK) | Auto-increment |
| item_id | INT (FK) | Reference to items |
| url | VARCHAR(255) | Image/file URL |
| created_at | TIMESTAMP | Upload time |

**Foreign Key:** item_id → items(item_id) ON DELETE CASCADE

**Relationship:** 1:N with items (one item can have multiple photos)

**Qëllimi:** Store images/attachments per item

---

#### 7. **conversations**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| id | INT (PK) | Auto-increment |
| user1_id | INT | First participant |
| user2_id | INT | Second participant |
| created_at | TIMESTAMP | Conversation start |

**Relationship:** 1:N with messages

**Qëllimi:** Thread for direct messaging between two users

---

#### 8. **messages**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| id | INT (PK) | Auto-increment |
| conversation_id | INT (FK) | Which conversation |
| sender_id | INT | Who sent message |
| message | TEXT | Message content |
| created_at | TIMESTAMP | Send time |

**Foreign Key:** conversation_id → conversations(id)

---

#### 9. **item_reports**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| report_id | INT (PK) | Auto-increment |
| item_id | INT (FK) | Reported item |
| reported_by | INT (FK) | User who reported |
| reason | VARCHAR(100) | Report reason (spam, inappropriate, etc.) |
| details | TEXT | Additional details |
| status | ENUM('pending','approved','dismissed') | Review status |
| reviewed_by | INT NULL (FK) | Admin who reviewed |
| reviewed_at | TIMESTAMP NULL | When reviewed |
| created_at | TIMESTAMP | Report submission time |

**Foreign Keys:**
- item_id → items(item_id) ON DELETE CASCADE
- reported_by → users(userId) ON DELETE CASCADE
- reviewed_by → users(userId) ON DELETE SET NULL

**Qëllimi:** Content moderation – flag problematic items

---

#### 10. **admin_activity**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| activity_id | INT (PK) | Auto-increment |
| admin_user_id | INT (FK) | Admin who performed action |
| action_type | VARCHAR(60) | Action (approve, reject, block user, etc.) |
| action_target | VARCHAR(60) | What was acted upon (item, user, report) |
| target_id | INT NULL | ID of the target (item_id, user_id, report_id) |
| details | TEXT | Extra info (reason, notes) |
| created_at | TIMESTAMP | Timestamp |

**Foreign Key:** admin_user_id → users(userId) ON DELETE CASCADE

**Qëllimi:** Audit trail of admin actions

---

#### 11. **notifications**
| Kolona | Tipi | Përshkrimi |
|---|---|---|
| notification_id | INT (PK) | Auto-increment |
| recipient_user_id | INT NULL (FK) | User receiving notification (NULL = broadcast) |
| audience | ENUM('user', 'admin') | Target audience |
| type | VARCHAR(80) | Notification type (item_under_review, admin_item_review, etc.) |
| title | VARCHAR(160) | Notification title |
| message | TEXT | Full message |
| link | VARCHAR(255) NULL | Deep link (e.g., "/profile", "/admin/items") |
| metadata_json | TEXT NULL | JSON with extra data (itemId, moderationStatus, etc.) |
| is_read | BOOLEAN | Read flag |
| created_at | TIMESTAMP | Creation time |
| read_at | TIMESTAMP NULL | When marked read |

**Foreign Key:** recipient_user_id → users(userId) ON DELETE CASCADE

**Qëllimi:** Event notifications for users and admins

---

### Relacionet mes Tabelave

```
users (1) ──── (N) items
users (1) ──── (N) conversations (as user1_id or user2_id)
users (1) ──── (N) messages (as sender_id)
users (1) ──── (N) item_reports (as reported_by)
users (1) ──── (N) admin_activity (as admin_user_id)
users (1) ──── (N) notifications (as recipient_user_id)
users (1) ──── (1) user_profiles

items (1) ──── (N) media
items (1) ──── (N) item_reports

categories (1) ──── (N) items
locations (1) ──── (N) items

conversations (1) ──── (N) messages
```

---

### Primary Keys & Foreign Keys Summary
| Tabela | PK | FK | Relationship |
|---|---|---|---|
| users | userId | - | Root entity |
| user_profiles | profile_id | user_id (1:1) | Extended profile |
| categories | category_id | - | Taxonomy |
| locations | location_id | - | Geography |
| items | item_id | user_id (N:1), category_id (N:1), location_id (N:1) | Main content |
| media | media_id | item_id (N:1) | Item photos |
| conversations | id | - | Chat threads |
| messages | id | conversation_id (N:1), sender_id (N:1) | Messages |
| item_reports | report_id | item_id, reported_by, reviewed_by | Content moderation |
| admin_activity | activity_id | admin_user_id (N:1) | Audit trail |
| notifications | notification_id | recipient_user_id (N:1) | Push notifications |

---

### Normalizimi

✅ **1NF** – Each field contains atomic values (no repeating groups)
✅ **2NF** – All non-key attributes depend on entire primary key
✅ **3NF** – No transitive dependencies between non-key attributes

**Shënim:** `user_profiles` duplication (faculty, phone_number) – të dy janë në `users` dhe `user_profiles`. Mund të konsolidohet në të ardhmen.

---

## 6. Autentikimi dhe Siguria

### Login & Register Flow

**Register (POST /api/auth/register)**
```json
Request: {
  "fullName": "John Doe",
  "email": "john@ubt.edu.al",
  "password": "SecurePass123"
}

Response: {
  "message": "User created",
  "userId": 42
}
```

Steps:
1. Check if email already exists (duplicate prevention)
2. Hash password with `bcryptjs` (salt rounds: 10)
3. Insert into `users` table
4. Return userId

**Login (POST /api/auth/login)**
```json
Request: {
  "email": "john@ubt.edu.al",
  "password": "SecurePass123"
}

Response: {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 42,
    "fullName": "John Doe",
    "email": "john@ubt.edu.al",
    "role": "user",
    "faculty": "Engineering",
    ...
  }
}
```

Steps:
1. Find user by email
2. Compare provided password with stored `passwordHash` using `bcryptjs.compare()`
3. If blocked → reject
4. If invalid password → reject
5. Generate JWT token (7-day expiration)
6. Update `lastLogin` timestamp
7. Return token + user profile

---

### JWT (JSON Web Tokens)

**JWT Secret:** Stored in `process.env.JWT_SECRET`

**Token Structure:**
```
Header.Payload.Signature
```

**Payload Example:**
```json
{
  "userId": 42,
  "iat": 1700000000,
  "exp": 1700604800  // 7 days later
}
```

**Expiration:** 7 days (configurable in `authService.js`)

**Token Storage (Frontend):**
- Stored in `AsyncStorage` (persistent local storage)
- Automatically sent in `Authorization: Bearer <token>` header
- Cleared on logout

**Token Verification:**
- Every request to `/api/auth/me`, `/api/items/mine`, etc. requires valid JWT
- `utils/auth.js` extracts and verifies token
- Invalid/expired tokens → 401 Unauthorized

---

### Refresh Token
**Nuk është implementuar** – Token expiration is 7 days. Për të qëndruar i loguar, user duhet të login përsëri pasi të skadojë tokeni.

---

### Authorization (Role-Based Access Control)

**Rolet:**
- `role = 'user'` – Regular user
- `role = 'admin'` – Administrator

**Admin Middleware (adminMiddleware.js):**
```javascript
export const requireAdmin = async (req, res, next) => {
  const userId = requireUserId(req);
  const user = await findUserById(userId);
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
};
```

Attached to all `/api/admin/*` routes.

**User Middleware:**
- No explicit middleware – `requireUserId()` checks if token exists
- Any authenticated user can call `/api/items`, `/api/chat`, etc.

---

### Password Hashing

**Library:** `bcryptjs` version 3.0.3

**Hash Process (at registration & profile update):**
```javascript
const hashed = await bcrypt.hash(password, 10);
// Salt rounds: 10 (industry standard)
```

**Hash Storage:**
- `users.passwordHash` column stores only hashed value
- Original password never stored

**Verification (at login):**
```javascript
const isMatch = await bcrypt.compare(password, user.passwordHash);
if (!isMatch) throw new Error("Invalid password");
```

**Hashing Cost:**
- 10 salt rounds = ~100ms per hash operation
- Brute-force resistant

---

### Masash Sigurie të Pérdorura

| Masë | Implementim | Statusi |
|---|---|---|
| Password Hashing | bcryptjs (10 rounds) | ✅ Implementuar |
| JWT Authentication | 7-day expiration | ✅ Implementuar |
| CORS | Enabled globally | ✅ Implementuar |
| Role-Based Access | Admin middleware | ✅ Implementuar |
| Input Validation | Controller-level | ⚠️ Minimal (No schema validation) |
| SQL Injection Prevention | Parameterized queries | ✅ Implementuar |
| Blocking Users | `users.isBlocked` flag | ✅ Implementuar |
| Account Deletion | Cascade delete via FK | ✅ Implementuar |
| HTTPS | **Nuk është implementuar** | ❌ |
| Rate Limiting | **Nuk është implementuar** | ❌ |
| Environment Variables | .env file | ✅ Implementuar |

---

## 7. Rolet e Sistemit

### Rolet Ekzistuese

#### 1. **User (Regular User)**
- Default role për të gjithë users
- Permissions:
  - ✅ Regjistrohet dhe login
  - ✅ Të shikojë profil personal
  - ✅ Të redaktojë profilin (emri, fakulteti, foto, bio)
  - ✅ Të raportojë objektet e humbura (lost items)
  - ✅ Të raportojë objektet e gjetura (found items)
  - ✅ Të redaktojë/fshijë objektet e tyre
  - ✅ Të lexojnë notifications
  - ✅ Të fillojnë chat me users të tjerë
  - ✅ Të raportojnë items problematike
  - ✅ Të fshijnë account-in

- Restrictions:
  - ❌ Nuk mund të moderojë items të tjerë
  - ❌ Nuk mund të bllokojë users
  - ❌ Nuk mund të aksesojë admin dashboard
  - ❌ Nuk mund të shikojnë admin reports

---

#### 2. **Admin**
- Manually assigned në database (vlerë hard-coded)
- Permissions:
  - ✅ Të bëjnë të gjitha user permissions
  - ✅ Aksesojnë `/api/admin` endpoints
  - ✅ Të shikojnë dashboard me statistika
  - ✅ Të moderojnë items (approve/reject pending)
  - ✅ Të menaxhojnë users (blloko/shblloko)
  - ✅ Të fshijnë items ose users
  - ✅ Të shikojnë të gjithë reports
  - ✅ Të përgjigjen në reports
  - ✅ Të shikojnë audit log (admin_activity)
  - ✅ Të shkarkojnë PDF report

---

### Menaxhimi i Autorizimeve

**Database-level:**
- `users.role` column = 'user' | 'admin'
- Admin status inserted manually në SQL:
  ```sql
  INSERT INTO users (fullName, email, passwordHash, role) VALUES 
  ('Admin User', 'admin@example.com', '$2a$12$...', 'admin');
  ```

**Backend-level:**
- Every admin action checks `requireAdmin` middleware
- Middleware throws 403 Forbidden if user.role ≠ 'admin'

**Frontend-level:**
- Not implemented – Admin panel is accessible but will fail at API level
- Should add frontend role check (nëse implementim i plotë)

---

## 8. Modulet Kryesore

Sistemi përbëhet nga këto module funksionale:

---

### **Module 1: User Management**

**Qëllimi:** Register, login, profile editing, account management

**Funksionalitetet:**
- User registration with email validation
- Login with JWT token generation
- Profile view/edit (name, faculty, phone, bio, avatar)
- Account deletion (cascade delete all related data)
- User blocking by admins

**Controller:** `authController.js`

**Routes:**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/me
DELETE /api/auth/me
```

**Database Tables:**
- `users` – Main user data
- `user_profiles` – Extended profile info

---

### **Module 2: Item Management (Lost & Found)**

**Qëllimi:** Report, search, filter, and manage lost/found items

**Funksionalitetet:**
- Create lost/found item reports
- Upload media (images) with item
- List/search items by type, status, category, location
- Update item details
- Mark item as found/claimed
- Delete own items
- Report problematic items

**Controller:** `itemController.js`

**Routes:**
```
GET    /api/items               – List items (public)
GET    /api/items/mine          – User's items
POST   /api/items               – Create item
POST   /api/items/upload        – Create with files
PUT    /api/items/:itemId       – Update item
PATCH  /api/items/:itemId/found – Mark found
POST   /api/items/:itemId/report – Report item
DELETE /api/items/:itemId       – Delete item
```

**Database Tables:**
- `items` – Item records
- `media` – Photos/attachments
- `item_reports` – Flagged items

**Item Statuses:**
- `open` – Newly submitted or still searching
- `claimed` – Someone claimed they have/found it
- `resolved` – Item recovered or lost item returned
- `expired` – Auto-resolved after period

**Moderation Workflow:**
1. User creates item → moderation_status = "pending"
2. Item hidden from listing
3. Admin approves → moderation_status = "approved" (visible)
4. OR Admin rejects → moderation_status = "rejected" (hidden)

---

### **Module 3: Admin Dashboard & Moderation**

**Qëllimi:** Central control panel for admins to manage platform

**Funksionalitetet:**
- View dashboard statistics (total users, items, active reports)
- Manage users (list, search, block/unblock, delete)
- Moderate items (list pending, approve, reject, delete)
- Review item reports (view flagged items, take action)
- View admin activity log
- Export dashboard as PDF report

**Controller:** `adminController.js`

**Routes:**
```
[ADMIN]
GET    /api/admin/dashboard                 – Stats
GET    /api/admin/dashboard/report.pdf      – PDF export
GET    /api/admin/users                     – List users
PUT    /api/admin/users/:userId             – Update user
PATCH  /api/admin/users/:userId/block       – Toggle block
DELETE /api/admin/users/:userId             – Delete user
GET    /api/admin/items                     – Moderation queue
GET    /api/admin/items/:itemId             – Item details
PUT    /api/admin/items/:itemId             – Update item
PATCH  /api/admin/items/:itemId/approve     – Approve
PATCH  /api/admin/items/:itemId/moderate    – Reject/action
DELETE /api/admin/items/:itemId             – Delete
GET    /api/admin/reports                   – List reports
PATCH  /api/admin/reports/:reportId         – Review report
```

**Database Tables:**
- `users` – User management
- `items` – Item moderation
- `item_reports` – Report reviews
- `admin_activity` – Audit trail

---

### **Module 4: Chat & Direct Messaging**

**Qëllimi:** Enable direct communication between users

**Funksionalitetet:**
- Start conversations between two users
- Send/receive messages
- List user's conversations
- Get conversation history

**Controller:** `chatController.js`

**Routes:**
```
GET    /api/chat           – Get conversations
POST   /api/chat           – Send message / start chat
GET    /api/chat/:convId   – Get messages in conversation
```

**Database Tables:**
- `conversations` – 1:1 chat threads between users
- `messages` – Individual messages

**Not Implemented:**
- Real-time WebSocket messaging
- Typing indicators
- Read receipts
- Message editing/deletion

---

### **Module 5: Notifications**

**Qëllimi:** Alert users about platform events

**Funksionalitetet:**
- Create notifications for users/admins
- Get user's notifications (filtered by role)
- Mark notifications as read
- Bulk mark all as read
- Include deep links for action

**Controller:** `notificationController.js`

**Routes:**
```
GET    /api/notifications           – Get all
PATCH  /api/notifications/:id       – Mark read
PATCH  /api/notifications/read-all  – Mark all read
```

**Database Tables:**
- `notifications` – Event records

**Notification Types Implemented:**
- `item_under_review` – User's item pending admin approval
- `admin_item_review` – Admin notified of pending item
- Custom metadata stored as JSON

**Not Implemented:**
- Push notifications (no Firebase Cloud Messaging)
- Email notifications
- SMS notifications

---

### **Module 6: Categories & Locations**

**Qëllimi:** Taxonomy for filtering and organizing items

**Funksionalitetet:**
- Get list of item categories (Phones, Wallets, Keys, Documents, etc.)
- Get list of university locations (Main Campus, Dormitory A, Library, etc.)
- Use for filtering items

**Routes:**
```
GET    /api/categories     – List categories
GET    /api/locations      – List locations
```

**Database Tables:**
- `categories` – Item types
- `locations` – Physical locations

---

### **Module 7: Dashboard Reports (Partial)**

**Qëllimi:** Provide analytics & reporting

**Funcsionalitetet (Admin Only):**
- View dashboard statistics (users count, items count, pending items, reports)
- Download PDF report with dashboard data

**Routes:**
```
GET    /api/dashboard          – Stats (public?)
GET    /api/admin/dashboard    – Stats (admin only)
GET    /api/admin/dashboard/report.pdf – PDF (admin only)
```

**Not Fully Implemented:**
- Time-based analytics
- Trend reports
- User activity reports

---

## 9. Rrjedha e të Dhënave

### End-to-End Data Flow

```
┌─────────────────────┐
│  FRONTEND (Expo)    │
│  React Native App   │
└──────────┬──────────┘
           │ HTTP POST /api/items/upload
           │ + JWT Token
           │ + Form data (title, description, files)
           │
           ↓
┌─────────────────────┐
│  BACKEND (Express)  │
│  Route Handler      │  (itemRoutes.js: uploadItem)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  CONTROLLER         │  (itemController.uploadItem)
│  - Validate input   │
│  - Extract JWT      │
│  - Parse files      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  SERVICE            │  (Not explicitly used in items)
│  - Business logic   │  (Used in auth: authService.js)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  REPOSITORY         │  (itemRepository.createItemWithFiles)
│  - Database access  │
│  - Query builder    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  DATABASE (MySQL)   │
│  - Execute query    │
│  - Insert item      │
│  - Insert media     │
│  - Return itemId    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  RESPONSE (JSON)    │  {
│  - Status 201       │    "message": "Item created",
│  - Data returned    │    "itemId": 123
│  - Sent to Frontend │  }
└─────────────────────┘
           ↑
           │ HTTP 201
           │ JSON Response
           │
┌──────────┴──────────┐
│  FRONTEND (Expo)    │
│  - Update UI        │
│  - Show success     │
│  - Navigate home    │
└─────────────────────┘
```

### Example: Item Submission Flow

**Step 1: User Action (Frontend)**
```javascript
// App navigates to AddItem form
// User fills: title, description, category, location, photos
// User clicks "Submit"
```

**Step 2: API Call**
```javascript
// src/services/api.js makes request
const response = await api.post('/items/upload', formData, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Step 3: Backend Route**
```javascript
// itemRoutes.js
router.post("/upload", upload.any(), uploadItem);
```

**Step 4: Controller Processing**
```javascript
// itemController.uploadItem()
1. Extract userId from JWT
2. Get form fields (title, description, category, etc.)
3. Process uploaded files → get URLs
4. Validate required fields
5. Call repository method
```

**Step 5: Database Operations**
```javascript
// itemRepository.createItemWithFiles()
1. INSERT INTO items (title, description, type, category_id, etc.)
   VALUES (..., ..., 'lost', 5, ...)
   // moderation_status = 'pending'
2. FOR each mediaUrl: INSERT INTO media (item_id, url)
3. RETURN itemId
```

**Step 6: Create Notifications**
```javascript
// Create notification for user
- Type: 'item_under_review'
- Message: 'Your report is waiting for admin approval'

// Create notification for admin
- Type: 'admin_item_review'
- Message: 'New item submitted for review'
```

**Step 7: Send Response**
```json
{
  "message": "Item created with media",
  "itemId": 123
}
```

**Step 8: Frontend Update**
- Show success message
- Navigate to home or profile
- Re-fetch items list

---

## 10. Vlerësim Arkitekturor

### A është Ndarja Aktuale e Mirë?

**Përgjithësi:** Po, arkitektura është e qartë dhe e ndjekshme. MVC pattern + Repositories është industri standard.

---

### Avantazhet

| Aspekti | Shpjegim |
|---|---|
| **Separation of Concerns** | Controllers, services, repositories janë të ndara qartë |
| **Scalability** | Struktura lejon shtimin e features pa ndryshime të mëdha |
| **Testability** | Repositories dhe services mund të testohen independently |
| **Reusability** | Services (authService) mund të përdoren në shumë vende |
| **Mobile + Web** | Frontend/backend separation lejon multiple clients |
| **Database Abstraction** | Repositories fshijnë raw SQL kompleksitete |
| **JWT Authentication** | Stateless → skallon lehtë |
| **Role-based Access** | Admin middleware enforce role checks |
| **File Upload** | Multer handling ndaras, i sigurtë |

---

### Mangësitë

| Mangësi | Pse | Zgjidhja |
|---|---|---|
| **No Input Validation** | Controllers nuk validojnë form data | Përdorni zod, joi, ose express-validator |
| **No Error Handling** | Try-catch-all responses | Implementoni custom error classes |
| **No Logging** | Nuk ka visibility në server events | Përdorni winston ose pino |
| **No API Documentation** | Nuk ka Swagger/OpenAPI spec | Dokumentoni ose përdorni swagger-jsdoc |
| **No Tests** | Zero unit/integration tests | Shkruani tests me Jest/Mocha |
| **No Rate Limiting** | DDoS/brute-force vulnerable | Përdorni express-rate-limit |
| **No Database Indexing** | Queries mund të jenë të ngadaltë | Indexoni frequently queried fields |
| **No Caching** | Every request hits database | Përdorni Redis |
| **No API Versioning** | Breaking changes break clients | Implementoni /api/v1/... paths |
| **Duplicate Code** | profile_id në user_profiles + users | Consolidate në một tabella |
| **No Refresh Tokens** | JWT 7-day fixed → re-login required | Implementoni token refresh logic |
| **No HTTPS** | Unencrypted in production | Deploy me SSL certificate |
| **No Environment Separation** | Dev, staging, prod configs same | Use different .env files |
| **Frontend Validation** | Only backend validates | Add form validation në frontend |

---

### Çfarë Mund të Përmirësohet

**Short-term Improvements:**
1. ✅ Add input validation (zod or joi)
2. ✅ Add API documentation (Swagger)
3. ✅ Add rate limiting
4. ✅ Add logging (Winston)
5. ✅ Add unit tests

**Medium-term Improvements:**
6. ✅ Setup CI/CD pipeline (GitHub Actions)
7. ✅ Add database indexes for performance
8. ✅ Implement refresh tokens
9. ✅ Add frontend role-based access checks
10. ✅ Consolidate user profile tables

**Long-term Improvements:**
11. ✅ Add caching layer (Redis)
12. ✅ Implement real-time notifications (WebSocket)
13. ✅ Setup monitoring & alerting (Sentry, New Relic)
14. ✅ Add image optimization & CDN
15. ✅ Migrate to TypeScript (better type safety)

---

## 11. Dokumentacioni

### Krahasimi i Dokumentacionit vs Implementimit

**Project README.md:**
```markdown
# UBT-FindPoint
```
**Statusi:** Minimal – vetëm emri i projektit

---

### Dokumentacioni i Implementimit

| Aspekti | Dokumentuar | Status |
|---|---|---|
| **API Endpoints** | ❌ No Swagger/OpenAPI | Nuk ekziston dokumentim formal |
| **Database Schema** | ✅ schema.sql exists | Komplet me CREATE TABLE statements |
| **Authentication** | ⚠️ Implicit në code | Nuk ka README ose wiki |
| **Deployment** | ❌ No guide | Nuk ka instructions për run server |
| **Frontend Setup** | ⚠️ package.json exists | Minimal – nuk ka setup guide |
| **Admin Features** | ❌ No guide | Nuk ka instructions per admin |
| **Module Structure** | ⚠️ Folder names suggest | Nuk ka formal documentation |
| **Error Codes** | ❌ No reference | API errors nuk janë dokumentuar |
| **Environment Variables** | ❌ No .env.example | Nuk dihet çfarë vars duhen |

---

### Modulet e Dokumentacionit vs Implementim

**Dokumentuar në Database Schema:**
- ✅ users
- ✅ categories
- ✅ locations
- ✅ items
- ✅ conversations
- ✅ notifications

**Dokumentuar në Code (implicit):**
- ✅ Auth routes (login, register)
- ✅ Item CRUD
- ✅ Admin endpoints
- ✅ Chat
- ✅ Notifications

**Not Documented:**
- ❌ How to install & run backend
- ❌ How to run frontend locally
- ❌ API request/response examples
- ❌ Admin dashboard usage guide
- ❌ Database migration process

---

### Rekomandime

1. **Krijo README.md të plotë** me:
   - Përshkrimin e projektit
   - Installation instructions
   - Running instructions
   - API endpoint documentation

2. **Setup Swagger UI** për API docs

3. **Krijo .env.example** file

4. **Shkruaj deployment guide** (production checklist)

5. **Document admin features** (how to moderate items, manage users)

---

## 12. Pyetje të Mundshme në Mbrojtje

Total: **47 pyetje** të ndarë sipas kategorive

---

### **FRONTEND – React Native & Expo**

#### 1. React & Architecture
- **P1:** Pse zgjodhe React Native për frontend në vend të PWA ose native iOS/Android?
  - **R:** React Native lejon code sharing përmes platforms (iOS, Android, Web). Expo macht it easier to develop, test, and deploy pa Xcode/Android Studio. React ecosystem është i madh dhe i mirë dokumentuar.

- **P2:** Çfarë është Expo Router dhe si ndryshon nga React Navigation?
  - **R:** Expo Router është file-based router (similar to Next.js). Automatikisht gjeneron navigation structure nga folder hierarchy. React Navigation kërkon manual setup të screens.

- **P3:** Shpjego component hierarchy në aplikacionin tuaj.
  - **R:** Root `_layout.tsx` → Stack navigator → Screens → Individual components. Theming provider wraps everything. Bottom tabs navigations inside (tabs) group.

- **P4:** Pse përdor TypeScript në disa files dhe JavaScript në të tjerat?
  - **R:** Mix i TypeScript (.tsx, .ts) dhe JavaScript (.js). TypeScript provides type safety për components; JavaScript në utilities është më flexible për rapid development.

- **P5:** Si menaxhon state-in aplikacionin?
  - **R:** React hooks (useState). AsyncStorage për persistent token. No global state library like Redux (simplicity). Frontend context API mund të ishte shtuar për shared data.

#### 2. Routing & Navigation
- **P6:** Shpjego (tabs) folder structure dhe si funksionon navigation?
  - **R:** (tabs) adalah dynamic route group. Inside: _layout.tsx setup bottom tab navigator. Each folder (home, profile, items, etc.) è a tab screen.

- **P7:** Si navigohet me programmatic navigation?
  - **R:** `useRouter()` hook → `router.push('/path')` për navigate, `router.back()` për back.

- **P8:** Çfarë janë stack screens vs tab screens?
  - **R:** Stack screens: home → login → register (push/pop). Tab screens: home, profile, items (bottom tabs, parallel screens).

#### 3. Services & API Integration
- **P9:** Shpjego axios interceptor setup për JWT authentication.
  - **R:** api.js setup axios instance. Request interceptor retrieves JWT from AsyncStorage. Adds `Authorization: Bearer <token>` header automatikisht.

- **P10:** Si menaxhohet token storage në AsyncStorage?
  - **R:** Token saved në AsyncStorage after login. Retrieved for every API call. Cleared on logout. Persistent across app restarts.

- **P11:** Çfarë ndodh kur JWT token skadon?
  - **R:** 401 response from server. Frontend duhet të log out user and redirect to login. Refresh token mechanism nuk existe (7-day login session).

- **P12:** Si funksionon image picker at upload në add items form?
  - **R:** expo-image-picker lets user select images. Multer on backend handles upload. Files saved to `/assets/upload/`. URL returned to mobile app.

#### 4. Components & UI
- **P13:** Cilat janë komponentët custom të ndërtuar?
  - **R:** Modern navbar, themed-text, themed-view, haptic-tab, parallax-scroll-view, collapsible, icon-symbol, etc.

- **P14:** Pse përdor expo-linear-gradient?
  - **R:** Creates gradient backgrounds. Used in theming & UI design for visual appeal.

- **P15:** Si implementohet dark/light theme?
  - **R:** useColorScheme hook detects system preference. ThemeProvider wraps app with DarkTheme or DefaultTheme.

---

### **BACKEND – Node.js, Express, Architecture**

#### 5. Server Setup & Configuration
- **P16:** Shpjego server.js architecture at ç'është initDB?
  - **R:** server.js creates Express app, applies middleware (CORS, JSON parser), registers routes, starts listening. initDB initializes MySQL connection pool.

- **P17:** Pse mbahen routes separtim nga controllers?
  - **R:** Route definitions define URL + method + handler. Controllers contain business logic. Separation makes routing clean, testable, reusable.

- **P18:** Si konfiguron CORS at pse?
  - **R:** `app.use(cors())` allows requests from frontend. Without it, browser blocks cross-origin requests (security policy).

- **P19:** Shpjego multer config për file uploads.
  - **R:** Multer middleware handles form-data requests. Stores uploaded files to `/assets/upload/`. Returns file metadata (filename, path) to handler.

#### 6. Controllers & Business Logic
- **P20:** Cili ështe roli i authController dhe funksionalitetet e tij?
  - **R:** Handles registration, login, profile fetch/update, account deletion. Uses authService for password hashing & JWT generation.

- **P21:** Si funksionon item creation me file uploads?
  - **R:** uploadItem controller extracts form fields, processes multer files, validates required fields, calls itemRepository to insert item + media.

- **P22:** Si moderuhet contenti (items) nga admini?
  - **R:** Items created with moderation_status = 'pending'. Admin approves/rejects via PATCH /api/admin/items/:id/moderate. Pending items hidden from listing.

- **P23:** Shpjego notifikacion creation flow.
  - **R:** When item submitted, createNotification called. Inserts record in notifications table. Frontend polls GET /api/notifications to fetch.

#### 7. Services & Utilities
- **P24:** Çfarë përfshihet në authService?
  - **R:** registerUser, loginUser, getUserProfile, saveUserProfile, removeUserAccount. Handles password hashing, JWT creation, profile logic.

- **P25:** Shpjego utils/auth.js at këto funksione: getTokenFromRequest, getUserIdFromRequest, requireUserId?
  - **R:** Extract JWT from "Authorization: Bearer <token>" header or query param. Verify token signature using JWT_SECRET. Return userId or throw 401.

- **P26:** Pse përdor JWT në vend të session-based authentication?
  - **R:** JWT ështe stateless – nuk kërkon server-side storage. Scales better horizontally. Token carries all needed info (userId) verified by signature.

#### 8. Middleware & Authorization
- **P27:** Shpjego adminMiddleware at si protejoj admin endpoints?
  - **R:** requireAdmin middleware extracts userId from JWT, fetches user record, checks role === 'admin'. Returns 403 if not admin. Attached to all /api/admin/* routes.

- **P28:** Cilat janë rolet në sistem at çfarë mund të bëjë secili?
  - **R:** 'user' – regular functionality (post items, chat). 'admin' – moderate content, manage users, view dashboard. Manually assigned in database.

#### 9. Repositories & Database Access
- **P29:** Pse përdor repositories në vend të direct queries?
  - **R:** Abstraction layer. Encapsulates SQL complexity. Makes code testable, reusable, easier to change database implementation later.

- **P30:** Shpjego userRepository at main functions.
  - **R:** findUserById, findUserByEmail, createUser, updateUserProfile, deleteUserAccount, etc. All database operations for users table.

- **P31:** Si funksionon item filtering në listItems?
  - **R:** Query builder filters by type (lost/found), status (open/claimed), userId, moderationStatus. Returns paginated results.

---

### **DATABASE – MySQL & Schema**

#### 10. Database Design
- **P32:** Pse users table ka role column?
  - **R:** Stores user type (user vs admin). Used for authorization checks in middleware. Determines what endpoints user can access.

- **P33:** Shpjego items table structure at statuses.
  - **R:** Stores lost/found item reports. type: ENUM('lost', 'found'). status: open/claimed/resolved/expired. moderation_status: pending/approved/rejected.

- **P34:** Si relacionohet items table me media table?
  - **R:** 1:N relationship. One item can have many photos/attachments. media.item_id references items.item_id. Cascade delete if item deleted.

- **P35:** Cila ështe razoni për user_profiles table?
  - **R:** Extended profile data (bio, avatar, faculty, phone). Separate from main users table. 1:1 relationship. Allows optional profile data.

- **P36:** Si funksionojnë conversations at messages tables?
  - **R:** conversations = chat thread between 2 users. messages = individual messages in conversation. 1:N relationship. Ordered by timestamp.

- **P37:** Shpjego item_reports table at moderation flow.
  - **R:** Users report problematic items. Admin reviews. status: pending/approved/dismissed. reviewed_by tracks which admin reviewed. Audit trail.

#### 11. Relationships & Constraints
- **P38:** Cilat janë foreign key relationships në database?
  - **R:** items.user_id → users. items.category_id → categories. items.location_id → locations. media.item_id → items (cascade delete). messages.conversation_id → conversations. Etc.

- **P39:** Shpjego ON DELETE CASCADE vs ON DELETE SET NULL.
  - **R:** CASCADE: if parent deleted, children auto-deleted. SET NULL: if parent deleted, foreign key becomes NULL. CASCADE used for item photos (delete item → delete media).

- **P40:** Si evitojnë SQL injection?
  - **R:** Parameterized queries. mysql2 library uses ? placeholders: `query('SELECT * FROM users WHERE id = ?', [userId])`. Input values never concatenated to query string.

#### 12. Database Normalization
- **P41:** A ështe schema normalized?
  - **R:** Yes, 3NF mostly. Each field atomic. No transitive dependencies. Exception: user_profiles duplicates data from users (faculty, phone).

- **P42:** Pse item_reports ka reviewed_by field?
  - **R:** Audit trail – track which admin reviewed report. ON DELETE SET NULL handles admin deletion.

---

### **SECURITY – Authentication, Authorization, Hashing**

#### 13. Authentication & JWT
- **P43:** Shpjego login flow step by step.
  - **R:** (1) User sends email + password. (2) Server finds user by email. (3) Compare password with bcrypt. (4) Generate JWT (userId payload, 7d expiration). (5) Return token + user profile.

- **P44:** Si protejoj password-at?
  - **R:** bcryptjs hashing (10 salt rounds). Original password never stored. bcrypt.compare() verifies login passwords. Salt prevents rainbow table attacks.

- **P45:** Pse JWT expiration set to 7 days?
  - **R:** Balance between security (shorter = safer) and UX (longer = less re-login). 7 days reasonable for mobile app. Refresh tokens would extend sessions.

#### 14. Authorization & Roles
- **P46:** Si menaxhon admin access control?
  - **R:** requireAdmin middleware checks user.role === 'admin'. Blocks non-admins with 403. Attached to all sensitive endpoints (/api/admin/*).

- **P47:** Si bllokon admin account-in e user?
  - **R:** Admin sends PATCH /api/admin/users/:userId/block. Sets users.isBlocked = true. Login check rejects blocked users: "Account blocked".

---

## Përfundim

**FindPoint** ështe një aplikacion full-stack well-structured për universitetet për të menaxhuar objektet e humbura/gjetura. Frontend (React Native) + Backend (Node.js) + Database (MySQL) + Admin Dashboard siguron përvojë komplet.

**Pikat e forta:** Clear MVC architecture, JWT authentication, role-based access, moderation system.

**Sipas përmisimit:** Input validation, API docs, logging, testing, refresh tokens, HTTPS, rate limiting.


---

**Suksese koleg**

**Kete file me e fshi para ligjerates**
**git rm README.CONTENT.md , git commit -m "Remove README.CONTENT.md" , git push origin main ** 