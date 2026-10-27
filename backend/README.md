# Legacy Spring Boot backend

This source is retained temporarily for rollback and reference while the
Vercel + Supabase production migration is verified. It is not a production
service and must not be deployed as part of the target architecture.

The active frontend uses Supabase Edge Functions and does not call this API.
Database, mail, and JWT configuration must be supplied through local secure
environment variables if the legacy application is run for rollback testing.
