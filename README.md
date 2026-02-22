# GYM Master - Admin Panel

The internal Master Admin Panel for SaaS platform owners. Built with React, Vite, MUI, and Redux Toolkit.

---

## Page-by-Page Logic Breakdown

### 1. Login (`/login`)
- **API:** `POST /api/admin/auth/login`
- **Logic:** Sends email + password. Backend validates via bcrypt, checks `loginAttempts` (5 max → 30min lock), returns JWT + refreshToken + user object.
- **State:** On success, dispatches `loginSuccess(data)` to Redux `authSlice` → stores `adminToken` and `adminUser` in localStorage.
- **Security:** Protected route wrapper checks `state.auth.isAuthenticated` before rendering any Layout child.

### 2. Dashboard (`/`)
- **API:** `GET /api/admin/dashboard/kpis`, `GET /api/admin/dashboard/charts/*`
- **Logic:** Aggregates all GymOrganizations (total, active, trial, expired), sums AdminPayment amounts for monthly revenue, counts upcoming expiries within 7 days.
- **Charts:** 4 Recharts components (Line=revenue, Pie=plan distribution, Bar=gym growth, Area=subscription status trend).
- **State:** Local `useState` for each KPI card + chart data.

### 3. Organizations (`/organizations`)
- **API:** `GET/POST/PUT/DELETE /api/admin/organizations`
- **Logic:** Lists all GymOrganizations with columns (Name, Owner, Plan, Branch Used/Limit, Status, Expiry, Actions). Create form auto-generates owner User account in backend. Suspend action cascades to block tenant login.
- **Components:** `DataTable` (paginated), `FormDialog` (create/edit), `StatusChip`, `SearchBar`.
- **State:** Local state with pagination (page, rowsPerPage, total).

### 4. Plans (`/plans`)
- **API:** `GET/POST/PUT/DELETE /api/admin/plans`
- **Logic:** Displays all SubscriptionPlans as card grid. Each card shows: price (monthly/yearly), branch limit, member limit, and 5 feature flags (✅/❌ icons for vrEnabled, analyticsAdvanced, qrCheckIn, multiCitySupport, publicWebsite).
- **Components:** Custom pricing cards with `CardComponent`, `ButtonComponent`.
- **State:** Local array of plans.

### 5. Subscriptions (`/subscriptions`)
- **API:** `GET /api/admin/subscriptions`, `PATCH /:id/renew|suspend|cancel|extend|billing-cycle`, `GET /export-csv`
- **Logic:** Full lifecycle control. Action menu per row: **Renew** (resets dates + activates), **Extend** (dialog for N days), **Suspend** (locks gym), **Cancel** (terminates). CSV export downloads all subscriptions.
- **Components:** `DataTable`, `StatusChip` (trial/active/grace/expired/suspended/cancelled), action `Menu` + `ExtendDialog`.
- **Filter:** Status dropdown (All/Trial/Active/Grace/Expired/Suspended/Cancelled).

### 6. Payments (`/payments`)
- **API:** `GET/POST /api/admin/payments`
- **Logic:** Record manual payments (Cash/UPI/Bank Transfer/Cheque). On submit, backend auto-extends subscription expiry and sets status to active. Shows payment history with gym name, plan, amount, mode, transaction ref, date, and who recorded it.
- **Components:** `DataTable`, `FormDialog` (record payment form), `StatusChip`.

### 7. Analytics (`/analytics`)
- **API:** `GET /api/admin/dashboard/charts/*`
- **Logic:** Dashboard-grade charts on a dedicated page. Revenue by month (Line), Revenue by plan (Bar), Active vs Expired (Pie), Subscription status breakdown (Area).
- **Charts:** Recharts with `ResponsiveContainer`, custom theme-aware colors.

### 8. Audit Logs (`/logs`)
- **API:** `GET /api/admin/logs`
- **Logic:** Every admin action is tracked: plan changes, subscription upgrades, manual payments, org suspensions, admin logins. Columns: Action, Gym, Performed By, Timestamp, Details (old→new values).
- **Components:** `DataTable` (paginated), `SearchBar` for filtering.

### 9. Settings (`/settings`)
- **API:** None (client-side only, Redux → localStorage)
- **Logic:** Controls UI appearance and displays system defaults.
  - **Appearance:** Dark/Light mode toggle via `themeSlice.toggleMode()`
  - **Color Theme:** 4 palettes (Ocean Blue `#3b82f6`, Forest Green `#22c55e`, Sunset Orange `#f97316`, Midnight Purple `#8b5cf6`) via `themeSlice.setColor()`
  - **Subscription Defaults:** Displays default trial days (14), grace period (7), auto-suspend toggle
  - **Global Feature Flags:** Switch toggles for all 6 features
  - **Security Overview:** Lists active security measures (JWT, bcrypt, rate-limit, Helmet, account lock)

### 10. Profile (`/profile`)
- **API:** `GET/PUT /api/admin/auth/profile`, `PUT /api/admin/auth/change-password`, `GET /api/admin/auth/login-history`
- **Logic:** Edit admin name/phone, change password (requires current password), view last 20 login events with IP and timestamp.
- **State:** Dispatches `updateUser()` to Redux on profile save.

---

## State Management (Redux Toolkit)

### `authSlice`
```javascript
{
  user:            { id, name, email, role, avatar },  // from login response
  token:           String,                              // JWT access token
  isAuthenticated: Boolean,                             // derived from token
}
// Actions: loginSuccess, logout, updateUser
// Persistence: localStorage (adminUser, adminToken)
```

### `themeSlice`
```javascript
{
  mode:  "dark" | "light",    // default: "dark"
  color: "ocean" | "forest" | "sunset" | "midnight",  // default: "ocean"
}
// Actions: toggleMode, setColor
// Persistence: localStorage (themeMode, themeColor)
```

---

## Theming System (`theme/theme.js`)

### 4 Color Palettes
| Key | Primary | Secondary |
|-----|---------|-----------|
| ocean | `#3b82f6` (Blue) | `#14b8a6` (Teal) |
| forest | `#22c55e` (Green) | `#f59e0b` (Amber) |
| sunset | `#f97316` (Orange) | `#e11d48` (Rose) |
| midnight | `#8b5cf6` (Purple) | `#ec4899` (Pink) |

### MUI Component Overrides
The theme applies deep customization to:
- `MuiOutlinedInput` — rounded 10px, visible borders in dark mode (`rgba(148,163,184,0.25)`)
- `MuiTableHead` — uppercase headers, 700 weight, theme-tinted background
- `MuiDrawer` — no background image flicker in dark mode
- `MuiDialog` — 16px border radius, clean paper background
- `MuiCssBaseline` — thin custom scrollbar (6px, translucent)
- `MuiSwitch` — primary color track when checked

### Font
**Outfit** (Google Fonts) — imported in `index.css`, applied via `typography.fontFamily`.

---

## Component Architecture

### Common Components (`components/common/`)
| Component | Props | Design |
|-----------|-------|--------|
| `CardComponent` | title, subtitle, icon, action, noPadding, hover | Glassmorphism card with tinted icon container, CSS hover elevation |
| `ButtonComponent` | variant, color, loading, disabled, startIcon | CSS box-shadow glow, loading spinner text |
| `DataTable` | columns, rows, total, page, rowsPerPage, renderRow, emptyMessage | Theme-aware header, MUI TablePagination |
| `StatusChip` | label, variant | Auto-maps status to semantic colors |
| `SearchBar` | value, onChange, placeholder | Theme-tinted icon + input |
| `FormDialog` | open, onClose, title, onSubmit, children | Consistent modal with header divider |
| `Layout` | — | Sidebar + Header + Outlet wrapper |

### Layout Components
- `Sidebar` — 260px permanent drawer (desktop), temporary drawer (mobile), 9 menu items with active state highlight
- `Header` — Sticky AppBar with backdrop blur, dark/light toggle, admin avatar + name

---

## Axios Configuration (`services/apiService.js`)
```javascript
const api = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Setup & Commands
```bash
npm install              # Install dependencies
npm run dev              # Dev server (Vite HMR)
npm run build            # Production build → /dist
```
