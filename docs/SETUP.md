
# ⚙️ CodeLens Backend Setup & Usage Guide

This guide explains how to set up, run, and explore the **CodeLens Backend**.

---

## 🏗️ Prerequisites

- **Python 3.11+**
- **PostgreSQL 14+**
- **Git**

---

## 📦 1. Installation

### Clone the Repository
```bash
git clone https://github.com/sangsaist/codelens.git
cd codelens/backend
```

### Create Virtual Environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🗄️ 2. Database Configuration

### create a `.env` file in the `backend/` directory (Optional but recommended)
Or update `app/config.py` directly (for MVP).

**Default DB Configuration (in `app/config.py`):**
```python
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
    'postgresql://postgres:password@localhost/codelens'
```

### Setup PostgreSQL
1. Open PostgreSQL shell:
   ```bash
   psql -U postgres
   ```
2. Create the database:
   ```sql
   CREATE DATABASE codelens;
   \q
   ```

---

## 🔄 3. Database Migrations

Initialize the database schema:

```bash
flask db upgrade
```

This creates all required tables: `users`, `roles`, `students`, `departments`, `platform_accounts`, `platform_snapshots`, etc.

---

## 🛠️ 4. Bootstrap Admin & Roles

**IMPORTANT**: We have a development-only bootstrap endpoint to set up the admin user and initial roles.

1. **Start the Server**:
   ```bash
   python run.py
   ```

2. **Run Bootstrap Command** (using Curl or Postman):
   ```bash
   curl -X POST http://127.0.0.1:5000/setup/bootstrap-admin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@codelens.com",
       "password": "adminSecret123",
       "full_name": "System Administrator"
     }'
   ```

   **Response**:
   ```json
   {
     "success": true,
     "message": "Admin bootstrapped successfully"
   }
   ```

   *This automatically creates `admin` and `student` roles if they don't exist.*

---

## 🚀 5. Run the Server

If not already running:

```bash
python run.py
```

Server runs at: **http://127.0.0.1:5000**

---

## 📚 6. API Modules & Key Endpoints

### 🔐 Authentication (`/auth`)
- **POST** `/auth/register` - Register a new student.
- **POST** `/auth/login` - Login and get JWT token (includes roles).

### 🎓 Academics (`/academics`)
- **GET** `/academics/departments` - List departments.
- **POST** `/academics/departments` - Create department (Admin).

### 👨‍🏫 Staff Management (`/staff`)
- **POST** `/staff/create` - Create HOD/Advisor/Counsellor (Admin/HOD).
- **GET** `/staff/my-team` - View hierarchical team members.

### 👩‍🎓 Students (`/students`)
- **PUT** `/students/<id>/assign-department` - Assign details.

### 🔗 Platforms (`/platforms`)
- **POST** `/platforms/link` - Link LeetCode/GitHub.
- **GET** `/platforms/my` - View linked accounts.

### 📸 Snapshots (`/snapshots`)
- **POST** `/snapshots` - Manual progress entry.
- **GET** `/snapshots/<account_id>` - View history.

### 📊 Analytics (`/analytics`)
- **GET** `/analytics/my-summary` - Student dashboard.
- **GET** `/analytics/institution-summary` - Admin/HOD view.
- **GET** `/analytics/counsellor/summary` - Counsellor workload view.

### ✅ Review (`/counsellor`)
- **GET** `/counsellor/pending-snapshots` - List items to review.
- **PUT** `/counsellor/snapshots/<id>/approve` - Approve data.
- **PUT** `/counsellor/snapshots/<id>/reject` - Reject data.

---

## � Project Structure

```text
app/
├── auth/           # Login, Register, Roles
├── staff/          # Staff Profiles (HOD, Advisor, Counsellor)
├── academics/      # Departments & Batches
├── students/       # Student Profiles
├── platforms/      # External Account Linking
├── snapshots/      # Progress Tracking
├── analytics/      # Data Aggregation
├── counsellor/     # Review Dashboards
├── review/         # Approval Logic
├── common/         # Utilities (RBAC, Responses)
├── setup/          # Bootstrapping Scripts
├── __init__.py     # App Factory
└── extensions.py   # Database & Plugins
```

---

## 🧪 Testing

You can use the provided `test_institutional_mvp.py` script to test the entire flow end-to-end.

```bash
python test_institutional_mvp.py
```
