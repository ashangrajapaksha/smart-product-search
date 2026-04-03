# Smart Product Search

A typo-tolerant, relevance-ranked product search with a mega menu UI.
Built on an Nx monorepo — React 19 + Vite frontend, Express 5 backend, MongoDB.

**Live demo:** https://smart-search-web.web.app

---

## Stack

| Layer           | Technology                                    |
| --------------- | --------------------------------------------- |
| Monorepo        | Nx 22                                         |
| Frontend        | React 19, Vite, React Router v7, Tailwind CSS |
| Backend         | Express 5, TypeScript                         |
| Database        | MongoDB via Mongoose                          |
| Package Manager | pnpm                                          |

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

Copy the example config and set your MongoDB URI:

```bash
# apps/api/.env.development
MONGODB_URI=mongodb://localhost:27017/smart-product-search
PORT=8000
FRONTEND_URL=http://localhost:3000
COOKIE_SECRET=dev-secret
```

To use MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 3. Seed the database

```bash
pnpm db:seed
```

This imports all 50 products from `apps/api/src/database/products.json` into MongoDB using `bulkWrite` upserts — safe to run multiple times without duplicating data.

Expected output:

```
Connecting to MongoDB...
Connected.
Seeding 50 products...
Done. Upserted: 50, Modified: 0
Disconnected.
```

### 4. Run the apps

Open two terminals:

```bash
# Terminal 1 — backend
pnpm dev:api   # Express API → http://localhost:8000

# Terminal 2 — frontend
pnpm dev:web   # React app  → http://localhost:3000
```

Open `http://localhost:3000` and start searching.

---

## Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `pnpm dev:web`   | Frontend dev server (port 3000) |
| `pnpm dev:api`   | Backend dev server (port 8000)  |
| `pnpm db:seed`   | Seed MongoDB with 50 products   |
| `pnpm build:all` | Production build (both apps)    |
| `pnpm lint`      | Lint all apps                   |

---

## API Endpoints

| Method | Path          | Description                                      |
| ------ | ------------- | ------------------------------------------------ |
| `GET`  | `/api/health` | Health check — returns MongoDB connection status |
| `GET`  | `/api/search` | Product search                                   |

### Search query parameters

| Param         | Default  | Max | Description                                       |
| ------------- | -------- | --- | ------------------------------------------------- |
| `q`           | required | —   | Search query (min 2 chars)                        |
| `limit`       | 15       | 100 | Total results to return                           |
| `perCategory` | 3        | 50  | Products shown per category column                |
| `category`    | —        | —   | Filter to a single category (used by "Show more") |

### Search response shape

```ts
{
  query: string;
  total: number; // total matched products across all categories
  categories: Array<{
    name: string; // e.g. "Electronics"
    count: number; // total hits in this category (before per-column cap)
    products: Array<{
      id: string;
      name: string;
      category: string;
      tags: string[];
      price: number;
      stock: number;
      rating: number;
      score: number; // composite relevance score (0–1), useful for debugging
      highlight: string; // most relevant sentence from description
    }>;
  }>;
}
```

---

## How Search Works

### Typo Tolerance — Two-Pass Pipeline

#### Pass 1 — MongoDB `$text` index

Every query first hits the weighted text index:

```
name ×10  ·  tags ×5  ·  category ×3  ·  description ×1
```

MongoDB tokenises the query, looks up each token in the index, and returns matching documents with a relevance `textScore`. It handles word stemming (e.g. "running" matches "run") but not typos.

#### Pass 2 — Levenshtein fallback

If Pass 1 returns **zero results**, the fuzzy fallback runs. It loads all products and computes the Levenshtein edit distance between every query token and every word in each product's name and tags.

Products with minimum edit distance ≤ 2 are kept:

| Query       | Closest word | Distance | Result   |
| ----------- | ------------ | -------- | -------- |
| `samsng`    | `samsung`    | 1        | Returned |
| `wirelss`   | `wireless`   | 1        | Returned |
| `headphnes` | `headphones` | 1        | Returned |
| `yogga`     | `yoga`       | 2        | Returned |

Distance is converted to a 0–1 score: `score = 1 - distance × 0.4`

| Distance  | Score |
| --------- | ----- |
| 0 (exact) | 1.0   |
| 1         | 0.6   |
| 2         | 0.2   |

---

### Ranking — Multi-Signal Composite Score

Every result — from both Pass 1 and Pass 2 — goes through the same scoring formula:

```
score = (normalised textScore) × 0.50
      + (rating / 5.0)         × 0.20
      + (inStock ? 1 : 0)      × 0.15
      + nameMatchBonus          × 0.10
      + tagMatchBonus           × 0.05
```

| Signal                          | Weight | Rationale                                          |
| ------------------------------- | ------ | -------------------------------------------------- |
| MongoDB text score (normalised) | 0.50   | Primary relevance — field weights baked into index |
| Rating (0–1)                    | 0.20   | Users prefer highly-rated products                 |
| Stock availability              | 0.15   | In-stock items are more immediately useful         |
| Name match bonus                | 0.10   | Rewards close name matches                         |
| Tag match bonus                 | 0.05   | Small boost when query token appears in tags       |

**textScore normalisation:** MongoDB returns raw floats (e.g. 1.2, 3.6). Dividing by the highest score in the result set maps them to 0–1 relative to each other, so the best match always gets 1.0 and the weights remain meaningful.

**nameMatchBonus tiers:**

- Query exactly equals product name → 1.0
- All query tokens found in name → 0.8
- Some query tokens found in name → 0.4
- None → 0.0

Results below score **0.05** are discarded to remove noise.

---

### Mega Menu API Response

After scoring, results are grouped by category:

- Maximum **5 category columns** displayed
- Maximum **3 products per column** in the mega menu (configurable via `perCategory`)
- The full `count` per category is returned so the UI can show "+N more"
- Each product includes a `highlight` — the first sentence from the description that contains a query token, pre-computed on the backend to keep frontend logic simple

The `perCategory` parameter allows the same endpoint to serve both the compact mega menu (3 per category) and the full search page (50 per category) without any duplication.

---

## Features

### Core (Required)

- **Typo tolerance** — two-pass pipeline handles misspellings up to edit distance 2
- **Ranked results** — multi-signal composite score orders by relevance, not insertion order
- **Mega menu UI** — dropdown with category columns, product cards, skeleton loading states

### Additional

- **Search history** — last 5 searches saved to localStorage, shown when the search bar is focused with no query typed
- **Show more** — expand any category column to see up to 50 products
- **Sticky category headers** — headers stay visible while scrolling through a long column
- **Fractional star ratings** — SVG linear gradient fills stars to the exact decimal (e.g. 4.6 ★)
- **Highlight snippets** — most relevant sentence from the description shown per product
- **Full search page** — "View all" navigates to a dedicated results page with higher caps
- **Score floor** — results below 0.05 filtered out to prevent irrelevant matches appearing

---

## Trade-offs

**What I traded off:**

- **Fuzzy scope** — the Levenshtein fallback runs against every product in the collection (50 items here). For a large catalogue this would be too slow; a trigram index or pre-computed token set would be the right approach.
- **Pass 2 only on zero results** — a query like `"sony headphns"` passes Pass 1 (because `"sony"` matches) but the typo in `"headphns"` gets no fuzzy boost. A production system would merge both passes.
- **No pagination** — the search page caps at 100 results. A real catalogue would need cursor-based pagination.
- **No synonym expansion** — `"earphones"` won't match products tagged `"headphones"`. A synonym map would improve recall.
- **No auth/rate limiting** — the search endpoint is open. In production, rate limiting and abuse protection would be needed.

**What I'd change with more time:**

- Pre-compute a trigram index on `name` + `tags` for O(1) fuzzy lookups instead of O(n) Levenshtein
- Merge Pass 1 and Pass 2 results rather than using Pass 2 only as a fallback
- Add query logging to track zero-result searches and improve the dataset over time
- Add keyboard navigation (arrow keys) through the mega menu product cards
- Add a synonym map for common alternative terms
- Cache repeated queries client-side to avoid redundant API calls
