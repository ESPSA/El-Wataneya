# Elwataneya API Endpoint Reference

This document provides a comprehensive list of all API endpoints required for the Elwataneya application backend. The base URL for all endpoints is assumed to be `http://localhost:3001/api`.

---

## Note on Image Handling

The frontend application handles image uploads directly to a third-party hosting service (IMGBB). The backend is **not** responsible for processing image files. It only receives and stores the final public URLs provided by the frontend. All endpoints that accept image data will expect it in the `imageUrls: string[]` field of the JSON body.

---

## 1. Authentication (`/auth`)

### `POST /auth/login`
- **Description**: Authenticates a user, artisan, or admin.
- **Request Body**: `{ "email": "...", "password": "...", "type": "user" | "artisan" | "admin" }`
- **Success Response (200)**: `{ "user": UserObject, "accessToken": "...", "refreshToken": "..." }`
- **Error Response (401)**: `{ "message": "Invalid credentials" }`

### `POST /auth/register`
- **Description**: Registers a new user or artisan.
- **Request Body**: `{ "name": "...", "email": "...", "password": "...", "type": "user" | "artisan" }`
- **Success Response (201)**: `UserObject`
- **Error Response (409)**: `{ "message": "User with this email already exists" }`

### `POST /auth/refresh`
- **Description**: Issues a new access token using a valid refresh token.
- **Request Body**: `{ "refreshToken": "..." }`
- **Success Response (200)**: `{ "user": UserObject, "accessToken": "..." }`
- **Error Response (401/403)**: If refresh token is invalid or expired.

---

## 2. Public Endpoints

### `GET /products`
- **Description**: Retrieves a list of all *approved* products.
- **Success Response (200)**: `Product[]`

### `GET /products/:id`
- **Description**: Retrieves a single *approved* product by its ID.
- **Success Response (200)**: `Product`
- **Error Response (404)**: Not Found.

### `GET /artisans`
- **Description**: Retrieves a list of all artisans.
- **Success Response (200)**: `Artisan[]`

### `GET /artisans/:id`
- **Description**: Retrieves a single artisan and their *active, approved* projects by ID.
- **Success Response (200)**: `Artisan`
- **Error Response (404)**: Not Found.

### `GET /projects`
- **Description**: Retrieves a list of all *active, approved* projects.
- **Success Response (200)**: `Project[]`

### `GET /projects/:id`
- **Description**: Retrieves a single *active, approved* project by its ID.
- **Success Response (200)**: `Project`
- **Error Response (404)**: Not Found.

### `GET /articles`
- **Description**: Retrieves a list of all *published* articles.
- **Success Response (200)**: `Article[]`

### `GET /articles/:id`
- **Description**: Retrieves a single *published* article by ID.
- **Success Response (200)**: `Article`
- **Error Response (404)**: Not Found.

### `GET /offers`
- **Description**: Retrieves a list of all active/scheduled offers.
- **Success Response (200)**: `Offer[]`

### `POST /contact`
- **Description**: Submits a message from the contact form.
- **Request Body**: `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
- **Success Response (200)**: `{ "success": true }`

---

## 3. Protected User/Artisan Endpoints

*(Requires a valid `accessToken` in `Authorization: Bearer <token>` header)*

### `GET /artisans/:artisanId/projects`
- **Protection**: Logged-in artisan (`artisanId` must match token).
- **Description**: Get all projects (including pending/inactive) for a specific artisan.
- **Success Response (200)**: `Project[]`

### `GET /artisans/:artisanId/projects/:projectId`
- **Protection**: Logged-in artisan (`artisanId` must match token).
- **Description**: Get a single project for a specific artisan.
- **Success Response (200)**: `Project`

### `POST /projects`
- **Protection**: Artisan only.
- **Description**: Creates a new project for the logged-in artisan. Defaults to `isActive: true`.
- **Request Body**: `Omit<Project, 'id' | 'status' | 'isActive'>` with `imageUrls: string[]`.
- **Success Response (201)**: `Project`

### `PUT /projects/:id`
- **Protection**: Artisan owner of the project.
- **Description**: Updates a project's details. Sets status to `pending` for re-approval.
- **Request Body**: `Partial<Omit<Project, 'id' | 'artisanId' | 'status' | 'isActive'>>`
- **Success Response (200)**: `Project`

### `PUT /projects/:id/activation`
- **Protection**: Artisan owner of the project.
- **Description**: Activates or deactivates a project's visibility.
- **Request Body**: `{ "isActive": boolean }`
- **Success Response (200)**: `Project`

### `PUT /users/:id/avatar`
- **Protection**: User owner (`id` must match token).
- **Description**: Updates the user's avatar URL.
- **Request Body**: `{ "newAvatarUrl": "..." }`
- **Success Response (200)**: `User`

### `PUT /artisans/:id/profile`
- **Protection**: Artisan owner (`id` must match token).
- **Description**: Updates the artisan's full profile details.
- **Request Body**: `{ "name": string, "phone": string, "bio": BilingualString, "location": BilingualString, "specialties": BilingualString[] }`
- **Success Response (200)**: `User` (the core user object, which will be updated in the AuthContext).

---

## 4. Admin Endpoints (`/admin`)

*(All require a valid Admin `accessToken`)*

### Products
- **`GET /admin/products`**: Get all products regardless of status.
- **`POST /admin/products`**: Create a new product. Body: `Omit<Product, 'id' | 'status'>` with `imageUrls: string[]`.
- **`GET /admin/products/:id`**: Get a single product by ID, regardless of status.
- **`PUT /admin/products/:id`**: Update a product's details. Body includes `imageUrls: string[]`.
- **`PUT /admin/products/:id/status`**: Update product status. Body: `{ "status": "approved" | "rejected" }`.
- **`DELETE /admin/products/:id`**: Delete a product permanently.

### Projects
- **`GET /admin/projects`**: Get all projects regardless of status.
- **`POST /admin/projects`**: Create a new project and assign it to an artisan. Body: `Omit<Project, 'id' | 'status'>` with `imageUrls: string[]`.
- **`GET /admin/projects/:id`**: Get a single project by ID, regardless of status.
- **`PUT /admin/projects/:id`**: Update a project's details. Body includes `imageUrls: string[]`.
- **`PUT /admin/projects/:id/status`**: Update project status. Body: `{ "status": "approved" | "rejected" }`.
- **`DELETE /admin/projects/:id`**: Delete a project permanently.

### Users & Artisans
- **`GET /admin/users`**: Get all users and artisans.
- **`DELETE /admin/users/:id`**: Delete a user or artisan account.

### Admins
- **`GET /admin/admins`**: (Primary Admin Only) Get all other admin accounts.
- **`POST /admin/admins`**: (Primary Admin Only) Create a new admin.
- **`DELETE /admin/admins/:id`**: (Primary Admin Only) Delete an admin account. (Note: This maps to `DELETE /admin/users/:id`).

### Offers
- **`POST /admin/offers`**: Create a new special offer.
- **`DELETE /admin/offers/:id`**: Delete an offer.

### Articles
- **`GET /admin/articles`**: Get all articles regardless of status.
- **`POST /admin/articles`**: Create a new article. Body: `Omit<Article, 'id' | 'authorName' | 'createdAt' | 'updatedAt'>`.
- **`GET /admin/articles/:id`**: Get a single article by ID, regardless of status.
- **`PUT /admin/articles/:id`**: Update an article's details. Body: `Partial<Omit<Article, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'>>`.
- **`DELETE /admin/articles/:id`**: Delete an article permanently.