
# 🎨 CodeLens MVP - Frontend Integration Guide

This document serves as the implementation specification for frontend developers building the CodeLens web application. The backend provides a RESTful API powered by Flask and PostgreSQL.

---

## 1. Project Overview

**CodeLens MVP** is an institutional analytics platform that tracks student coding performance across multiple competitive programming sites (LeetCode, Codeforces, etc.).

### Key Features:
- **Student Dashboard**: Visualizes problem-solving progress, ratings, and growth metrics.
- **Department Leaderboards**: Ranks students based on total problems solved.
- **Admin Management**: Assigns students to departments and manages academic structure.
- **Platform Tracking**: Students link external coding accounts for automated tracking.

### Communication Protocol:
- **API Base URL**: `http://localhost:5000`
- **Authentication**: Bearer Token (JWT) required for all protected routes.
- **Data Format**: JSON (Standardized success/error responses).

---

## 2. Tech Stack Recommendation

To build a fast, modern, and scalable frontend, we recommend the following stack:

- **Framework**: React + Vite (Fast, lightweight) or Next.js (SEO, SSR).
- **State Management**: React Context API (Auth), React Query (Data Fetching).
- **Styling**: Tailwind CSS (Utility-first, rapid UI).
- **Routing**: React Router v6.
- **HTTP Client**: Axios (Interceptors for token handling).
- **Charts**: Recharts (Simple, composable charts).
- **Icons**: Lucide React or Heroicons.

---

## 3. Authentication Flow

### Registration
- **Endpoint**: `POST /auth/register`
- **Payload**: `{ "email": "...", "password": "...", "full_name": "..." }`
- **Success**: Returns `201 Created`.

### Login
- **Endpoint**: `POST /auth/login`
- **Payload**: `{ "email": "...", "password": "..." }`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "uuid",
        "email": "student@example.com",
        "roles": ["student"]
      }
    }
  }
  ```

### Token Handling
1. **Store Token**: Save `access_token` in `localStorage` or `sessionStorage`.
2. **Attach Header**: Add `Authorization: Bearer <token>` to all subsequent requests.
3. **Handle 401/403**: Redirect to `/login` if token expires or is invalid.

---

## 4. Role-Based Access Control (RBAC)

The UI must adapt based on the user's role array returned during login.

| Role | Access Level |
| :--- | :--- |
| **student** | View own dashboard, link platforms, view leaderboards. |
| **admin** | Create departments, assign students, view all students. |
| **hod** | View department statistics, leaderboards (Department scoped). |
| **counsellor** | View assigned student progress (Read-only access). |

### Protected Route Logic
Wrap critical routes in a `ProtectedRoute` component that checks:
1. Is user logged in?
2. Does user have the required role?

If not authorized, redirect to `403 Unauthorized` page.

---

## 5. Student Dashboard Requirements

The dashboard is the main view for students.

### UI Components Mapping

| Component | Purpose | API Endpoint | Data Needed |
| :--- | :--- | :--- | :--- |
| **Profile Card** | Shows name, reg number, department. | `GET /analytics/my-summary` | `student_info` object |
| **Stats Overview** | Cards for Total Solved, Avg Rating, Total Growth. | `GET /analytics/my-summary` | `overall_aggregation` object |
| **Platform Table** | List linked accounts (LeetCode, etc.). | `GET /platforms/my` | List of accounts |
| **Link Platform Modal** | Form to add new account. | `POST /platforms/link` | `platform_name`, `username` |
| **Performance Chart** | Line chart of rating/solved over time. | `GET /snapshots/<account_id>` | Historical snapshot list |
| **Growth Widget** | Shows "X problems since last check". | `GET /analytics/my-growth/<id>` | `growth_percentage`, `total_growth` |

---

## 6. Admin Panel Requirements

Admin users require a dedicated management interface.

| Feature | Action description | API Endpoint | Method |
| :--- | :--- | :--- | :--- |
| **Create Department** | Add new academic department. | `/academics/departments` | `POST` |
| **Department List** | View existing departments. | `/academics/departments` | `GET` |
| **Assign Department** | Map student to department. | `/students/<id>/assign-department` | `PUT` |
| **Bootstrap Admin** | Initial setup (Dev only). | `/setup/bootstrap-admin` | `POST` |

---

## 7. Leaderboard Page

A tabular view allowing filtering by department.

### Columns:
1. **Rank** (1, 2, 3...)
2. **Student Name**
3. **Total Solved** (Sum of latest snapshots across platforms)
4. **Department** (If viewing global list)

### API Integration:
- **Fetch**: `GET /analytics/department/<dept_id>/leaderboard`
- **Sort**: Data comes pre-sorted by `total_solved` DESC.
- **Filter**: Frontend dropdown to select `department_id` to fetch different lists.

---

## 8. API Endpoint Summary

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticate user |
| `POST` | `/auth/register` | Public | Create new account |
| `GET` | `/analytics/my-summary` | Student | Full dashboard data aggregation |
| `GET` | `/platforms/my` | Student | List linked coding accounts |
| `POST` | `/platforms/link` | Student | Connect LeetCode/Codeforces |
| `DELETE` | `/platforms/<id>` | Student | Unlink a platform |
| `POST` | `/snapshots` | Student | Record daily progress snapshot |
| `GET` | `/snapshots/<account_id>` | Student | Get history for charts |
| `GET` | `/academics/departments` | Public/Auth | List available departments |
| `POST` | `/academics/departments` | Admin | Create new department |
| `PUT` | `/students/<id>/assign-department` | Admin | Assign student to department |
| `GET` | `/analytics/department/<id>/leaderboard` | Admin/HOD | View ranked student list |

---

## 9. Standard API Response

The backend guarantees a consistent JSON structure.

### ✅ Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }  // Object or Array
}
```

### ❌ Error Response
```json
{
  "success": false,
  "error": "Detailed error message here"
}
```

**Note**: Always check `success === true`.

---

## 10. Recommended Project Structure

```text
src/
├── api/
│   ├── axios.js           # Axios instance with interceptors
│   ├── auth.js            # Login/Register calls
│   ├── analytics.js       # Dashboard & Leaderboard calls
│   └── admin.js           # Admin management calls
├── assets/                # Images, fonts
├── components/
│   ├── common/            # Buttons, Inputs, Cards, Loader
│   ├── layout/            # Navbar, Sidebar, Footer
│   ├── charts/            # Recharts wrappers
│   └── dashboard/         # Student specific widgets
├── context/
│   └── AuthContext.jsx    # User state & login logic
├── hooks/
│   └── useAuth.js         # Hook to access auth context
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── StudentDashboard.jsx
│   ├── AdminPanel.jsx
│   └── Leaderboard.jsx
├── routes/
│   ├── AppRoutes.jsx      # Route definitions
│   └── ProtectedRoute.jsx # Role checking wrapper
└── utils/
    └── formatters.js      # Date/Number formatting
```

---

## 11. State Management Strategy

1. **Auth Context**:
   - Store `user` object and `token`.
   - Provide `login()`, `logout()`, `isAuthenticated` helpers.
   - Utilize `localStorage` for persistence.

2. **Fetching Data**:
   - Use `useEffect` or `React Query` to fetch dashboard data on mount.
   - Show loading skeletons while `isLoading` is true.

3. **Role Handling**:
   - Create a utility `hasRole(user, 'admin')`.
   - Use this to conditionally render Sidebar items (e.g., "Manage Departments" only visible to Admin).

---

## 12. Frontend Responsibilities Checklist

- [ ] Implement Login/Register pages with validation.
- [ ] Create Axios instance with Authorization header injection.
- [ ] Build global AuthProvider for state management.
- [ ] Create ProtectedRoute component for RBAC.
- [ ] Develop Student Dashboard with charts and summary cards.
- [ ] Implement "Link Platform" modal with validation.
- [ ] Build Admin Panel for department management.
- [ ] Create Leaderboard page with department filter.
- [ ] Handle 401 (Token Expiry) gracefully (Auto-logout).
- [ ] Add toast notifications for success/error messages.
- [ ] Ensure responsive design (Mobile/Tablet friendly).

---
