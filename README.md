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

## Suggested Project Structure (Reference)

Your structure may vary, but this is a clean MVP layout that matches the configuration described above:

```
Final-Project-MVP/
  clinic.db
  clinic_test.db
  models/
    User.js
    Patient.js
    Encounter.js
  clinical-api-mvp/
    app.js
    server.js
    db.js
    seed.js
    tests/
    public/
    package.json
```

---

## MVP Requirements Checklist

-  3+ resource types with relationships (Users, Patients, Encounters)
-  Full CRUD for each resource type
-  REST conventions with correct HTTP methods and status codes
-  Error handling with meaningful messages
-  Basic middleware (JSON parsing + logging)
-  Seed script with realistic sample data
-  Initial Jest + Supertest tests
-  Clear README documentation
