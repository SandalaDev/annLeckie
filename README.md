# Scrumtrulescent Planning Desk

A content planning app for the Scrumtrulescent magazine. Single-page HTML UI backed by a tiny Node/Express server with a JSON file as the database.

## Run it

```
npm install
npm start
```

Then open http://localhost:4321.

## What it does

- **Idea Board** — kanban pipeline (Ideas → Drafting → Scheduled → Published). Drag cards between columns to change status; click a card to edit.
- **Schedule** — month calendar. Click any day to plan a piece for that date; drag a post onto a day to reschedule it (this also promotes ideas/drafts to Scheduled).
- **Balance** — topic and content-type distribution charts, a Topic × Type matrix, a subjects cloud, and coverage notes that flag missing topics, over-concentration (any topic above 40% of the pipeline), unused formats, and an empty schedule.

Filters (search box, topic, type) apply across all three views. Keyboard: `n` opens New Piece, `Esc` closes the modal, `Ctrl+Enter` saves.

## Primitives

- **Topics:** Code, Tech, Opinion, Sports, TV, Movies
- **Content Types:** Article, Listicle, Review, News, Case Study, Interview
- **Statuses:** idea, drafting, scheduled, published

Each piece also carries free-form **subjects** (tags) and **notes** for tracking what you're writing about beyond the six topics.

## Storage

Everything lives in `data.json` next to the server (created with a few sample pieces on first run). Delete it to reset. Writes are atomic (temp file + rename).

## API

- `GET /api/posts` — all pieces
- `POST /api/posts` — create (`title`, `topic`, `contentType` required)
- `PUT /api/posts/:id` — partial update
- `DELETE /api/posts/:id` — remove
- `GET /api/meta` — the topic/type/status vocabularies
