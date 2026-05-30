# MERN Ecommerce Backend

Express + MongoDB REST API for the multi-category ecommerce store.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in MongoDB, JWT, Razorpay, Cloudinary, and admin seed values.
3. Install dependencies:

```bash
npm install
```

4. Seed the database:

```bash
npm run seed
```

5. Start the API:

```bash
npm run dev
```

The API defaults to `http://localhost:5000`.

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `POST /api/products` admin only, supports multipart `images`
- `POST /api/payment/create-order` protected, pass `orderItems`
- `POST /api/payment/verify` protected
- `POST /api/orders` protected, requires verified Razorpay payment fields
- `GET /api/orders/my`
- `GET /api/admin/stats` admin only

Auth uses httpOnly cookies with `credentials: true` from the frontend.
