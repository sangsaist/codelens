# CodeLens

CodeLens is an open-source student coding performance analytics platform designed for colleges.

It helps institutions track, analyze, and improve students’ coding progress using structured performance snapshots, growth analytics, and dynamic leaderboards.

Each college can deploy its own instance.

---

## 🎯 Why CodeLens?

Most colleges track coding performance manually or inconsistently.

Problems:

- No structured growth tracking
- No historical performance insights
- No analytics-driven mentoring
- No centralized leaderboard system
- No transparency in student improvement

CodeLens solves this by introducing a time-series snapshot engine that enables measurable, consistent progress tracking.

---

## 🧠 Core Philosophy

CodeLens is built around a simple but powerful model:

Student  
→ Snapshots  
→ Analytics  
→ Leaderboards  

Snapshots are the source of truth.  
Analytics are computed from snapshots.  
Leaderboards are generated from analytics.

This separation ensures scalability, clarity, and long-term maintainability.

---

## 🏗 Architecture Overview

- Snapshot-based performance tracking
- Modular backend design
- Role-based access control
- Academic hierarchy modeling
- Change approval workflow
- Audit logging support

The system is designed for single-college deployment but can scale to thousands of students.

---

## 🔗 Available API Endpoints

| Method | Endpoint          | Description               |
|--------|-------------------|---------------------------|
| POST   | /auth/register    | Register new user         |
| POST   | /auth/login       | Login and receive JWT     |
| GET    | /protected        | JWT protected route       |
| GET    | /health           | Health check              |

---

## 🚀 Features (v1.0 – Foundation Release)

- JWT Authentication
- Role-based access (Admin, Counsellor, Student)
- Academic structure:
  - Department
  - Batch
  - Class
- Student profile management
- Manual performance snapshot entry
- Weekly & monthly growth analytics
- Class-level leaderboards
- Change request approval workflow
- Docker-based deployment

---

## ✅ Current MVP Status

- User registration & login (JWT based)
- Role system (admin, student, counsellor)
- Automatic student profile creation
- PostgreSQL integration
- Database migrations using Flask-Migrate
- Dev branch workflow

## 🗄️ Current Database Tables

- users
- roles
- user_roles
- students

---

## 🛠 Tech Stack

- Python (Flask)
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Docker

---

## 🐳 Quick Start (Coming Soon)

```bash
docker-compose up --build
