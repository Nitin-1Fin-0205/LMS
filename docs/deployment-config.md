# LMS Deployment & Configuration Guide

## Bump.sh Integration
- **Doc Slug:** lms
- **Doc ID:** 87bf4d2a-1511-4e44-9fb8-384813593632

### Access Configuration
```yaml
documentation:
  slug: lms
  title: LMS API Documentation
  version: 1.0.0
  organization: 1Finance
  token: ${BUMP_TOKEN}
```

### Branch Management
```yaml
deployment:
  branches:
    - main     # Production deployment
    - develop  # Staging deployment
  auto_deploy: true
  notify_on_success: true
```

### UI Customization
```yaml
branding:
  logo: ./assets/logo.png
  favicon: ./assets/favicon.ico
  primary_color: "#3b82f6"
  syntax_highlighting_theme: "atom-one-dark"
```

### Access Management
- **Roles:**
  - Admin: Full access
  - Developer: Read/Write API docs
  - Viewer: Read-only access

### Integration Settings
- **Webhooks:** `/api/webhooks/bump`
- **CI/CD:** GitHub Actions
- **Authentication:** Bearer Token
