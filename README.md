# Smart Product Search

A typo-tolerant, relevance-ranked product search with a mega menu UI.
Built on an Nx monorepo — React 19 + Vite frontend, Express 5 backend, MongoDB.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Nx 22 |
| Frontend | React 19, Vite, React Router v7, Tailwind CSS |
| Backend | Express 5, TypeScript |
| Database | MongoDB via Mongoose |
| Package Manager | pnpm |

---

## Local Setup

### Prerequisites

- Node.js 22+
- pnpm (`npm install -g pnpm`)
- MongoDB — local instance or a MongoDB Atlas URI

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

The default dev config points to MongoDB Atlas. To use a local instance, update `MONGODB_URI` in `apps/api/.env.development`:

```env
MONGODB_URI=mongodb://localhost:27017/smart-product-search
```

### 3. Seed the database

```bash
pnpm db:seed
```

This imports all 50 products from `apps/api/src/database/products.json` into MongoDB.
The script uses `bulkWrite` upserts — safe to run multiple times without duplicating data.

### 4. Run the apps

In two separate terminals:

```bash
pnpm dev:api   # Express API → http://localhost:8000
pnpm dev:web   # React frontend → http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/search?q=<query>&limit=<n>` | Smart product search |

### Search response shape

```ts
{
  query: string;
  total: number;
  categories: {
    name: string;       // e.g. "Electronics"
    count: number;      // total hits in this category before the per-column cap
    products: {
      id: string;
      name: string;
      category: string;
      tags: string[];
      price: number;
      stock: number;
      rating: number;
      score: number;    // computed relevance (0–1)
      highlight: string; // matched sentence from description
    }[];
  }[];
}
```

Results are grouped by category (max 5 columns), with up to 3 products per column in the mega menu.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev:web` | Frontend dev server (port 3000) |
| `pnpm dev:api` | Backend dev server (port 8000) |
| `pnpm db:seed` | Seed MongoDB with 50 products |
| `pnpm build:all` | Production build (both apps) |
| `pnpm lint` | Lint all apps |

---

## How Search Works

### Typo tolerance — two-pass pipeline

**Pass 1 — MongoDB `$text` index**
Every query first hits the weighted text index:

```
name ×10 · tags ×5 · category ×3 · description ×1
```

MongoDB's text search handles stemming (e.g. "running" matches "run") but not typos.

**Pass 2 — Levenshtein fallback**
If Pass 1 returns zero results, every product is scored against the query tokens using
Levenshtein edit distance. Candidates with distance ≤ 2 are returned, so "samsng" (dist 1
from "samsung"), "wirelss" (dist 1 from "wireless"), and "mernio" (dist 2 from "merino")
all surface relevant results.

The fuzzy score is inverted from distance: dist 0 → 1.0, dist 1 → 0.6, dist 2 → 0.2.

### Ranking — multi-signal score

```
score = textScore × 0.50
      + (rating / 5) × 0.25
      + inStock × 0.15
      + nameMatchBonus × 0.10
```

| Signal | Weight | Rationale |
|---|---|---|
| MongoDB text score (normalised) | 0.50 | Primary relevance — field weights baked into index |
| Rating (0–1) | 0.25 | Users prefer highly-rated products |
| Stock availability | 0.15 | In-stock items are more immediately useful |
| Name prefix/exact match bonus | 0.10 | Rewards very close name matches |

Results below score 0.05 are discarded to cut noise.

### Mega menu API response

Results are grouped by category after scoring, with two caps applied:
- Max **5 category columns** shown
- Max **3 products per column** in the dropdown

The full `count` per category is returned so the UI can show "+N more". Each product
includes a `highlight` field — the first sentence in the description that contains a
query token — pre-computed on the backend to keep the frontend display logic simple.

---

## Trade-offs & What I'd Change

**What I traded off:**

- **Fuzzy scope** — the Levenshtein fallback runs against every product in the collection (50 items). For a large catalogue this would be too slow; the right fix is a trigram index or a pre-computed token set, not full-collection scan.
- **Pass 2 only on zero results** — a query like "sony headphns" would pass Pass 1 (because "sony" and "headphones" both match) but get no fuzzy boost for the typo. A production system would merge both passes.
- **No pagination** — the mega menu caps results by design, but a "view all" page would need cursor-based pagination.
- **No query expansion** — synonyms (e.g. "earphones" → "headphones") aren't handled; a synonym map would improve recall.

**What I'd change with more time:**

- Pre-compute a trigram index on `name` + `tags` for O(1) fuzzy lookups instead of O(n) Levenshtein
- Merge Pass 1 and Pass 2 results rather than using Pass 2 only as a fallback
- Add debounced query logging to track zero-result queries for continuous improvement
- Add keyboard navigation (Arrow keys) through the mega menu cards
