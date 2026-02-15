# 🎓 CodeLens

<div align="center">

![CodeLens Banner](https://via.placeholder.com/1200x300/667eea/ffffff?text=CodeLens+-+Student+Coding+Performance+Analytics)

**Open-Source Student Coding Performance Analytics Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Flask 3.1.2](https://img.shields.io/badge/flask-3.1.2-green.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL 15](https://img.shields.io/badge/postgresql-15-blue.svg)](https://www.postgresql.org/)
[![React 18.2](https://img.shields.io/badge/react-18.2-61dafb.svg)](https://reactjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [Roadmap](#-roadmap)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Data Import](#-bulk-data-import)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

**CodeLens** is a comprehensive analytics platform designed for educational institutions to track, analyze, and improve students' coding proficiency through structured performance snapshots, data-driven insights, and dynamic leaderboards.

### 🎯 Mission

Transform manual, inconsistent coding performance tracking into a **structured, measurable, transparent system** that enables data-driven student development and mentoring at institutional scale.

### 🏛️ Deployment Model

- **Self-Hosted**: Each college deploys its own instance
- **Single-Tenant**: Complete data isolation per institution
- **Scalable**: Handles 500-5000+ students per deployment

---

## 💡 The Problem

Most educational institutions face critical challenges in coding education management:

<table>
<tr>
<td width="50%">

### ❌ **Current State**
- ✗ Manual spreadsheet tracking
- ✗ No historical performance data
- ✗ Inconsistent measurement across departments
- ✗ No visibility into student progress
- ✗ Time-consuming data collection
- ✗ No analytics-driven mentoring

</td>
<td width="50%">

### ✅ **With CodeLens**
- ✓ Automated performance tracking
- ✓ Complete historical timeline
- ✓ Standardized metrics institution-wide
- ✓ Real-time dashboards for all stakeholders
- ✓ One-time setup, continuous tracking
- ✓ Data-driven insights and recommendations

</td>
</tr>
</table>

---

## 🚀 Our Solution

### **Snapshot-Driven Architecture**

```mermaid
graph LR
    A[Student] --> B[Performance Snapshot]
    B --> C[Approval Workflow]
    C --> D[Analytics Engine]
    D --> E[Leaderboards]
    D --> F[Growth Metrics]
    D --> G[Insights]
    
    style A fill:#667eea
    style B fill:#764ba2
    style C fill:#f093fb
    style D fill:#4facfe
    style E fill:#00f2fe
    style F fill:#43e97b
    style G fill:#38f9d7
```

### **Core Philosophy**

> **Snapshots are the source of truth.**  
> Analytics are computed from snapshots.  
> Leaderboards are generated from analytics.

This separation ensures **scalability**, **clarity**, and **long-term maintainability**.

---

## ✨ Features

<div align="center">

| 🔐 Authentication | 👥 Role Management | 📊 Analytics | 🏆 Leaderboards |
|:-----------------:|:------------------:|:------------:|:---------------:|
| JWT-based auth | 5-tier hierarchy | Growth tracking | Class/Dept/Institution |
| Secure password hashing | Multi-role support | Weekly/Monthly metrics | Real-time rankings |
| Session management | Permission enforcement | Historical trends | Multi-platform aggregation |

</div>

### 🎓 **For Students**
- 📈 Track progress across multiple platforms (LeetCode, Codeforces, etc.)
- 📊 View personal analytics and growth metrics
- 🏅 See class/department rankings
- 📅 Historical performance timeline
- 🎯 Set goals and track improvement

### 👨‍🏫 **For Advisors**
- 👀 Monitor assigned students' progress
- ✅ Approve/reject performance snapshots
- 📉 Identify struggling students early
- 📧 Provide data-driven guidance
- 📋 Batch approval workflows

### 🧑‍💼 **For Counsellors**
- 🏢 Department-wide analytics
- 📊 Comparative performance analysis
- 🎯 Identify at-risk students
- 📈 Track cohort improvement
- 📑 Generate reports

### 👔 **For HODs**
- 🏛️ Department management
- 👥 Staff assignment
- 📊 Department-level insights
- 🎯 Strategic decision support
- 📈 Placement readiness tracking

### 🛡️ **For Admins**
- ⚙️ System configuration
- 👤 User management
- 🏢 Department setup
- 🔍 Institution-wide analytics
- 📊 Cross-department comparisons

---

## 🏗️ System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React SPA)                 │
│  Components • Pages • Routes • State Management • API Client │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST API
┌────────────────────────▼────────────────────────────────────┐
│                  Application Layer (Flask)                   │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │   Auth   │ Students │ Snapshots│ Analytics│  Admin   │  │
│  │ Blueprint│ Blueprint│ Blueprint│ Blueprint│ Blueprint│  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic • Authorization • Validation         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQLAlchemy ORM
┌────────────────────────▼────────────────────────────────────┐
│                  Database Layer (PostgreSQL)                 │
│  Users • Students • Departments • Snapshots • Analytics     │
└─────────────────────────────────────────────────────────────┘
```

### **Modular Blueprint Design**

```
backend/app/
├── 🔐 auth/           Authentication & authorization
├── 👨‍🎓 students/      Student profile management
├── 🏢 academics/      Department hierarchy
├── 🔗 platforms/      Coding platform integration
├── 📸 snapshots/      Performance data capture
├── 📊 analytics/      Metrics computation
├── 👨‍🏫 advisor/       Advisor operations
├── 🧑‍💼 counsellor/    Counsellor operations
├── 👔 admin/          System administration
├── ✅ review/         Approval workflow
├── 👥 staff/          Staff management
└── 🛠️ common/         Shared utilities
```

### **Data Flow**

```mermaid
sequenceDiagram
    participant S as Student
    participant P as Platform API
    participant A as Advisor/Counsellor
    participant D as Database
    participant L as Leaderboard

    S->>P: Submit Snapshot
    P->>D: Store (status: pending)
    A->>D: Review Snapshot
    D->>D: Update (status: approved)
    D->>L: Trigger Analytics
    L->>D: Compute Rankings
    D->>S: Display Analytics
```

---

## 🛠️ Technology Stack

<div align="center">

### **Backend**

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### **Frontend**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### **DevOps**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>

### **Detailed Stack**

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Python | 3.10+ | Server-side language |
| **Framework** | Flask | 3.1.2 | Web application framework |
| **Database** | PostgreSQL | 15 | Relational data storage |
| **ORM** | SQLAlchemy | 2.0.46 | Database abstraction |
| **Migration** | Alembic | 1.18.4 | Schema versioning |
| **Authentication** | Flask-JWT-Extended | 4.7.1 | JWT token management |
| **Password Security** | bcrypt | 4.0.1 | Password hashing |
| **CORS** | Flask-CORS | 6.0.2 | Cross-origin requests |
| **Frontend Framework** | React | 18.2.0 | UI library |
| **Build Tool** | Vite | 5.1.4 | Fast bundler |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS |
| **Charts** | Recharts | 2.12.0 | Data visualization |

---

## 🚀 Getting Started

### **Prerequisites**

```bash
# Required
✓ Docker Desktop (20.10+)
✓ Docker Compose (2.0+)
✓ Git

# Optional (for local development)
✓ Python 3.10+
✓ Node.js 18+
```

### **Quick Start (5 Minutes)**

```bash
# 1. Clone the repository
git clone https://github.com/sangsaist/codelens.git
cd codelens

# 2. Start the services
docker-compose up --build

# 3. Initialize database (in another terminal)
docker-compose exec backend flask db upgrade

# 4. Seed default roles
docker-compose exec backend flask shell
>>> from app.auth.seed import seed_roles
>>> seed_roles()
>>> exit()

# 5. Access the application
# Backend API: http://localhost:5000
# Health Check: http://localhost:5000/health
```

### **Development Setup**

<details>
<summary><strong>📦 Backend Setup</strong></summary>

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codelens"
export JWT_SECRET_KEY="your-secret-key-here"
export FLASK_APP=run.py
export FLASK_ENV=development

# Initialize database
flask db upgrade

# Seed roles
python -c "from app import create_app; from app.auth.seed import seed_roles; app = create_app(); app.app_context().push(); seed_roles()"

# Run development server
flask run
```

</details>

<details>
<summary><strong>🎨 Frontend Setup</strong></summary>

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
echo "VITE_API_URL=http://localhost:5000" > .env

# Run development server
npm run dev

# Build for production
npm run build
```

</details>

---

## 📥 Bulk Data Import

**Problem:** Manual entry of 1000+ students is impractical.  
**Solution:** Automated CSV import with test data generation.

### **Step 1: Generate Test Data**

```bash
cd backend

# Install faker library
pip install faker

# Generate 900+ users with realistic data
python generate_all_data.py
```

**Output:**
```
✅ Generated 6 departments
✅ Generated 900 students
✅ Generated 6 HODs
✅ Generated 12 counsellors
✅ Generated 30 advisors
✅ Generated 1 admin
─────────────────────────
TOTAL: 949 users
```

### **Step 2: Import to Database**

```bash
python seed_data.py
```

### **Step 3: Login & Test**

```
Admin:       admin@college.edu / Admin@12345
HOD (CSE):   hod.cse@college.edu / Hod@12345
Counsellor:  counsellor.cse1@college.edu / Counsel@123
Student:     (see data/students.csv) / Student@123
```

### **Custom Data Import**

Create your own CSV files using these templates:

<details>
<summary><strong>📋 CSV Templates</strong></summary>

**departments.csv**
```csv
name,code
Computer Science and Engineering,CSE
Electronics and Communication Engineering,ECE
```

**students.csv**
```csv
email,full_name,register_number,department_code,admission_year,phone,gender,password
alice@college.edu,Alice Johnson,CS2024001,CSE,2024,9876543210,Female,Student@123
bob@college.edu,Bob Smith,CS2024002,CSE,2024,9876543211,Male,Student@123
```

**hods.csv**
```csv
email,full_name,department_code,password
hod.cse@college.edu,Dr. John Doe,CSE,Hod@12345
```

</details>

**Import Custom Data:**
```bash
python seed_data.py
```

---

## 📚 API Documentation

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user | No |
| `POST` | `/auth/login` | Login and receive JWT | No |
| `GET` | `/auth/me` | Get current user info | Yes |

### **Student Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/students/profile` | Get own profile | Student+ |
| `PUT` | `/students/profile` | Update profile | Student+ |
| `GET` | `/students/<id>` | Get student by ID | Advisor+ |

### **Snapshot Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/snapshots/submit` | Submit performance snapshot | Student+ |
| `GET` | `/snapshots/my-snapshots` | Get own snapshots | Student+ |
| `GET` | `/snapshots/pending` | Get pending reviews | Advisor+ |

### **Review Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/review/snapshot/<id>` | Approve/reject snapshot | Advisor+ |
| `GET` | `/review/pending` | Get review queue | Advisor+ |

### **Analytics Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/analytics/student/<id>` | Student analytics | Student+ |
| `GET` | `/analytics/department/<id>` | Department analytics | HOD+ |

### **Leaderboard Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/leaderboard/class/<id>` | Class leaderboard | Student+ |
| `GET` | `/leaderboard/department/<id>` | Department leaderboard | Student+ |

<details>
<summary><strong>📖 API Request/Response Examples</strong></summary>

**Register User:**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@college.edu",
    "password": "SecurePass@123",
    "full_name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@college.edu",
    "password": "SecurePass@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@college.edu",
      "full_name": "John Doe",
      "roles": ["student"]
    }
  }
}
```

</details>

---

## 🔒 Security

### **Security Features**

- ✅ **JWT Authentication**: Stateless, token-based authentication
- ✅ **Password Hashing**: PBKDF2-SHA256 with salt (bcrypt backend)
- ✅ **Role-Based Access Control**: 5-tier hierarchical permissions
- ✅ **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
- ✅ **CORS Protection**: Configurable origin restrictions
- ✅ **Input Validation**: Multi-layer validation strategy

### **Security Checklist for Production**

<details>
<summary><strong>⚠️ Critical Security Steps</strong></summary>

- [ ] **Change JWT Secret**: Generate cryptographically random key
  ```bash
  export JWT_SECRET_KEY=$(openssl rand -hex 32)
  ```

- [ ] **Restrict CORS**: Limit to institution domain
  ```python
  CORS(app, origins=["https://codelens.college.edu"])
  ```

- [ ] **Enable HTTPS**: Use TLS 1.2+ with valid certificate

- [ ] **Implement Rate Limiting**: Prevent brute force attacks
  ```bash
  pip install flask-limiter
  ```

- [ ] **Sanitize Error Messages**: Don't expose internal details

- [ ] **Add Password Policy**: Enforce complexity requirements

- [ ] **Enable Audit Logging**: Track sensitive operations

- [ ] **Database User Permissions**: Limit to necessary operations

- [ ] **Regular Security Updates**: Keep dependencies patched

</details>

### **Known Security Considerations (v1.0 MVP)**

| Issue | Status | Production Mitigation |
|-------|--------|----------------------|
| Hardcoded JWT secret in docker-compose | 🔴 Dev Only | Use environment variables |
| No rate limiting | 🔴 Missing | Implement Flask-Limiter |
| CORS allows all origins | 🔴 Dev Only | Restrict to domain |
| No password complexity rules | 🟡 Missing | Add validation |
| No email verification | 🟡 Missing | Implement in v1.5 |
| JWT tokens in localStorage | 🟢 Acceptable | XSS prevention via CSP |

---

## 🧪 Testing

### **Run Tests**

```bash
cd backend

# Run all tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_snapshot_approval.py

# Run with coverage
python -m pytest --cov=app tests/
```

### **Current Test Coverage**

```
Module                Coverage
────────────────────────────
app.auth              ⬜⬜⬜⬜⬜ 5%
app.students          ⬜⬜⬜⬜⬜ 0%
app.snapshots         ⬜⬜⬜⬜⬛ 15%
app.analytics         ⬜⬜⬜⬜⬜ 0%
────────────────────────────
Overall               ⬜⬜⬜⬜⬜ 5%
```

**Note:** Testing infrastructure is minimal in v1.0 MVP. Comprehensive test suite planned for v1.5.

---

## 🚢 Deployment

### **Docker Deployment (Recommended)**

```bash
# Production docker-compose configuration
version: '3.9'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: codelens
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/codelens
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      FLASK_ENV: production
    depends_on:
      - db
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: always

volumes:
  pgdata:
```

### **Environment Variables**

Create `.env` file:
```bash
# Database
DB_USER=codelens_user
DB_PASSWORD=<strong-password>

# Security
JWT_SECRET_KEY=<cryptographic-random-key>

# Application
FLASK_ENV=production
ALLOWED_ORIGINS=https://codelens.college.edu
```

### **Production Checklist**

- [ ] Set strong database password
- [ ] Generate cryptographic JWT secret
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Configure backup strategy
- [ ] Enable monitoring/logging
- [ ] Set up health checks
- [ ] Configure auto-restart policies
- [ ] Document recovery procedures

---

## 🗺️ Roadmap

<div align="center">

### **Version History & Future Plans**

</div>

```mermaid
gantt
    title CodeLens Development Roadmap
    dateFormat  YYYY-MM
    section v1.0
    Foundation Release           :done, 2024-01, 2024-06
    section v1.5
    Platform Sync Engine         :active, 2024-07, 2024-12
    section v2.0
    Advanced Analytics           :2025-01, 2025-06
    section v2.5
    Performance Optimization     :2025-07, 2025-12
    section v3.0
    Intelligent Insights         :2026-01, 2026-06
```

### **v1.0 – Foundation Release** ✅ (In Development)

<table>
<tr><td>

**Completed:**
- ✅ JWT Authentication
- ✅ Role-based access control
- ✅ Academic hierarchy
- ✅ Student profile management
- ✅ Manual snapshot entry
- ✅ Approval workflow
- ✅ Basic analytics (growth metrics)
- ✅ Leaderboard generation
- ✅ Docker deployment

</td><td>

**In Progress:**
- 🚧 Frontend integration
- 🚧 Email notifications
- 🚧 Advanced reporting
- 🚧 Historical data migration

</td></tr>
</table>

### **v1.5 – Platform Sync Engine** 🔄 (Planned: Q3 2024)

- 🔄 Automated LeetCode integration
- 🔄 Automated GitHub integration
- 🔄 Background job processing (Celery)
- 🔄 Sync status tracking
- 🔄 Snapshot auto-generation
- 🔄 Bulk approval interface

### **v2.0 – Advanced Analytics** 📊 (Planned: Q1 2025)

- 📊 Readiness scoring model
- 📊 Risk-level detection
- 📊 Performance trend visualization
- 📊 Department/batch analytics
- 📊 Comparative analysis
- 📊 Custom report builder

### **v2.5 – Performance Optimization** ⚡ (Planned: Q3 2025)

- ⚡ Query optimization
- ⚡ Materialized views
- ⚡ Redis caching layer
- ⚡ Database partitioning
- ⚡ Read replicas
- ⚡ CDN integration

### **v3.0 – Intelligent Insights** 🤖 (Planned: Q1 2026)

- 🤖 Placement prediction modeling
- 🤖 Smart mentoring suggestions
- 🤖 Automated risk alerts
- 🤖 Custom scoring models
- 🤖 AI-powered recommendations
- 🤖 Predictive analytics

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug reports, feature requests, or code contributions, your input helps make CodeLens better.

### **How to Contribute**

1. **Fork the Repository**
   ```bash
   git clone https://github.com/sangsaist/codelens.git
   cd codelens
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Submit a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure CI/CD checks pass

### **Contribution Guidelines**

- 📖 Read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines
- 🐛 Report bugs via [GitHub Issues](https://github.com/sangsaist/codelens/issues)
- 💡 Suggest features via [Discussions](https://github.com/sangsaist/codelens/discussions)
- 📚 Improve documentation
- 🧪 Add test coverage

### **Code of Conduct**

We are committed to providing a welcoming and inclusive environment. Please be respectful and considerate in all interactions.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CodeLens Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 💬 Support

### **Documentation**

- 📖 [Architecture Documentation](docs/ARCHITECTURE.md)
- 🚀 [Setup Guide](docs/SETUP.md)
- 🎨 [Frontend Guide](docs/FRONTEND.md)
- 🗺️ [Roadmap](docs/ROADMAP.md)

### **Get Help**

- 💬 [GitHub Discussions](https://github.com/sangsaist/codelens/discussions) - Ask questions
- 🐛 [GitHub Issues](https://github.com/sangsaist/codelens/issues) - Report bugs
- 📧 Email: support@codelens.dev (Coming Soon)

### **Community**

- 🌟 Star this repo to show support
- 👀 Watch for updates
- 🍴 Fork for your institution

---

## 🎯 Project Status

<div align="center">

### **Current Status: MVP - 70% Complete**

| Component | Status | Progress |
|-----------|--------|----------|
| Backend API | ✅ Functional | ████████░░ 80% |
| Database Schema | ✅ Complete | ██████████ 100% |
| Authentication | ✅ Production Ready | ██████████ 100% |
| Authorization | ✅ Production Ready | ██████████ 100% |
| Analytics Engine | ✅ Functional | ███████░░░ 70% |
| Frontend Integration | 🚧 In Progress | ████░░░░░░ 40% |
| Testing | 🚧 Limited | █░░░░░░░░░ 10% |
| Documentation | ✅ Comprehensive | ████████░░ 80% |

**Overall: 70% Complete - Production Deployment Ready with Hardening**

</div>

---

## 🌟 Acknowledgments

Special thanks to all contributors who have helped shape CodeLens:

- Educational institutions providing feedback
- Open-source community for excellent libraries
- Early adopters testing the platform
- Contributors submitting PRs and issues

---

## 📊 Project Statistics

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/sangsaist/codelens?style=social)
![GitHub forks](https://img.shields.io/github/forks/sangsaist/codelens?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/sangsaist/codelens?style=social)

![GitHub issues](https://img.shields.io/github/issues/sangsaist/codelens)
![GitHub pull requests](https://img.shields.io/github/issues-pr/sangsaist/codelens)
![GitHub last commit](https://img.shields.io/github/last-commit/sangsaist/codelens)
![GitHub repo size](https://img.shields.io/github/repo-size/sangsaist/codelens)

</div>

---

<div align="center">

### **Built with ❤️ for Education**

**Making Coding Education Data-Driven, One Institution at a Time**

[⬆ Back to Top](#-codelens)

---

<sub>© 2024 CodeLens. Open Source Project under MIT License.</sub>

</div>
