# Historio
_What Historio Is goes Here_

## File Structure
I hate having to think about where to put a new file, so here are the conventions this project follows:
- module.scss (CSS Module) files are co-located next to the component(s) or pages they affect
- As specified in `drizzle.config.ts`:
  - DB models/schema are all in ./models/schema/
  - Migrations are in ./models/migrations/
- DB queries are in ...