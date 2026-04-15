Backend changes summary:
- Authentication moved to JWT tokens. Set JWT_SECRET in .env.
- Sessions are saved to MongoDB in the `sessions` collection (models/session.js).
- Cart operations update both the Cart collection and the Session document for quick restore.
- Endpoints:
  POST /api/auth/register -> { name, email, password } -> returns { user, token, cart }
  POST /api/auth/login -> { email, password } -> returns { user, token, cart }
  POST /api/auth/logout -> clears server-side session for token (client should remove token)
  GET  /api/auth/me -> returns { user, cart } for the provided Bearer token
  GET  /api/products -> list products
  GET  /api/products/:id -> single product
  GET  /api/cart -> get user's cart (requires Bearer token)
  POST /api/cart/add -> { productId, qty } (requires Bearer token)
  POST /api/cart/update -> { productId, qty } (requires Bearer token)
  POST /api/cart/clear -> clears cart (requires Bearer token)

To run:
- cd backend
- npm install
- set MONGO_URI and JWT_SECRET and CLIENT_URL in .env
- npm run dev
