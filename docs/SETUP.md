
# ⚙️ CodeLens Backend Setup Guide

This guide explains how to run the CodeLens backend locally.

---

## 🧱 Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Git

---

## 📦 1. Clone Repository

```bash
git clone <your-repo-url>
cd codelens/backend
````

---

## 🐍 2. Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🗄️ 3. Setup PostgreSQL

Open PostgreSQL:

```bash
psql -U postgres
```

Create database:

```sql
CREATE DATABASE codelens;
\q
```

---

## ⚙️ 4. Configure Database

Edit:

```text
backend/app/config.py
```

Set your database URL:

```text
postgresql://postgres:<your_password>@localhost:5432/codelens
```

---

## 🔄 5. Run Migrations

Inside backend folder:

```bash
flask db upgrade
```

This creates required tables:

- users
- roles
- user_roles
- students

---

## 🌱 6. Seed Default Roles

Open Python shell:

```bash
python
```

```python
from app import create_app
from app.auth.seed import seed_roles

app = create_app()

with app.app_context():
    seed_roles()

exit()
```

This seeds:

- admin
- student
- counsellor

---

## 🚀 7. Run Server

```bash
python run.py
```

Server runs at:
<http://127.0.0.1:5000>

---

## 🧪 Test API

Register user:
POST /auth/register

Login:
POST /auth/login

---

## 🧠 Current MVP Features

- User authentication (JWT)
- Role-based system
- Automatic student profile creation
- PostgreSQL with migrations

---

## 🚧 Coming Next

- Academic structure (Departments, Batches, Classes)
- Platform accounts (LeetCode, GitHub)
- Snapshot engine
- Analytics & Leaderboards
