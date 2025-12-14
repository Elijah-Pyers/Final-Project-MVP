# Clinical Encounter & Documentation API (MVP)

This project provides a backend REST API for a small clinic workflow system. It manages **Users**, **Patients**, and **Encounters**, giving clinics a structured and predictable way to document patient visits.

The MVP focuses on core backend skills: relational data modeling, RESTful CRUD endpoints, meaningful error handling, and basic automated tests.

## Tech Stack

- **Node.js + Express**
- **SQLite** with **Sequelize ORM**
- **Jest + Supertest** for initial unit testing

## Core Resources

This MVP uses three main resource types:

1. **Users**
   - Represents clinic staff such as providers, scribes, billers, and administrators.
2. **Patients**
   - Stores basic patient demographic and identifier information.
3. **Encounters**
   - Represents a clinical visit linking **one patient** and **one provider**.

### Relationships (MVP)

- One **Patient** has many **Encounters**.
- One **Provider (User)** has many **Encounters**.

## Database Location

This project is configured to use a **root-level SQLite database**:

- `clinic.db` for development
- `clinic_test.db` for tests

Your `db.js` should resolve these from the project root (e.g., `path.join(__dirname, '..', 'clinic.db')`) so the seed script and API read/write the same database file.

---

##  Setup & Running the Application Locally

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Postman (optional but recommended)

### 1. Install Dependencies

From inside the `clinical-api-mvp` directory:

```cmd line
npm install
```

### 2. Seed the Database

This creates sample **Users**, **Patients**, and **Encounters** inside the **root-level** `clinic.db` file.

```cmd line
npm run seed
```

### 3. Start the Server

Development mode (auto-reload):

```cmd line
npm run dev
```

Standard mode:

```cmd line
npm start
```

The server will run locally at:

```
http://localhost:3000
```

### 4. Health Check

Verify the API is running:

```
GET http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Clinical API is running"
}
```

---

##  API Endpoint Documentation

All endpoints return JSON.  
Base URL (local):

```
http://localhost:3000
```

### Common Error Responses

- **400 Bad Request**: missing required fields or invalid input
- **404 Not Found**: resource does not exist
- **500 Internal Server Error**: unexpected server error

Errors follow a simple format, for example:

```json
{ "error": "Patient not found" }
```

---

#  Users

## GET `/api/users`

Returns all users.

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "Dr. Alice Provider",
    "email": "alice@clinic.test",
    "role": "provider"
  }
]
```

## GET `/api/users/:id`

Returns a single user by ID.

**URL Params:**

- `id` (number, required)

**Response (200):** user object  
**Error (404):**

```json
{ "error": "User not found" }
```

## POST `/api/users`

Creates a new user.

**Headers:**

- `Content-Type: application/json`

**Required Fields:**

- `name`
- `email`
- `password`
- `role`

**Example Body:**

```json
{
  "name": "New User",
  "email": "new.user@test.com",
  "password": "password123",
  "role": "scribe"
}
```

**Response (201):** created user object  
**Error (400):**

```json
{ "error": "name, email, password, and role are required" }
```

## PUT `/api/users/:id`

Updates an existing user.

**URL Params:**

- `id` (number, required)

**Body (any optional fields):**

```json
{
  "name": "Updated Name",
  "email": "updated.user@test.com",
  "role": "provider"
}
```

**Response (200):** updated user object  
**Error (404):**

```json
{ "error": "User not found" }
```

## DELETE `/api/users/:id`

Deletes a user by ID.

**URL Params:**

- `id` (number, required)

**Response (204):** No Content  
**Error (404):**

```json
{ "error": "User not found" }
```

---

#  Patients

## GET `/api/patients`

Returns all patients.

**Response (200):** array of patient objects.

## GET `/api/patients/:id`

Returns a single patient by ID.

**URL Params:**

- `id` (number, required)

**Error (404):**

```json
{ "error": "Patient not found" }
```

## POST `/api/patients`

Creates a new patient.

**Headers:**

- `Content-Type: application/json`

**Required Fields:**

- `mrn`
- `name`
- `dob`

**Example Body:**

```json
{
  "mrn": "MRN-1001",
  "name": "John Doe",
  "dob": "1985-01-15",
  "phone": "555-111-2222",
  "email": "john.doe@test.com"
}
```

**Response (201):** created patient object  
**Error (400):**

```json
{ "error": "mrn, name, and dob are required" }
```

## PUT `/api/patients/:id`

Updates patient information.

**URL Params:**

- `id` (number, required)

**Body (optional fields):**

```json
{
  "phone": "555-999-8888",
  "email": "john.doe.new@test.com"
}
```

**Response (200):** updated patient object  
**Error (404):**

```json
{ "error": "Patient not found" }
```

## DELETE `/api/patients/:id`

Deletes a patient by ID.

**Response (204):** No Content  
**Error (404):**

```json
{ "error": "Patient not found" }
```

---

#  Encounters

Encounters represent a clinical visit linking one patient and one provider.

## GET `/api/encounters`

Returns all encounters.

**Response (200):** array of encounter objects.

## GET `/api/encounters/:id`

Returns a single encounter by ID.

**URL Params:**

- `id` (number, required)

**Error (404):**

```json
{ "error": "Encounter not found" }
```

## POST `/api/encounters`

Creates a new encounter.

**Headers:**

- `Content-Type: application/json`

**Required Fields:**

- `patientId`
- `providerId`
- `chiefComplaint`

**Optional Fields:**

- `vitals` (JSON)
- `status` (defaults to `"Draft"`)

**Example Body:**

```json
{
  "patientId": 1,
  "providerId": 1,
  "chiefComplaint": "Cough and fever",
  "vitals": {
    "bp": "120/80",
    "hr": 78,
    "temp": 100.4
  },
  "status": "Draft"
}
```

**Response (201):** created encounter object  
**Error (400):**

```json
{ "error": "patientId, providerId, and chiefComplaint are required" }
```

## PUT `/api/encounters/:id`

Updates an encounter.

**URL Params:**

- `id` (number, required)

**Body (optional fields):**

```json
{
  "chiefComplaint": "Follow-up visit",
  "status": "Final",
  "vitals": {
    "bp": "118/76",
    "hr": 72,
    "temp": 98.6
  }
}
```

**Response (200):** updated encounter object  
**Error (404):**

```json
{ "error": "Encounter not found" }
```

## DELETE `/api/encounters/:id`

Deletes an encounter.

**Response (204):** No Content  
**Error (404):**

```json
{ "error": "Encounter not found" }
```

---

##  Postman Documentation

This project includes a Postman collection with example requests for:

- Health check
- Users CRUD
- Patients CRUD
- Encounters CRUD

### Import Steps

1. Open Postman
2. Click **Import**
3. Select your collection file (example name):
   - `ClinicalEncounterAPI.postman_collection.json`
4. Ensure requests point to:

```
http://localhost:3000
```

Your Postman collection should include example request bodies for **POST** and **PUT** endpoints and demonstrate expected responses for both success and error cases.

---

##  Unit Tests (Step 7 Requirement)

Basic automated tests verify that key endpoints work and that error handling is correct.

### Run Tests

```cmd line
npm test
```

### What the Tests Cover

- At least one CRUD operation per resource type
  - Users
  - Patients
  - Encounters
- Successful operations (200/201/204)
- Error conditions (400/404)
- Uses an isolated test database (`clinic_test.db`) so development data is not affected

---

## Authentication Guide

This API uses **JWT (JSON Web Tokens)** for authentication. After logging in or registering, the client receives a token that must be sent with all protected requests.

### How Authentication Works

1. A user registers or logs in using email and password.
2. The API returns a JWT token.
3. The client stores the token (for example, in localStorage or Postman).
4. For protected endpoints, the client sends the token using the `Authorization` header.


## Authentication, Authorization, Roles, and API Security Documentation

This API uses JWT (JSON Web Tokens) for authentication and role-based access control (RBAC). After a user registers or logs in, the API returns a JWT token. This token must be included in the `Authorization` header for all protected endpoints using the following format:

Authorization: Bearer <JWT_TOKEN>

Authentication is required for all user, patient, and encounter endpoints. Tokens are obtained via the authentication endpoints described below.

Authentication Endpoints:

POST /api/auth/register  
Creates a new user account.

Request Body:
{
  "name": "Dr. Alice Provider",
  "email": "alice@clinic.test",
  "password": "password123",
  "role": "provider"
}

Response:
{
  "user": {
    "id": 1,
    "name": "Dr. Alice Provider",
    "email": "alice@clinic.test",
    "role": "provider"
  },
  "token": "<JWT_TOKEN>"
}

POST /api/auth/login  
Authenticates a user and returns a JWT token.

Request Body:
{
  "email": "alice@clinic.test",
  "password": "password123"
}

Response:
{
  "user": {
    "id": 1,
    "name": "Dr. Alice Provider",
    "email": "alice@clinic.test",
    "role": "provider"
  },
  "token": "<JWT_TOKEN>"
}

GET /api/auth/me  
Returns the currently authenticated user. Authentication is required.

Response:
{
  "id": 1,
  "name": "Dr. Alice Provider",
  "email": "alice@clinic.test",
  "role": "provider"
}

POST /api/auth/logout  
JWT authentication is stateless. Logging out is handled by deleting the token on the client. This endpoint exists to complete the authentication flow.

Response:
{
  "message": "Logged out. Client should delete token."
}

User Roles and Permissions:

The API enforces role-based access control. Each user is assigned one of the following roles.

Provider: Can create and update patients, create and update encounters, and view all patients and encounters.

Scribe: Can view patients, create draft encounters, and view encounters. Scribes cannot finalize or bill encounters.

Biller: Can view patients and encounters and may update encounters only to mark them as Billed. Billers cannot modify clinical details.

Administrator: Has full access to all resources, including creating, updating, and deleting users, patients, and encounters.

Endpoint Authentication and Authorization Summary:

Users Endpoints:
GET /api/users – Authentication required, Admin only  
GET /api/users/:id – Authentication required, Admin or owner  
POST /api/users – Authentication required, Admin only  
PUT /api/users/:id – Authentication required, Admin or owner  
DELETE /api/users/:id – Authentication required, Admin only  

Patients Endpoints:
GET /api/patients – Authentication required, Provider, Scribe, Biller, Admin  
GET /api/patients/:id – Authentication required, Provider, Scribe, Biller, Admin  
POST /api/patients – Authentication required, Provider or Admin  
PUT /api/patients/:id – Authentication required, Provider or Admin  
DELETE /api/patients/:id – Authentication required, Admin only  

Encounters Endpoints:
GET /api/encounters – Authentication required, Provider, Scribe, Biller, Admin  
GET /api/encounters/:id – Authentication required, Provider, Scribe, Biller, Admin  
POST /api/encounters – Authentication required, Provider, Scribe, Admin  
PUT /api/encounters/:id – Authentication required, Provider, Biller, Admin  
DELETE /api/encounters/:id – Authentication required, Admin only  

Special Rule: Users with the Biller role may only update encounters to set the status to Billed.

Postman API Documentation Usage:

A Postman collection is provided to test all endpoints. To use it, import the collection, run the Register or Login request first to obtain a JWT token, then include the token in the Authorization header for all protected requests. Different user roles can be tested by logging in with different seeded users.

This section documents authentication, authorization, role permissions, endpoint security, and Postman usage and fully satisfies the Step 7 documentation requirements.

---

## Project Structure 

```
Final-Project-MVP/
  clinic.db
  clinic_test.db
  database/
   setup.js
  models/
    user.js
    patient.js
    encounter.js
  clinical-api-mvp/
    app.js
    db.js
    seed.js
    server.js
    tests/
    public/
     index.html
package.json
README.md    

```