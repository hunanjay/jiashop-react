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

The Vite dev server proxies `/api/*` to `http://localhost:5050`, so the frontend always calls `/api/...` without hardcoding backend URLs.

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

### Frontend Routes

| Path | Access | Notes |
|------|--------|-------|
| `/`, `/catalog`, `/catalog/:id` | Public | No layout wrapper |
| `/cart` | Public | `ClientLayout` |
| `/workspace/*` | roles: user/admin/superadmin | `AdminLayout scope="workspace"` |
| `/admin/*` | roles: admin/superadmin | `AdminLayout scope="admin"` |
| `/admin/rbac` | superadmin only | |

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

- **`Product`**: `id`, `name`, `description`, `price` (Float), `stock`, `status`, `image_url`, `images_json` (JSON array), `category`, `specs` (Text, newline-separated tags), `customization_json` (JSON), `sales_count`, `owner_id`
- **`CartItem`**: tied to anonymous `cart_token` via `X-Cart-Token` header
- **`Order`**: `items_json` (JSON), `customer_id`, `effect_images_json`, `remarks`
- **`User`**: JWT tokens stored on model; roles via `Role` FK

### Product Image Uploads

Images are uploaded to Aliyun OSS via `services/oss_service.py`. The `upload_base64_to_oss()` function detects base64 data URIs and uploads them, returning a permanent OSS path. `get_signed_url()` converts stored paths to signed URLs for display. The frontend sends base64-encoded images; the backend handles upload transparently in `_extract_product_payload()`.

### Admin Product Management

The product form in `src/pages/admin/product-manager/ProductFormModal.jsx` drives both create and edit. State is owned by `ProductEditPage.jsx`. The `specs` field is a free-text textarea where each line/comma-separated entry renders as a tag chip in both the admin form preview and `ProductDetailPage.jsx`.

### Cart Sync Strategy

Cart state is optimistically updated in `AppContext` immediately, then synced to the backend API. On failure, a toast is shown but the local state is kept. On page load, the cart is re-fetched from the API to reconcile.
