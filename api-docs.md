# Grocery Backend API Docs

Base URL: `/api`

Endpoint headings below omit the `/api` prefix for readability. Request examples use the full frontend path with `/api`, for example `/api/products`.

## Response Wrapper

Most successful responses use this shape:

```json
{
  "message": "Message",
  "data": {},
  "meta": {}
}
```

`meta` only exists on paginated list endpoints.

## Shared Rules

- UUID fields must be valid UUID strings.
- Boolean query params only accept `true` or `false`. Do not send `0`, `1`, `yes`, `no`, or random strings.
- Pagination `page` and `limit` must be positive integers. `limit` is capped at `100`.
- Product image upload field name is always `images`.
- Product image upload accepts JPG/JPEG, PNG, and GIF by MIME type. Max file size is `1MB`.
- Target resource identifiers are sent through params, for example `:slug`, `:storeId`, and `:imageId`.
- Batch item identifiers are sent in body arrays, for example image IDs in reorder/gallery payloads.
- Admin endpoints require `adminAccessToken` HTTP-only cookie.

## Shared Schemas

### Pagination Meta

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}
```

### Product Card

Used by public product lists and admin product lists.

```json
{
  "id": "uuid",
  "name": "Indomie Goreng",
  "slug": "indomie-goreng-1234",
  "categoryId": "uuid",
  "brand": "Indomie",
  "variant": "Original",
  "size": "85g",
  "description": "Instant fried noodle",
  "sku": "INS-IND-IND-ORI-85G",
  "price": 3500,
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z",
  "deletedAt": null,
  "category": {
    "id": "uuid",
    "name": "Instant Food"
  },
  "images": [
    {
      "id": "uuid",
      "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
      "position": 1
    }
  ]
}
```

### Admin Product Detail

Admin detail contains data that is not considered public-safe, including image `publicId`, stock histories, and discounts.

```json
{
  "id": "uuid",
  "name": "Indomie Goreng",
  "slug": "indomie-goreng-1234",
  "categoryId": "uuid",
  "brand": "Indomie",
  "variant": "Original",
  "size": "85g",
  "description": "Instant fried noodle",
  "sku": "INS-IND-IND-ORI-85G",
  "price": 3500,
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z",
  "deletedAt": null,
  "category": {
    "id": "uuid",
    "name": "Instant Food",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  },
  "images": [
    {
      "id": "uuid",
      "productId": "uuid",
      "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
      "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
      "position": 1,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "stocks": [],
  "stockHistories": [],
  "discounts": []
}
```

### Product Stock

```json
{
  "id": "uuid",
  "productId": "uuid",
  "storeId": "uuid",
  "stock": 0,
  "store": {
    "id": "uuid",
    "name": "Grocergo Kemang",
    "latitude": "-6.260000",
    "longitude": "106.810000"
  },
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z"
}
```

### Category

```json
{
  "id": "uuid",
  "name": "Instant Food",
  "createdAt": "2026-06-06T10:00:00.000Z",
  "updatedAt": "2026-06-06T10:00:00.000Z",
  "deletedAt": null
}
```

## Public Categories

### GET `/categories`

Get paginated category list.

#### Frontend Usage

Use this endpoint for category filters, category dropdowns, and product create/edit forms that need a selectable category list. For simple dropdowns, request a high enough `limit`, for example `limit=100`.

#### Zod Contract

```ts
query = {
  q?: string;
  name?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Query

| Param       | Type   | Default | Description                        |
| ----------- | ------ | ------- | ---------------------------------- |
| `q`         | string | -       | Search category name.              |
| `name`      | string | -       | Filter category name.              |
| `sortBy`    | enum   | `name`  | `name`, `createdAt`, `updatedAt`.  |
| `sortOrder` | enum   | `asc`   | `asc` or `desc`.                   |
| `page`      | number | `1`     | Positive integer.                  |
| `limit`     | number | `10`    | Positive integer, capped at `100`. |

#### Request Examples

```txt
GET /api/categories
GET /api/categories?q=instant&page=1&limit=20
GET /api/categories?sortBy=createdAt&sortOrder=desc
```

#### Return

```json
{
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Instant Food",
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/categories/:id`

Get category detail by ID.

#### Frontend Usage

Use this when frontend already stores a `categoryId` and needs to resolve its current category name.

#### Zod Contract

```ts
params = {
  id: uuid;
}
```

#### Params

| Param | Type | Required | Description  |
| ----- | ---- | -------- | ------------ |
| `id`  | uuid | Yes      | Category ID. |

#### Return

```json
{
  "message": "Category fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Instant Food",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null
  }
}
```

## Public Products

### GET `/products`

Get paginated product list for product catalog/search.

#### Frontend Usage

Use this endpoint for catalog cards, search result pages, category pages, and product listing grids. Products with stock `0` can still appear. To decide whether the user can add an item to cart, filter by the selected store with `storeId` and/or fetch exact stock using the stock endpoint.

#### Zod Contract

```ts
{
  q?: string;
  name?: string;
  slug?: string;
  sku?: string;
  brand?: string;
  variant?: string;
  size?: string;
  categoryName?: string;
  categoryId?: uuid;
  storeId?: uuid;
  minPrice?: nonNegativeInt;
  maxPrice?: nonNegativeInt;
  minStock?: nonNegativeInt;
  maxStock?: nonNegativeInt;
  inStock?: boolean;
  sortBy?: "name" | "slug" | "sku" | "brand" | "price" | "categoryName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Query

| Param          | Type    | Default     | Description                                                                                   |
| -------------- | ------- | ----------- | --------------------------------------------------------------------------------------------- |
| `q`            | string  | -           | Search name, slug, SKU, brand, variant, size, category name.                                  |
| `name`         | string  | -           | Filter product name.                                                                          |
| `slug`         | string  | -           | Filter product slug.                                                                          |
| `sku`          | string  | -           | Filter SKU.                                                                                   |
| `brand`        | string  | -           | Filter brand.                                                                                 |
| `variant`      | string  | -           | Filter variant.                                                                               |
| `size`         | string  | -           | Filter size.                                                                                  |
| `categoryName` | string  | -           | Filter category name.                                                                         |
| `categoryId`   | uuid    | -           | Filter category ID.                                                                           |
| `storeId`      | uuid    | -           | Filter products that have a stock row in this store.                                          |
| `minPrice`     | number  | -           | Minimum price.                                                                                |
| `maxPrice`     | number  | -           | Maximum price.                                                                                |
| `minStock`     | number  | -           | Minimum stock on matching stock rows.                                                         |
| `maxStock`     | number  | -           | Maximum stock on matching stock rows.                                                         |
| `inStock`      | boolean | -           | `true` means stock `> 0`; `false` means stock `<= 0`; omitted means no stock quantity filter. |
| `sortBy`       | enum    | `createdAt` | `name`, `slug`, `sku`, `brand`, `price`, `categoryName`, `createdAt`, `updatedAt`.            |
| `sortOrder`    | enum    | `desc`      | `asc` or `desc`.                                                                              |
| `page`         | number  | `1`         | Positive integer.                                                                             |
| `limit`        | number  | `10`        | Positive integer, capped at `100`.                                                            |

#### Request Examples

```txt
GET /api/products?q=indomie&page=1&limit=12
GET /api/products?categoryId=<uuid>&storeId=<uuid>&inStock=true
GET /api/products?sortBy=price&sortOrder=asc
```

#### Return

```json
{
  "message": "Products fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Indomie Goreng",
      "slug": "indomie-goreng-1234",
      "categoryId": "uuid",
      "brand": "Indomie",
      "variant": "Original",
      "size": "85g",
      "description": "Instant fried noodle",
      "sku": "INS-IND-IND-ORI-85G",
      "price": 3500,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "category": {
        "id": "uuid",
        "name": "Instant Food"
      },
      "images": [
        {
          "id": "uuid",
          "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
          "position": 1
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/products/:slug`

Get public product detail by slug. Stocks are not included by default.

#### Frontend Usage

Use this endpoint for product detail pages. By default, use it for static product information only. Add `includeStocks=true` when the page needs store availability. Use `storeId` when the user already selected a store.

#### Zod Contract

```ts
params = {
  slug: string;
}

query = {
  includeStocks?: boolean; // default false
  storeId?: uuid;
  inStock?: boolean;
}
```

#### Params

| Param  | Type   | Required | Description   |
| ------ | ------ | -------- | ------------- |
| `slug` | string | Yes      | Product slug. |

#### Query

| Param           | Type    | Default | Description                                                                                                                        |
| --------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `includeStocks` | boolean | `false` | Include store stock rows.                                                                                                          |
| `storeId`       | uuid    | -       | When `includeStocks=true`, include stock only for this store.                                                                      |
| `inStock`       | boolean | -       | When `includeStocks=true`, `true` returns stock `> 0`; `false` returns stock `<= 0`; omitted returns all stock rows including `0`. |

#### Request Examples

```txt
GET /api/products/indomie-goreng-1234
GET /api/products/indomie-goreng-1234?includeStocks=true
GET /api/products/indomie-goreng-1234?includeStocks=true&storeId=<uuid>
```

#### Return

```json
{
  "message": "Product fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Original",
    "size": "85g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-ORI-85G",
    "price": 3500,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "category": {
      "id": "uuid",
      "name": "Instant Food"
    },
    "images": [
      {
        "id": "uuid",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "position": 1
      }
    ],
    "stocks": [
      {
        "id": "uuid",
        "productId": "uuid",
        "storeId": "uuid",
        "stock": 0,
        "store": {
          "id": "uuid",
          "name": "Grocergo Kemang",
          "latitude": "-6.260000",
          "longitude": "106.810000"
        },
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z"
      }
    ]
  }
}
```

`stocks` only exists when `includeStocks=true`.

## Public Stocks

### GET `/stocks/store/:storeId`

Get all stock rows for a store, including stock `0` by default. Product details are included for cards.

#### Frontend Usage

Use this endpoint for store-specific catalog pages or when the user chooses a store first. It returns stock rows with product card data, so frontend can render availability directly. Use `inStock=true` only when the UI should hide out-of-stock cards.

#### Zod Contract

```ts
params = {
  storeId: uuid;
}

query = {
  q?: string;
  productName?: string;
  sku?: string;
  brand?: string;
  categoryId?: uuid;
  categoryName?: string;
  minStock?: nonNegativeInt;
  maxStock?: nonNegativeInt;
  inStock?: boolean;
  sortBy?: "stock" | "productName" | "sku" | "brand" | "categoryName" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: positiveInt;
  limit?: positiveInt; // capped at 100
}
```

#### Params

| Param     | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `storeId` | uuid | Yes      | Store ID.   |

#### Query

| Param          | Type    | Default       | Description                                                                                          |
| -------------- | ------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `q`            | string  | -             | Search product name, slug, SKU, brand, category name.                                                |
| `productName`  | string  | -             | Filter product name.                                                                                 |
| `sku`          | string  | -             | Filter SKU.                                                                                          |
| `brand`        | string  | -             | Filter brand.                                                                                        |
| `categoryId`   | uuid    | -             | Filter category ID.                                                                                  |
| `categoryName` | string  | -             | Filter category name.                                                                                |
| `minStock`     | number  | -             | Minimum stock.                                                                                       |
| `maxStock`     | number  | -             | Maximum stock.                                                                                       |
| `inStock`      | boolean | -             | `true` means stock `> 0`; `false` means stock `<= 0`; omitted includes all stock rows including `0`. |
| `sortBy`       | enum    | `productName` | `stock`, `productName`, `sku`, `brand`, `categoryName`, `createdAt`, `updatedAt`.                    |
| `sortOrder`    | enum    | `asc`         | `asc` or `desc`.                                                                                     |
| `page`         | number  | `1`           | Positive integer.                                                                                    |
| `limit`        | number  | `10`          | Positive integer, capped at `100`.                                                                   |

#### Request Examples

```txt
GET /api/stocks/store/<store-id>
GET /api/stocks/store/<store-id>?q=indomie
GET /api/stocks/store/<store-id>?inStock=false
```

#### Return

```json
{
  "message": "Store stocks fetched successfully",
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "storeId": "uuid",
      "stock": 0,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "updatedAt": "2026-06-06T10:00:00.000Z",
      "deletedAt": null,
      "product": {
        "id": "uuid",
        "name": "Indomie Goreng",
        "slug": "indomie-goreng-1234",
        "categoryId": "uuid",
        "brand": "Indomie",
        "variant": "Original",
        "size": "85g",
        "description": "Instant fried noodle",
        "sku": "INS-IND-IND-ORI-85G",
        "price": 3500,
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z",
        "deletedAt": null,
        "category": {
          "id": "uuid",
          "name": "Instant Food"
        },
        "images": [
          {
            "id": "uuid",
            "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
            "position": 1
          }
        ]
      },
      "store": {
        "id": "uuid",
        "name": "Grocergo Kemang"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/stocks/store/:storeId/product/:slug`

Get exact stock for one product in one store. Returns `stock: 0` when the stock row exists with zero quantity.

#### Frontend Usage

Use this endpoint when the product detail page only needs availability for the currently selected store. This is lighter than fetching every store stock row from product detail.

#### Zod Contract

```ts
params = {
  storeId: uuid;
  slug: string;
}
```

#### Params

| Param     | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| `storeId` | uuid   | Yes      | Store ID.     |
| `slug`    | string | Yes      | Product slug. |

#### Return

```json
{
  "message": "Store product stock fetched successfully",
  "data": {
    "id": "uuid",
    "productId": "uuid",
    "storeId": "uuid",
    "stock": 0,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "store": {
      "id": "uuid",
      "name": "Grocergo Kemang",
      "latitude": "-6.260000",
      "longitude": "106.810000"
    },
    "product": {
      "id": "uuid",
      "name": "Indomie Goreng",
      "slug": "indomie-goreng-1234",
      "categoryId": "uuid",
      "brand": "Indomie",
      "variant": "Original",
      "size": "85g",
      "description": "Instant fried noodle",
      "sku": "INS-IND-IND-ORI-85G",
      "price": 3500,
      "category": {
        "id": "uuid",
        "name": "Instant Food"
      },
      "images": [
        {
          "id": "uuid",
          "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
          "position": 1
        }
      ]
    }
  }
}
```

## Cart

Cart endpoints are for logged-in users, not admin users.

### Cart Rules

- All cart endpoints require user `accessToken` verification.
- `POST /cart` validates selected store stock before adding an item.
- If the same product already exists in the cart, backend increments quantity.
- If a previously deleted cart item exists for the same product, backend restores it and increments quantity.
- `PATCH /cart/:cartItemId` updates item quantity directly. Current implementation does not re-check store stock on update.
- `DELETE /cart/:cartItemId` soft deletes the cart item.

### GET `/cart`

Get the current user's cart.

#### Frontend Usage

Use this for cart page, cart drawer, cart badge calculation, and checkout preparation. If `data.items` is empty or missing, render empty cart state.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
// no params, query, or body
```

#### Return

If the user has no cart yet:

```json
{
  "message": "Cart fetched successfully",
  "data": {
    "items": []
  }
}
```

If the user has a cart:

```json
{
  "message": "Cart fetched successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "items": [
      {
        "id": "uuid",
        "cartId": "uuid",
        "productId": "uuid",
        "quantity": 2,
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z",
        "deletedAt": null,
        "product": {
          "id": "uuid",
          "name": "Indomie Goreng",
          "slug": "indomie-goreng-1234",
          "categoryId": "uuid",
          "brand": "Indomie",
          "variant": "Original",
          "size": "85g",
          "description": "Instant fried noodle",
          "sku": "INS-IND-IND-ORI-85G",
          "price": 3500,
          "createdAt": "2026-06-06T10:00:00.000Z",
          "updatedAt": "2026-06-06T10:00:00.000Z",
          "deletedAt": null,
          "images": [
            {
              "id": "uuid",
              "productId": "uuid",
              "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
              "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
              "position": 1,
              "createdAt": "2026-06-06T10:00:00.000Z",
              "updatedAt": "2026-06-06T10:00:00.000Z",
              "deletedAt": null
            }
          ],
          "stocks": [
            {
              "id": "uuid",
              "productId": "uuid",
              "storeId": "uuid",
              "stock": 10,
              "createdAt": "2026-06-06T10:00:00.000Z",
              "updatedAt": "2026-06-06T10:00:00.000Z",
              "deletedAt": null
            }
          ],
          "discounts": []
        }
      }
    ]
  }
}
```

### POST `/cart`

Add a product to the current user's cart.

#### Frontend Usage

Use this from product card/detail add-to-cart button. Frontend should send the selected `storeId` so backend can validate stock for that store. Disable add-to-cart in UI when selected store stock is `0`, but still rely on backend validation.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
body = {
  productId: uuid;
  storeId: uuid;
  quantity: positiveInt;
}
```

#### Body

| Field       | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| `productId` | uuid   | Yes      | Product ID to add.                           |
| `storeId`   | uuid   | Yes      | Selected store ID used for stock validation. |
| `quantity`  | number | Yes      | Whole number, minimum `1`.                   |

#### Request Example

```json
{
  "productId": "product-uuid",
  "storeId": "store-uuid",
  "quantity": 2
}
```

#### Return

```json
{
  "message": "Item added to cart successfully"
}
```

#### Possible Errors

- `404` when product stock row does not exist in the selected store.
- `400` when selected store stock is lower than requested quantity or final accumulated cart quantity.

### PATCH `/cart/:cartItemId`

Update cart item quantity.

#### Frontend Usage

Use this from cart quantity stepper/input. Because current backend does not re-check stock on update, frontend should use cart product `stocks` or the store stock endpoint to prevent users from selecting an invalid quantity.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
params = {
  cartItemId: uuid;
}

body = {
  quantity: positiveInt;
}
```

#### Params

| Param        | Type | Required | Description   |
| ------------ | ---- | -------- | ------------- |
| `cartItemId` | uuid | Yes      | Cart item ID. |

#### Body

| Field      | Type   | Required | Description                |
| ---------- | ------ | -------- | -------------------------- |
| `quantity` | number | Yes      | Whole number, minimum `1`. |

#### Request Example

```json
{
  "quantity": 3
}
```

#### Return

```json
{
  "message": "Cart item updated successfully"
}
```

#### Possible Errors

- `404` when cart item does not exist or was deleted.
- `403` when cart item belongs to another user's cart.

### DELETE `/cart/:cartItemId`

Soft delete one cart item.

#### Frontend Usage

Use this for remove item action in cart UI. After success, remove item locally or refetch cart.

#### Auth

Requires regular user access token.

#### Zod Contract

```ts
params = {
  cartItemId: uuid;
}
```

#### Params

| Param        | Type | Required | Description   |
| ------------ | ---- | -------- | ------------- |
| `cartItemId` | uuid | Yes      | Cart item ID. |

#### Return

```json
{
  "message": "Cart item deleted successfully"
}
```

#### Possible Errors

- `404` when cart item does not exist or was deleted.
- `403` when cart item belongs to another user's cart.

## Admin Products

### Admin Scope Rule

- `superAdmin` can access all admin product data.
- Any requester with a `storeId` is scoped to products that have active stock rows in that store.
- Store-scoped mutation endpoints use the same scope check as admin detail. If the product is outside scope, frontend should expect `404`.
- Baseline seed keeps `storeAdmin` read-only.

### POST `/admin/product`

Create a product. Requires `product:create` permission.

#### Frontend Usage

Use this from the super admin product management create form. Send files with `multipart/form-data`. Do not send `slug` or `sku`; backend generates both.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:create` permission.

#### Zod Contract

```ts
body = {
  name: string;
  categoryId: uuid;
  brand?: string;
  variant?: string;
  size?: string;
  description?: string;
  price: positiveInt;
  positions: positiveInt[]; // min 1, max 5
}

files = {
  images: File[]; // min 1, max 5, max 1MB each
}
```

#### Content Type

`multipart/form-data`

#### Body

| Field         | Type     | Required | Description                                                                                                                                              |
| ------------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | string   | Yes      | Product name. Must be unique. Backend generates slug using `createSlug(name)`.                                                                           |
| `categoryId`  | uuid     | Yes      | Existing active category ID.                                                                                                                             |
| `brand`       | string   | No       | Brand name. Empty string becomes omitted.                                                                                                                |
| `variant`     | string   | No       | Variant. Empty string becomes omitted.                                                                                                                   |
| `size`        | string   | No       | Size. Empty string becomes omitted.                                                                                                                      |
| `description` | string   | No       | Description. Empty string becomes omitted.                                                                                                               |
| `price`       | number   | Yes      | Positive integer.                                                                                                                                        |
| `positions`   | number[] | Yes      | Positive integer image order. Accepts JSON array string `[1,2]`, comma string `1,2`, or repeated multipart fields. Must match image count and be unique. |
| `images`      | file[]   | Yes      | Field name must be `images`. Minimum 1, maximum 5. JPG, JPEG, PNG, GIF only. Each file max 1MB.                                                          |

#### Request Example

```txt
POST /api/admin/product
Content-Type: multipart/form-data

name=Indomie Goreng
categoryId=7b5f0c20-3e8f-4f39-a36c-2d94675cc3df
brand=Indomie
variant=Original
size=85g
description=Instant fried noodle
price=3500
positions=[1,2]
images=<file-1>
images=<file-2>
```

#### Return

```json
{
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Original",
    "size": "85g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-ORI-85G",
    "price": 3500,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z",
    "deletedAt": null,
    "category": {},
    "images": [
      {
        "id": "uuid",
        "productId": "uuid",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1,
        "createdAt": "2026-06-06T10:00:00.000Z",
        "updatedAt": "2026-06-06T10:00:00.000Z",
        "deletedAt": null
      }
    ]
  }
}
```

#### Upload Cleanup Contract

The backend uploads all images to Cloudinary in parallel with `Promise.all`. Uploaded `publicId`s are collected. If any upload fails, all successfully uploaded images are deleted. If the database create operation fails after upload, all uploaded images are deleted before the error is forwarded.

### GET `/admin/product`

Get paginated admin product list. Requires `product:read` permission.

#### Frontend Usage

Use this for admin product tables. It returns the same card shape as public product list. Store-scoped admins only see products stocked in their assigned store.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:read` permission.

#### Query

Same query options as `GET /products`.

#### Request Example

```txt
GET /api/admin/product?page=1&limit=10&q=indomie
```

#### Return

```json
{
  "message": "Admin products fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### PATCH `/admin/product/:slug/images/positions`

Reorder all active product images. Requires `productImage:update` permission. This endpoint does not upload or delete Cloudinary assets.

#### Frontend Usage

Use this only when frontend needs a lightweight save for reorder-only UI. For a full gallery editor that can add, remove, and reorder images in one save, prefer `PATCH /admin/product/:slug/images`.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `productImage:update` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}

body = {
  images: Array<{
    id: uuid;
    position: positiveInt;
  }>; // min 1, max 5
}
```

#### Params

| Param  | Type   | Required | Description           |
| ------ | ------ | -------- | --------------------- |
| `slug` | string | Yes      | Current product slug. |

#### Body

```json
{
  "images": [
    { "id": "image-id-1", "position": 1 },
    { "id": "image-id-2", "position": 2 }
  ]
}
```

Rules:

- `images` must include all active images owned by this product.
- Image IDs must be unique.
- Positions must be positive integers and unique.
- Maximum image count is 5.

#### Return

```json
{
  "message": "Product image positions updated successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "images": [
      {
        "id": "image-id-1",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1
      }
    ],
    "category": {},
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### PATCH `/admin/product/:slug/images`

Patch the final product gallery state. Requires `productImage:update` permission. This single endpoint can reorder existing images, soft delete removed existing images, and add new uploaded images.

Existing images that are not included in `existingImages` are soft deleted. Cloudinary assets for soft-deleted images are not destroyed immediately; they can be cleaned later by a scheduled job using `deletedAt` and `publicId`.

#### Frontend Usage

Use this for the main gallery editor. Keep gallery state locally. On save, send existing image IDs that should remain, plus any new files and positions. This lets frontend support add, remove, and reorder in one request.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `productImage:update` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}

body = {
  existingImages?: Array<{
    id: uuid;
    position: positiveInt;
  }>; // default []
  newImagePositions?: positiveInt[]; // default []
}

files = {
  images?: File[]; // max 5, max 1MB each
}
```

#### Params

| Param  | Type   | Required | Description           |
| ------ | ------ | -------- | --------------------- |
| `slug` | string | Yes      | Current product slug. |

#### Body

`multipart/form-data`

| Field               | Type        | Required | Description                                                                                                                      |
| ------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `existingImages`    | JSON string | No       | Final existing images to keep, ordered by desired `position`. Defaults to `[]`.                                                  |
| `images`            | file[]      | No       | New product image files. JPG, JPEG, PNG, GIF only. Each file max 1MB.                                                            |
| `newImagePositions` | number[]    | No       | Positions for uploaded `images`. Must match uploaded file count. Accepts JSON array, comma string, or repeated multipart fields. |

`existingImages` shape:

```json
[
  { "id": "existing-image-id-1", "position": 1 },
  { "id": "existing-image-id-2", "position": 2 }
]
```

Rules:

- Final active image count must be minimum 1 and maximum 5.
- `existingImages` IDs must belong to the product and must be unique.
- `newImagePositions` count must match uploaded `images` count.
- All final positions from existing and new images must be positive integers and unique.
- New images are uploaded to Cloudinary in parallel. If upload or DB operation fails, newly uploaded Cloudinary assets are deleted by `publicId`.

#### Request Example

```txt
PATCH /api/admin/product/indomie-goreng-1234/images
Content-Type: multipart/form-data

existingImages=[{"id":"image-id-2","position":1}]
images=<file>
newImagePositions=2
```

#### Return

```json
{
  "message": "Product images updated successfully",
  "data": {
    "id": "uuid",
    "slug": "indomie-goreng-1234",
    "images": [
      {
        "id": "image-id-2",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1
      },
      {
        "id": "new-image-id",
        "image": "https://res.cloudinary.com/demo/image/upload/product-new.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 2
      }
    ],
    "category": {},
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### PATCH `/admin/product/:slug`

Update product data. Requires `product:update` permission. `sku` is not accepted from frontend and is regenerated by backend after every update. If `name` changes, backend also regenerates `slug` using `createSlug(name)`.

#### Frontend Usage

Use this for product edit forms excluding gallery changes. If response slug changes because name changed, frontend should update route/state to the new slug returned by backend.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:update` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}

body = Partial<{
  name: string;
  categoryId: uuid;
  brand: string | null;
  variant: string | null;
  size: string | null;
  description: string | null;
  price: positiveInt;
}>; // at least one field required
```

#### Params

| Param  | Type   | Required | Description           |
| ------ | ------ | -------- | --------------------- |
| `slug` | string | Yes      | Current product slug. |

#### Body

At least one field is required.

| Field         | Type           | Required | Description                                                     |
| ------------- | -------------- | -------- | --------------------------------------------------------------- |
| `name`        | string         | No       | Product name. Must be unique. Regenerates product slug and SKU. |
| `categoryId`  | uuid           | No       | Existing active category ID. Regenerates SKU.                   |
| `brand`       | string or null | No       | Brand. Send `null` to clear. Regenerates SKU.                   |
| `variant`     | string or null | No       | Variant. Send `null` to clear. Regenerates SKU.                 |
| `size`        | string or null | No       | Size. Send `null` to clear. Regenerates SKU.                    |
| `description` | string or null | No       | Description. Send `null` to clear.                              |
| `price`       | number         | No       | Positive integer price.                                         |

#### Request Example

```json
{
  "name": "Indomie Goreng Jumbo",
  "brand": "Indomie",
  "variant": "Jumbo",
  "size": "120g",
  "price": 5000
}
```

#### Return

```json
{
  "message": "Product updated successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng Jumbo",
    "slug": "indomie-goreng-jumbo-5678",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Jumbo",
    "size": "120g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-JUM-120G",
    "price": 5000,
    "category": {},
    "images": []
  }
}
```

### GET `/admin/product/:slug`

Get admin product detail by slug. Requires `product:read` permission.

#### Frontend Usage

Use this for admin product detail/edit pages. It returns image IDs/public IDs, stock rows, stock history, and discounts needed by admin UI.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:read` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}
```

#### Params

| Param  | Type   | Required | Description   |
| ------ | ------ | -------- | ------------- |
| `slug` | string | Yes      | Product slug. |

#### Return

```json
{
  "message": "Admin product fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "categoryId": "uuid",
    "brand": "Indomie",
    "variant": "Original",
    "size": "85g",
    "description": "Instant fried noodle",
    "sku": "INS-IND-IND-ORI-85G",
    "price": 3500,
    "category": {},
    "images": [],
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### DELETE `/admin/product/:slug/images/:imageId`

Soft delete one active product image. Requires `productImage:delete` permission. Baseline seed assigns this permission to `superAdmin`.

Cloudinary assets are not destroyed immediately. Use a scheduled cleanup job later with `deletedAt` and `publicId` if needed.

#### Frontend Usage

Use this for single-image delete actions. Disable delete button when only one active image remains, because backend requires at least one active image.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `productImage:delete` permission.

#### Zod Contract

```ts
params = {
  slug: string;
  imageId: uuid;
}
```

#### Params

| Param     | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `slug`    | string | Yes      | Product slug.     |
| `imageId` | uuid   | Yes      | Product image ID. |

#### Rules

- Product must exist and be active.
- Image must belong to the product and be active.
- Product must still have at least one active image after deletion.

#### Return

```json
{
  "message": "Product image deleted successfully",
  "data": {
    "id": "uuid",
    "slug": "indomie-goreng-1234",
    "images": [
      {
        "id": "remaining-image-id",
        "image": "https://res.cloudinary.com/demo/image/upload/product.jpg",
        "publicId": "GROCERGO/PRODUCTS/indomie-goreng-1234/...",
        "position": 1
      }
    ],
    "category": {},
    "stocks": [],
    "stockHistories": [],
    "discounts": []
  }
}
```

### DELETE `/admin/product/:slug`

Soft delete product data. Requires `product:delete` permission. Baseline seed assigns this permission to `superAdmin`.

This soft deletes the product, active product image rows, and active product stock rows. It does not soft delete discounts, carts, transactions, or other modules. Cloudinary assets are not destroyed because the product delete is soft-delete.

#### Frontend Usage

Use this from super admin destructive action UI. After success, remove the product from admin lists or refetch the list. Public/product endpoints will no longer return this product because they filter `deletedAt: null`.

#### Auth

Requires `adminAccessToken` HTTP-only cookie and `product:delete` permission.

#### Zod Contract

```ts
params = {
  slug: string;
}
```

#### Params

| Param  | Type   | Required | Description   |
| ------ | ------ | -------- | ------------- |
| `slug` | string | Yes      | Product slug. |

#### Return

```json
{
  "message": "Product deleted successfully",
  "data": {
    "id": "uuid",
    "name": "Indomie Goreng",
    "slug": "indomie-goreng-1234",
    "images": [],
    "stocks": []
  }
}
```

## Error Status

| Status | Meaning                                                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | Invalid input, duplicate product name/SKU, invalid image payload, or deleting the last product image.                                   |
| `401`  | Missing or invalid admin token.                                                                                                         |
| `403`  | Admin does not have required permission or is not assigned to a required store.                                                         |
| `404`  | Category, product, product image, store, or stock was not found. For scoped admin access, outside-scope products may also return `404`. |
| `500`  | Cloudinary upload/delete cleanup or unexpected operation failed.                                                                        |
