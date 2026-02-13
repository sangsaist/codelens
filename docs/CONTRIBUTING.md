# Contributing to CodeLens

Thank you for your interest in contributing to CodeLens.

This project aims to build a long-term, stable, and scalable analytics platform.  
To maintain quality and clarity, please follow the guidelines below.

---

## 1. Before You Start

- Read `README.md`
- Read `ARCHITECTURE.md`
- Review the `ROADMAP.md`
- Check existing issues before creating a new one

All contributions must align with the snapshot-driven architecture.

---

## 2. Branch Strategy

We use a simple branching model:

- `main` → Stable production-ready branch
- `dev` → Active development branch

### Workflow

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Submit a Pull Request to `dev`

Do not submit PRs directly to `main`.

---

## 3. Code Standards

### General Principles

- Keep modules independent
- Do not mix business logic inside routes/controllers
- Follow modular separation (auth, student, snapshot, etc.)
- Keep functions small and readable
- Write meaningful commit messages

### Naming

- Use clear and descriptive variable names
- Avoid abbreviations unless common
- Follow consistent folder structure

---

## 4. Database Changes

Database schema changes must:

- Be justified in the PR description
- Include migration files
- Not break snapshot-driven architecture

Major schema changes require discussion before implementation.

---

## 5. Adding New Features

Before implementing a new feature:

- Check if it aligns with the roadmap
- Open an issue describing:
  - Problem
  - Proposed solution
  - Impact on architecture

Large architectural changes must be discussed first.

---

## 6. Pull Request Guidelines

Each PR should:

- Have a clear title
- Explain what was changed
- Explain why it was changed
- Reference related issue (if applicable)

Small, focused PRs are preferred over large, complex ones.

---

## 7. Commit Message Style

Use clear commit messages:

Examples:

- `feat: add snapshot creation endpoint`
- `fix: correct leaderboard ranking calculation`
- `refactor: separate analytics service logic`
- `docs: update architecture documentation`

---

## 8. Code of Conduct

Be respectful and constructive.

We aim to build a healthy open-source community focused on learning and collaboration.

---

## 9. Questions?

If you are unsure about anything:

- Open an issue
- Ask for clarification before implementing large changes

Clear communication prevents future conflicts.
