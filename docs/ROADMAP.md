# CodeLens Roadmap

This roadmap defines the structured evolution of CodeLens.

The goal is long-term stability, not feature explosion.

---

## v1.0 – Foundation Release

Focus: Core tracking and analytics engine.

Status: In Development

### Features

- JWT-based authentication
- Role-based access control (Admin, Counsellor, Student)
- Academic hierarchy:
  - Department
  - Batch
  - Class
- Student profile management
- Platform account linking (manual)
- Manual snapshot entry
- Weekly and monthly growth calculation
- Basic consistency scoring
- Class-level leaderboard
- Change request approval workflow
- Docker-based deployment

### Objective for v1.0

Deliver a stable, deployable system that colleges can run locally.

---

## v1.5 – Platform Sync Engine

Focus: Automation of performance tracking.

### Planned Features for v1.5

- Automated LeetCode integration
- Automated GitHub integration
- Background job processing
- Sync status tracking
- Snapshot auto-generation

### Objective for v1.5

Reduce manual data entry and improve reliability of metrics.

---

## v2.0 – Advanced Analytics

Focus: Intelligent student insights.

### Planned Features for v2.0

- Improved readiness scoring model
- Risk-level detection improvements
- Performance trend visualization APIs
- Department and batch-level analytics
- Comparative performance analysis

### Objective for v2.0

Transform CodeLens from tracking tool to insight engine.

---

## v2.5 – Performance Optimization

Focus: Scalability improvements.

### Planned Improvements

- Query optimization
- Index refinements
- Leaderboard performance enhancements
- Snapshot partitioning (if required)

### Objective for v2.5

Ensure smooth performance for thousands of students.

---

## v3.0 – Intelligent Insights

Focus: Predictive and AI-assisted analytics.

### Planned Features for v3.0

- Placement prediction modeling
- Smart mentoring suggestions
- Automated risk alerts
- Custom scoring models
- Configurable analytics weights

### Objective for v3.0

Enable data-driven student development at scale.

---

## Future Possibilities

These ideas may be explored based on community interest:

- Plugin architecture for new platforms
- REST API versioning
- Web-based admin dashboard
- Student-facing progress portal
- Mobile-friendly APIs
- Exportable performance reports

---

## Contribution Philosophy

Features must align with:

- Snapshot-driven architecture
- Modular backend structure
- Clear separation of concerns
- Long-term maintainability

Major architectural changes must be discussed before implementation.

---

## ✅ Completed

- Authentication system
- Role system
- Student profile auto-creation
- Clean migration setup

---

## 🚧 In Progress

- Academic structure (Departments, Batches, Classes)

---

## Roadmap Policy

- Each major version will maintain database stability.
- Breaking changes require version increment.
- Experimental features must not compromise core stability.
