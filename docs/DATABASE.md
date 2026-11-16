# NexaStock database structure

NexaStock stores data in MongoDB using Mongoose models. MongoDB is document-based, so the diagram below shows collections and their ObjectId references. It is an ER-style view of the data, not a relational SQL schema.

## ER-style diagram

```mermaid
erDiagram
    USERS ||--o{ CATEGORIES : creates
    USERS ||--o{ CUSTOMERS : creates
    USERS ||--o{ PRODUCTS : creates
    USERS ||--o{ ORDERS : creates
    USERS ||--o{ STOCK_TRANSACTIONS : performs
    CATEGORIES ||--o{ PRODUCTS : classifies
    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : embeds
    PRODUCTS ||--o{ ORDER_ITEMS : referenced_by
    ORDERS ||--o{ ORDER_STATUS_HISTORY : embeds
    USERS ||--o{ ORDER_STATUS_HISTORY : changes
    PRODUCTS ||--o{ STOCK_TRANSACTIONS : tracked_in

    USERS {
        ObjectId _id PK
        string name
        string email UK
        string password_hash
        string role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    CATEGORIES {
        ObjectId _id PK
        string name UK
        string description
        boolean isActive
        ObjectId createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    CUSTOMERS {
        ObjectId _id PK
        string name
        string email
        string phone
        string address
        string city
        boolean isActive
        ObjectId createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    PRODUCTS {
        ObjectId _id PK
        string name
        string sku UK
        string description
        ObjectId category FK
        number purchasePrice
        number sellingPrice
        number quantity
        number minStockLevel
        string unit
        boolean isActive
        ObjectId createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    ORDERS {
        ObjectId _id PK
        string orderNumber UK
        ObjectId customer FK
        number totalAmount
        string paymentStatus
        string orderStatus
        string notes
        ObjectId createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    ORDER_ITEMS {
        ObjectId product FK
        number quantity
        number unitPrice
        number subtotal
    }
    ORDER_STATUS_HISTORY {
        string orderStatus
        string paymentStatus
        ObjectId changedBy FK
        datetime changedAt
    }
    STOCK_TRANSACTIONS {
        ObjectId _id PK
        ObjectId product FK
        string transactionType
        number quantity
        number previousQuantity
        number newQuantity
        string reference
        string notes
        ObjectId performedBy FK
        datetime createdAt
        datetime updatedAt
    }
```

`ORDER_ITEMS` and `ORDER_STATUS_HISTORY` are embedded subdocuments inside an order; they are not separate MongoDB collections. `password_hash` represents the `password` field stored as a bcrypt hash. The password field is excluded from normal user queries.

## Collections and important fields

### Users

Stores account identity and role. `email` is unique and normalized to lowercase. Roles are `admin`, `manager`, and `user`; new accounts default to `user`. Passwords are hashed with bcrypt before storage. `isActive` controls whether an account can sign in.

### Categories

Stores a unique category `name`, optional `description`, active status, creator reference, and timestamps. Deleting a category deactivates it instead of physically removing its document.

### Products

Stores the product name, unique uppercase `sku`, category reference, purchase and selling prices, stock quantity, minimum stock level, unit, active status, creator reference, and timestamps. New products begin with quantity zero; stock is changed through stock operations or order creation. Low stock means `quantity <= minStockLevel`.

### Customers

Stores customer name and phone (required), plus optional email, address, and city. Customer documents include active status, creator reference, and timestamps. Deletion is a soft deactivation.

### Orders

Stores a unique order number, customer reference, embedded line items, total amount, payment and order statuses, status history, notes, creator reference, and timestamps. Each embedded item records a product reference, quantity, unit-price snapshot, and subtotal. Status-history entries record both statuses, the user who changed them, and the change time.

Order creation and the related product quantity deductions and stock transaction records are performed in a MongoDB transaction. The order stores price snapshots so the invoice remains meaningful if a product price changes later.

### Stock transactions

Stores a stock movement for one product: transaction type (`purchase`, `sale`, `return`, or `adjustment`), movement quantity, quantity before and after, optional reference and notes, performing user, and timestamps. Order creation creates `sale` transactions automatically.

## References and deletion behavior

Mongoose ObjectId references connect documents. MongoDB does not enforce these references as SQL foreign keys; the application checks referenced products, customers, and categories when creating records. Products, categories, and customers use soft deletion (`isActive: false`) so historical order and stock records are retained.

## Database requirements

The backend uses multi-document transactions for order creation and stock adjustments. Use MongoDB Atlas or another MongoDB deployment configured as a replica set; a basic standalone MongoDB server does not support these transactions.

