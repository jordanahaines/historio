# Historio

_What Historio Is goes Here_

## File Structure

I hate having to think about where to put a new file, so here are the conventions this project follows:

- module.scss (CSS Module) files are co-located next to the component(s) or pages they affect
- As specified in `drizzle.config.ts`:
  - DB models/schema are all in ./models/schema/
  - Migrations are in ./models/migrations/
- DB queries are in `db/queries` (separated by the models they affect)
- Non-UI business logic goes in `/lib`
- UI business logic - server actions - go in `/actions` if they're re-used, otherwise they should be in the server component that is using them

## Conventions

- **Filenames, Folders, and Routes**: lowercase and hyphens for both files and folders
- **Components and Functions:**: PascalCase for component names

## Cheat Sheet

### Classes

- `.font-title` for title (serif) font
- `.vertical-rule` for 2px full height div

### Resources

- [srcbook](https://github.com/srcbookdev/srcbook) for local shell-like stuff
