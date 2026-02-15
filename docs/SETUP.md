
# ⚙️ CodeLens Setup & Usage Guide

This guide explains how to set up, run, and explore **CodeLens**. Choose between **Docker** (recommended) or **Manual** setup.

---

## 🏗️ Prerequisites

### For Docker Setup (Recommended)
- **Docker Desktop** (v4.0+)
- **Docker Compose** (v2.0+)
- **Git**

### For Manual Setup
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **PostgreSQL 14+**
- **Git**

---

# � Part 1: Docker Setup (Recommended)

The easiest way to get CodeLens running. One command starts everything — backend, frontend, database, and Redis.

## 1. Clone the Repository

```bash
git clone https://github.com/sangsaist/codelens.git
cd codelens
```

## 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=codelens

# Application Security (generate a strong key for production)
JWT_SECRET_KEY=your-super-secret-key-change-this

# Frontend
VITE_API_URL=http://localhost:5000
```

> ⚠️ **Security**: Never commit the `.env` file. It's already in `.gitignore`.

## 3. Start the Application

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

This starts 4 services:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React + Vite dev server |
| **Backend** | http://localhost:5000 | Flask API server |
| **Database** | localhost:5432 | PostgreSQL 15 |
| **Redis** | localhost:6379 | Cache (future use) |

## 4. Run Database Migrations

```bash
docker-compose -f docker-compose.dev.yml exec backend flask db upgrade
```

## 5. Seed Roles

```bash
docker-compose -f docker-compose.dev.yml exec backend python -c \
  "from app import create_app; from app.auth.seed import seed_roles; app = create_app(); app.app_context().push(); seed_roles()"
```

This creates the default roles: `admin`, `student`, `counsellor`, `hod`, `advisor`.

## 6. Generate & Import Test Data

```bash
# Generate fake data (students, HODs, advisors, counsellors, admin)
docker-compose -f docker-compose.dev.yml exec backend python scripts/generate_all_data.py

# Import the generated data into the database
docker-compose -f docker-compose.dev.yml exec backend python scripts/seed_data.py
```

> ⏳ The seed process imports ~900 students and may take 3–5 minutes.

## 7. Access the Application

Open http://localhost:5173 and log in with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@college.edu` | `Admin@12345` |
| **HOD (CSE)** | `hod.cse@college.edu` | `Hod@12345` |
| **Counsellor** | Check `backend/data/counsellors.csv` | `Counsel@123` |
| **Advisor** | Check `backend/data/advisors.csv` | `Advisor@123` |
| **Student** | Check `backend/data/students.csv` | `Student@123` |

> 📝 Since Faker generates random data, check the CSV files in `backend/data/` for exact emails.

## Docker Useful Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove all data (fresh start)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild after code changes
docker-compose -f docker-compose.dev.yml up -d --build

# Access backend shell
docker-compose -f docker-compose.dev.yml exec backend bash

# Access database shell
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d codelens
```

## Production Deployment (Docker)

For production, use the production compose file:

```bash
# 1. Update .env with production values (strong passwords, real JWT secret)
# 2. Place SSL certificates in nginx/ssl/
# 3. Start production stack
docker-compose -f docker-compose.prod.yml up -d --build
```

The production setup includes:
- Nginx reverse proxy with SSL termination
- Security headers
- Optimized Docker images (multi-stage builds)
- Non-root container users

---

# 🖥️ Part 2: Manual Setup (Without Docker)

If you prefer to run services directly on your machine.

## 1. Clone the Repository

```bash
git clone https://github.com/sangsaist/codelens.git
cd codelens
```

## 2. Backend Setup

### Create Virtual Environment

```bash
cd backend

# Create venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Database

**Option A: Using environment variable**
```bash
# Windows (PowerShell)
$env:DATABASE_URL = "postgresql://postgres:password@localhost/codelens"

# Mac/Linux
export DATABASE_URL="postgresql://postgres:password@localhost/codelens"
```

**Option B: Edit `app/config.py` directly**
```python
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
    'postgresql://postgres:your_password@localhost/codelens'
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

### Run Database Migrations

```bash
flask db upgrade
```

This creates all required tables: `users`, `roles`, `students`, `departments`, `platform_accounts`, `platform_snapshots`, `staff_profiles`, etc.

### Seed Roles & Data

```bash
# Start the server first
python run.py

# In a new terminal (with venv activated):

# Seed roles
python -c "from app import create_app; from app.auth.seed import seed_roles; app = create_app(); app.app_context().push(); seed_roles()"

# Generate test data
python scripts/generate_all_data.py

# Import test data into database
python scripts/seed_data.py
```

### Start the Backend Server

```bash
python run.py
```

Server runs at: **http://127.0.0.1:5000**

## 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

> **Note**: The frontend expects the backend API at `http://localhost:5000`. This is configured in `src/api/axios.js`.

## 4. Access the Application

Open http://localhost:5173 and use the same credentials listed in the Docker section above.

---

# 📚 API Modules & Key Endpoints

### 🔐 Authentication (`/auth`)
- **POST** `/auth/register` – Register a new student
- **POST** `/auth/login` – Login and get JWT token (includes roles)

### 🎓 Academics (`/academics`)
- **GET** `/academics/departments` – List departments
- **POST** `/academics/departments` – Create department (Admin)

### 👨‍🏫 Staff Management (`/staff`)
- **POST** `/staff/create` – Create HOD/Advisor/Counsellor (Admin/HOD)
- **GET** `/staff/my-team` – View hierarchical team members

### 👩‍🎓 Students (`/students`)
- **PUT** `/students/<id>/assign-department` – Assign details

### 🔗 Platforms (`/platforms`)
- **POST** `/platforms/link` – Link LeetCode/GitHub
- **GET** `/platforms/my` – View linked accounts

### 📸 Snapshots (`/snapshots`)
- **POST** `/snapshots` – Manual progress entry
- **GET** `/snapshots/<account_id>` – View history

### 📊 Analytics (`/analytics`)
- **GET** `/analytics/my-summary` – Student dashboard
- **GET** `/analytics/institution-summary` – Admin/HOD view
- **GET** `/analytics/counsellor/summary` – Counsellor workload view

### ✅ Review (`/counsellor`)
- **GET** `/counsellor/pending-snapshots` – List items to review
- **PUT** `/counsellor/snapshots/<id>/approve` – Approve data
- **PUT** `/counsellor/snapshots/<id>/reject` – Reject data

---

# 📁 Project Structure

```text
codelens/
├── backend/
│   ├── app/
│   │   ├── auth/           # Login, Register, Roles
│   │   ├── staff/          # Staff Profiles (HOD, Advisor, Counsellor)
│   │   ├── academics/      # Departments & Batches
│   │   ├── students/       # Student Profiles
│   │   ├── platforms/      # External Account Linking
│   │   ├── snapshots/      # Progress Tracking
│   │   ├── analytics/      # Data Aggregation
│   │   ├── counsellor/     # Review Dashboards
│   │   ├── review/         # Approval Logic
│   │   ├── common/         # Utilities (RBAC, Responses)
│   │   ├── setup/          # Bootstrapping Scripts
│   │   ├── __init__.py     # App Factory
│   │   └── extensions.py   # Database & Plugins
│   ├── scripts/            # Data generation & seeding
│   ├── migrations/         # Alembic DB migrations
│   ├── data/               # Generated CSV test data
│   ├── Dockerfile          # Backend container
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API clients
│   │   ├── context/        # React context (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route definitions
│   │   └── utils/          # Utility functions
│   ├── Dockerfile          # Frontend container
│   ├── nginx.conf          # Nginx config (production)
│   └── package.json        # Node dependencies
├── nginx/
│   ├── nginx.conf          # Root reverse proxy (production)
│   └── ssl/                # SSL certificates (not committed)
├── docker-compose.dev.yml  # Development environment
├── docker-compose.prod.yml # Production environment
├── .env.example            # Environment template
└── .gitignore              # Git ignore rules
```

---

# 🧪 Testing

You can use the provided test script to verify the entire flow end-to-end:

```bash
# Docker
docker-compose -f docker-compose.dev.yml exec backend python test_institutional_mvp.py

# Manual
cd backend
python test_institutional_mvp.py
```
