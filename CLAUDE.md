# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack gift customization e-commerce platform called **GiftCraft**. It consists of two repos that work together:

- **`jiashop-react/`** (this repo) — React 18 + Vite frontend, port 5174
- **`jiashop/`** (sibling repo at `../jiashop`) — Flask backend, port 5050

## Frontend Commands

```bash
npm run dev       # Start dev server at http://localhost:5174
npm run build     # Production build
npm run lint      # ESLint
```

There are no tests in this project.

The Vite dev server proxies `/api/*` to `http://localhost:5050`, so the frontend always calls `/api/...` without hardcoding backend URLs.

`VITE_API_BASE_URL` env var overrides the default backend base URL (`http://localhost:5050/api`) if set.

## Backend Commands (run from `../jiashop`)

```bash
python3 app.py    # Start Flask on port 5050 (requires DATABASE_URL env var)

# Database migrations
python3 -m alembic -c db/alembic.ini upgrade head
python3 -m alembic -c db/alembic.ini revision --autogenerate -m "description"
```

Migration files live in `db/migrations/versions/`. Naming convention: `YYYYMMDDNNNNx_description.py`.

## Architecture

### Frontend State

All global state lives in a single `AppContext` defined in `src/App.jsx` (the `AppProvider` component). Access it via the `useApp()` hook from `src/lib/app-context.jsx`. The context holds: `products`, `session`, `cart`/`cartItems`, `categoryOptions`, `pushToast`, `isAdmin`, `isSuperAdmin`, `reloadProducts`, etc.

The `api` instance in `src/lib/api.js` is a pre-configured axios client that:
- Reads auth tokens from localStorage key `giftcraft-session`
- Automatically refreshes JWT access tokens on 401 responses (single in-flight refresh via `refreshPromise`)
- Emits `giftcraft:session-expired` window event when refresh fails (caught in `AppProvider`)

localStorage keys used by the app: `giftcraft-session`, `giftcraft-cart`, `giftcraft-cart-token`, `giftcraft-cart-variants`.

### Frontend Routes

| Path | Access | Notes |
|------|--------|-------|
| `/`, `/catalog`, `/catalog/:id` | Public | No layout wrapper |
| `/product/:id` | Public | Redirects to `/catalog/:id` |
| `/cart` | Public | `ClientLayout` |
| `/workspace/*` | roles: user/admin/superadmin | `AdminLayout scope="workspace"` |
| `/admin/*` | roles: admin/superadmin | `AdminLayout scope="admin"` |
| `/admin/rbac` | superadmin only | |

`ProductManagerPage` and `CustomerManagerPage` accept a `scope` prop (`"workspace"` or `"admin"`, default `"admin"`) to filter to the current user's own products vs. all products.

### Backend Structure

Flask app with blueprints registered in `api/__init__.py`. Key blueprints:
- `products_bp` — `/api/products` CRUD
- `auth_bp` — `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`
- `cart_bp` — `/api/cart` (anonymous via `X-Cart-Token` header)
- `admin_bp` / `workspace_bp` — admin and workspace-scoped endpoints
- `orders_bp`, `categories_bp`, `upload_bp`, `ai_bp`

Swagger docs available at `http://localhost:5050/apidocs/`.

### RBAC

Authorization uses **Casbin** with policy file `casbin_policy.csv`. Role hierarchy: `superadmin → admin → user` (inherited). Protect endpoints with the `@require_permission(route_pattern, method)` decorator from `api/dependencies.py`. When adding new admin endpoints, add corresponding `p, admin, ...` or `p, user, ...` lines to `casbin_policy.csv`.

### Database Models

Key models in `db/models.py`:

- **`Product`**: `id`, `name`, `description`, `price` (Float), `stock`, `status`, `image_url`, `images_json` (JSON array), `category`, `specs` (Text, newline-separated tags), `customization_json` (JSON — stores `variants` array with `{name, price, stock}`), `sales_count`, `owner_id`
- **`CartItem`**: tied to anonymous `cart_token` via `X-Cart-Token` header
- **`Order`**: `items_json` (JSON), `customer_id`, `effect_images_json`, `remarks`
- **`User`**: JWT tokens stored on model; roles via `Role` FK

### Product Variants

Products support multiple price/stock variants (e.g., sizes, colors). Variants are stored in `customization_json.variants` as `[{name, price, stock}]`. When variants exist, the product's displayed price is the minimum variant price. The frontend form in `ProductEditPage.jsx` manages variants inline; `ProductDetailPage.jsx` renders a variant selector for customers.

### Product Image Uploads

Images are uploaded to Aliyun OSS via `services/oss_service.py`. The `upload_base64_to_oss()` function detects base64 data URIs and uploads them, returning a permanent OSS path. `get_signed_url()` converts stored paths to signed URLs for display. The frontend sends base64-encoded images; the backend handles upload transparently in `_extract_product_payload()`.

### UI Component Library

Custom components live in `src/components/ui/` — these are hand-rolled wrappers around Radix UI primitives and Tailwind CSS v4, not shadcn imports. Uses `clsx` + `tailwind-merge` via `src/lib/utils.js` for class merging. Icons from `lucide-react`.

### Admin Product Management

The product form is driven by `ProductEditPage.jsx` (state owner) which renders the form inline (not in a modal). The `specs` field is a free-text textarea where each line/comma-separated entry renders as a tag chip in both the admin form preview and `ProductDetailPage.jsx`.

### Cart Sync Strategy

Cart state is optimistically updated in `AppContext` immediately, then synced to the backend API. On failure, a toast is shown but the local state is kept. On page load, the cart is re-fetched from the API to reconcile.
