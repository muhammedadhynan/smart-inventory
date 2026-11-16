# NexaStock API documentation

## Base URLs

- Production: `https://nexastock-inventory-g4xy.onrender.com/api`
- Local: `http://localhost:5000/api`

The API uses JSON request and response bodies. For protected endpoints, send:

```http
Authorization: Bearer <JWT token>
Content-Type: application/json
```

The login and registration endpoints return a JWT that expires after 1 day. Do not publish real tokens.

## Authentication and access

| Access type | Endpoints |
|---|---|
| Public | `GET /health`, `POST /auth/register`, `POST /auth/login` |
| Any signed-in account | `GET /dashboard` |
| Signed-in `admin` or `manager` | Products, categories, customers, orders, and stock operations |

New accounts are assigned the `user` role by default.

## Health

### `GET /health`

No authentication required.

Successful response (`200`):

```json
{
  "success": true,
  "message": "Smart Inventory API is running"
}
```

## Authentication

### `POST /auth/register`

Body:

```json
{
  "name": "Alex Smith",
  "email": "alex@example.com",
  "password": "choose-a-private-password"
}
```

Returns `201` with `success`, `message`, `token`, and a `user` object (`id`, `name`, `email`, `role`). Passwords are hashed before storage. Errors include `400` for missing fields and `409` when the email is already registered.

### `POST /auth/login`

Body:

```json
{
  "email": "alex@example.com",
  "password": "your-password"
}
```

Returns `200` with `success`, `message`, `token`, and `user`. Errors include `400` for missing fields, `401` for incorrect credentials, and `403` for an inactive account.

## Dashboard

### `GET /dashboard`

Requires any valid signed-in account. Returns `stats` (`totalProducts`, `totalCustomers`, `totalOrders`, `lowStockCount`, `inventoryValue`), `lowStockProducts`, and up to five `recentOrders`.

## Products (admin or manager)

| Method and path | Purpose |
|---|---|
| `GET /products` | List active products, newest first |
| `POST /products` | Create a product |
| `GET /products/:id` | Get one active product |
| `PUT /products/:id` | Update an active product |
| `DELETE /products/:id` | Deactivate a product (soft delete) |

Create body (required: `name`, `sku`, `category`, `purchasePrice`, `sellingPrice`):

```json
{
  "name": "Wireless Headset",
  "sku": "HEADSET-001",
  "description": "Bluetooth headset",
  "category": "<category MongoDB ObjectId>",
  "purchasePrice": 1200,
  "sellingPrice": 1800,
  "minStockLevel": 5,
  "unit": "pcs"
}
```

New products start with quantity `0`; use the stock endpoint to receive stock. SKU values are stored uppercase and must be unique. Product list and detail responses include populated category and creator information.

For `PUT /products/:id`, send only the fields being changed. A product is deactivated instead of permanently removed by `DELETE`.

## Categories (admin or manager)

| Method and path | Purpose |
|---|---|
| `GET /categories` | List active categories |
| `POST /categories` | Create a category |
| `PUT /categories/:id` | Update a category |
| `DELETE /categories/:id` | Deactivate a category (soft delete) |

Create body:

```json
{
  "name": "Audio",
  "description": "Headphones, headsets, and speakers"
}
```

Category names must be unique. Update bodies may contain `name` and/or `description`.

## Customers (admin or manager)

| Method and path | Purpose |
|---|---|
| `GET /customers` | List active customers |
| `POST /customers` | Create a customer |
| `GET /customers/:id` | Get one active customer |
| `PUT /customers/:id` | Update a customer |
| `DELETE /customers/:id` | Deactivate a customer (soft delete) |

Create body (required: `name`, `phone`):

```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "phone": "+91 90000 00000",
  "address": "10 Market Road",
  "city": "Kochi"
}
```

Update bodies may contain `name`, `email`, `phone`, `address`, and/or `city`.

## Orders (admin or manager)

| Method and path | Purpose |
|---|---|
| `GET /orders` | List orders, newest first |
| `POST /orders` | Create an order and deduct stock |
| `GET /orders/:id` | Get an order |
| `PATCH /orders/:id/status` | Update order and/or payment status |

Create body:

```json
{
  "customerId": "<customer MongoDB ObjectId>",
  "items": [
    {
      "productId": "<product MongoDB ObjectId>",
      "quantity": 2
    }
  ],
  "notes": "Optional note"
}
```

The API calculates unit prices and totals from current product selling prices, deducts stock, and writes stock transaction records. These changes use a MongoDB transaction. An order cannot be created when stock is insufficient.

Allowed `orderStatus` values: `pending`, `processing`, `completed`, `cancelled`.

Allowed `paymentStatus` values: `pending`, `paid`, `failed`, `refunded`.

Status update body (include at least one property):

```json
{
  "orderStatus": "processing",
  "paymentStatus": "paid"
}
```

Cancellation is not implemented yet because restoring stock on cancellation is not implemented; requesting `orderStatus: "cancelled"` returns `400`.

## Stock (admin or manager)

### `POST /stock/add`

Adds quantity to a product and records a stock transaction. `productId` and positive whole-number `quantity` are required. Optional `transactionType` is `purchase` (default) or `return`; `reference` and `notes` are optional.

```json
{
  "productId": "<product MongoDB ObjectId>",
  "quantity": 10,
  "transactionType": "purchase",
  "reference": "Supplier invoice 123",
  "notes": "Received in good condition"
}
```

### `POST /stock/remove`

Removes quantity and records a stock transaction. `productId` and positive whole-number `quantity` are required. Optional `transactionType` is `sale` (default) or `adjustment`; `reference` and `notes` are optional. The request fails with `400` if there is not enough stock.

```json
{
  "productId": "<product MongoDB ObjectId>",
  "quantity": 1,
  "transactionType": "sale",
  "reference": "Manual stock issue"
}
```

## Common responses

- `200` — request completed.
- `201` — resource created.
- `400` — missing or invalid input, or insufficient stock.
- `401` — missing, invalid, or expired login token.
- `403` — account lacks the required role or is inactive.
- `404` — requested active resource was not found.
- `409` — duplicate email, SKU, or category name.
- `500` — unexpected server error.

Responses include a `success` boolean. Error responses include a `message`; some server errors also include an `error` detail.

## Current scope

List endpoints return all matching records; pagination, filtering, and a stock-transaction history endpoint are not currently exposed by the API.

