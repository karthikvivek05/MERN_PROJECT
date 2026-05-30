# MERN Ecommerce Frontend

React + Vite frontend for the General Store ecommerce app.

## Setup

1. Copy `.env.example` to `.env`.
2. Keep `VITE_API_URL=http://localhost:5000/api` unless the backend runs elsewhere.
3. Install dependencies:

```bash
npm install
```

4. Start the app:

```bash
npm run dev
```

The app defaults to `http://localhost:5173`.

## Built Screens

- Product listing with search, filters, sorting, and pagination
- Product detail with cart actions and reviews
- Login and register
- Cart and Razorpay checkout
- User order history and order detail
- Admin dashboard for stats, product CRUD, orders, and users

Auth uses backend httpOnly cookies, so API calls are made with credentials enabled.
