# Historio

Historio is a web app to explore history through timelines and your favorite books. You can [read more about it here](https://learnbuildteach.substack.com/p/building-historio-episode-0).

The actual NextJS project is in `/historio`. `/static_landing` contains a static "under construction" landing page I put up while getting V1 off the ground. It's deployed with [Cloudflare pages](https://pages.cloudflare.com/) (which really couldn't be easier to work with, btw).

## File Structure

I hate having to think about where to put a new file, so here are the conventions this project follows:

- module.scss (CSS Module) files are co-located next to the component(s) or pages they affect
- As specified in `drizzle.config.ts`:
  - DB models/schema are all in `./db/schema/`
  - Migrations are in `./db/migrations/`
- DB queries are in `db/queries` (separated by the models they affect). These queries are re-used across actions and backend components.
- Non-UI business logic and helper methods in `/lib`
- UI business logic - server actions - go in `/actions` if they're re-used, otherwise they should be in the server component that is using them.
- Frontend components, layouts, server components, and context are in `/app`. [App Router](https://nextjs.org/docs/app) is used here, so functionality is roughly segmented by path.
  - React components that are re-used across different pages and functional areas are in the top-level `/components` directory.

## Conventions

As much as possible, conventions are codified with linting [as described here](https://dev.to/jordanahaines/just-use-this-nextjs-eslint-configuration-540).

- **Filenames, Folders, and Routes**: lowercase and hyphens for both files and folders
- **Components and Functions:**: PascalCase for component names

### Super Handy Classes

- `.font-title` for title (serif) font (Outfit)
- `.font-handwriting` for handwriting font (Gaegu)
- `.font-serif` for book-style title font (Rosarivo)

### Resources

- Debugging the backend is super annoying because there is no shell like with Django or Rails. The closest I've found - and what I use to do a deep[srcbook](https://github.com/srcbookdev/srcbook) for local shell-like stuff
