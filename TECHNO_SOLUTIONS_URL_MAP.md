# Techno Solutions URL map

Base development URL: `http://localhost:3000`

## User-facing pages

| Page | Route | Complete local URL | Status | Notes |
|---|---|---|---|---|
| Home | `/` | `http://localhost:3000/` | Complete landing page | Cinematic intro, commerce core, New Arrivals, Today’s Picks, Brand Showcase and promotions. |
| Products / Shop | `/products` | `http://localhost:3000/products` | Complete shop experience | URL-driven search, category, brand, price, rating, stock, deals and sort state; progressive product loading. |
| XIOMA X15 Ultra | `/products/xioma-x15-ultra` | `http://localhost:3000/products/xioma-x15-ultra` | Manager-demo product page | 3D-style gallery, official Fancybox, variants, recommendations and demo purchase disclosure. |
| Cart | `/cart` | `http://localhost:3000/cart` | Complete local/demo cart | Shared cart state, persistence, drawer, promo rules and order summary; no real checkout backend. |
| Contact | `/contact` | `http://localhost:3000/contact` | Stub page | Existing translated heading only. |
| Dashboard | `/dashboard` | `http://localhost:3000/dashboard` | Stub page | Existing translated heading; metadata is noindex. |
| Login | `/login` | `http://localhost:3000/login` | UI complete, backend-dependent | Calls the external auth API configured by `NEXT_PUBLIC_API_BASE_URL`. |
| Register | `/register` | `http://localhost:3000/register` | UI complete, backend-dependent | Calls the external auth API and redirects to Verify on success. |
| Verify account | `/verify` | `http://localhost:3000/verify?email=user%40example.com` | UI complete, backend-dependent | Requires an `email` query parameter and calls the external verification endpoint. |

## Shop URL-state examples

These are the same `/products` page with shareable query state:

- Search: `http://localhost:3000/products?search=phone`
- Category: `http://localhost:3000/products?category=smartphones`
- Brand: `http://localhost:3000/products?brand=XIOMA`
- Deals sorted by discount: `http://localhost:3000/products?deals=1&sort=discount`
- Combined example: `http://localhost:3000/products?category=smartphones&brand=XIOMA&stock=1&sort=price-asc`

Supported shop query keys found in the project: `search`, `category`, `brand`, `min`, `max`, `rating`, `stock`, `deals`, and `sort`.

## Dynamic routes

No dynamic Next.js page route folders were found. The XIOMA demo is a concrete static route at `/products/xioma-x15-ultra`.

## Application API routes

No `src/app/api/**/route.js` files were found.

The authentication UI calls an external backend, defaulting to `http://localhost:8000` unless `NEXT_PUBLIC_API_BASE_URL` is set:

- `POST /api/login`
- `POST /api/register`
- `GET /api/verifiy` (existing backend spelling)

## Missing navigation destinations found

The following links are present in the existing authentication UI but no matching page route exists in this ZIP:

- `/forgot-password`
- `/terms`
- `/privacy`

No Wishlist page or Checkout page exists. Those capabilities must not be presented as complete routes.

## Framework fallback

No custom `not-found.js` exists, so unmatched URLs use the standard Next.js 404 experience.
