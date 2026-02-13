# CodeLens Architecture

## 1. Overview

CodeLens is designed as a modular, snapshot-driven analytics system for tracking student coding performance.

The architecture emphasizes:

- Clear data separation
- Time-series tracking
- Scalable growth analytics
- Maintainable modular design

This document explains the core architectural principles of the system.

---

## 2. Core Philosophy

CodeLens is built around a time-series performance model.

The fundamental flow is:

Student  
→ Snapshot  
→ Analytics  
→ Leaderboard  

Each layer has a clearly defined responsibility.

---

## 3. Snapshot-Driven Design

### Why Snapshots?

Instead of storing only current performance metrics, CodeLens stores periodic snapshots of student performance.

A snapshot contains:

- Total solved problems
- Difficulty breakdown
- Contest rating
- GitHub metrics
- Snapshot date

Snapshots are the **source of truth**.

This allows:

- Weekly growth tracking
- Monthly growth tracking
- Consistency analysis
- Historical comparison
- Trend visualization

Snapshots are never overwritten.
They are append-only records.

---

## 4. Analytics Layer

The analytics layer computes derived insights from snapshots.

Examples:

- Weekly growth
- Monthly growth
- Consistency score
- Placement readiness score
- Risk level classification

Analytics data is stored separately from raw snapshots.

This ensures:

- Clean separation of raw data and computed data
- Faster leaderboard generation
- Reduced recalculation overhead

---

## 5. Leaderboard System

Leaderboards are generated based on analytics or snapshot metrics.

Scope examples:

- Class-level leaderboard
- Department-level leaderboard
- Batch-level leaderboard

Leaderboards are generated periodically or on demand.

They do not store raw student performance — only ranking data.

---

## 6. Academic Hierarchy

CodeLens models a real college structure:

Department  
→ Batch  
→ Class  
→ Student  

Each student belongs to one active class at a time.

This hierarchy allows:

- Scoped leaderboards
- Structured filtering
- Academic reporting

---

## 7. Role-Based Access Control

System roles include:

- Admin
- Counsellor
- Student

Role-based access ensures:

- Controlled data access
- Secure operations
- Structured workflow management

---

## 8. Change Approval Workflow

Students cannot directly modify critical data.

Instead:

1. Student submits change request
2. Counsellor reviews request
3. Approval or rejection recorded
4. Change history maintained

This ensures auditability and accountability.

---

## 9. Modular Backend Structure

The backend is organized into independent modules:

- auth
- academic
- student
- platform
- snapshot
- analytics
- leaderboard
- placement
- approval
- audit

Each module contains:

- Routes (API endpoints)
- Services (business logic)
- Models (database layer)
- Schemas/DTOs (data validation)

This separation ensures long-term maintainability.

---

## 10. Deployment Model

CodeLens is designed for single-college deployment.

Each installation runs:

- A backend service
- A PostgreSQL database

No multi-tenant architecture is used in the core design.

---

## 11. Scalability Strategy

CodeLens scales through:

- Proper database indexing
- Snapshot-based time-series storage
- Modular analytics computation
- Structured leaderboard generation

The system is designed to handle thousands of students within a single deployment.

---

## 12. Design Principles

CodeLens follows these principles:

- Snapshots are immutable.
- Analytics is derived, not primary data.
- Modules must remain loosely coupled.
- No business logic inside controllers.
- Database schema stability for each major version.
- Documentation-driven development.

---

## 13. Future Extension Strategy

Future features will extend the system without breaking the core model:

- Automated platform sync
- Advanced analytics models
- Predictive placement scoring
- AI-based risk detection

All extensions must respect the snapshot-driven architecture.
