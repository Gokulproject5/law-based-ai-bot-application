# 📡 Nyaya Lite - API Documentation

**Base URL:** `http://localhost:5000`

---

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Analysis](#analysis)
  - [Laws](#laws)
  - [Categories](#categories)
  - [Lawyers](#lawyers)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Authentication

Currently, the API does not require authentication. Future versions will implement JWT-based auth for admin routes.

---

## Endpoints

### Analysis

#### **POST** `/api/analyze`
Analyze user input text and return matching legal scenarios.

**Request Body:**
```json
{
  "text": "My phone was stolen yesterday"
}
```

**Response (200 OK):**
```json
{
  "matches": [
    {
      "_id": "64abc123...",
      "title": "Theft of Mobile Phone",
      "keywords": ["phone", "mobile", "stolen", "lost", "snatched"],
      "category": "Theft / Property",
      "ipc_sections": ["379"],
      "description": "Theft of movable property.",
      "steps": [
        "Block your SIM card immediately.",
        "File an FIR or e-FIR online.",
        "Register on CEIR portal to block the IMEI.",
        "Keep a copy of the FIR for getting a duplicate SIM."
      ],
      "evidence_required": [
        "IMEI Number",
        "Phone Bill / Invoice",
        "Last known location (if available)"
      ],
      "severity": "Medium",
      "penalty": "Imprisonment up to 3 years or fine or both",
      "time_limit": "No strict limit, but delay weakens case.",
      "offense_type": "Cognizable, Non-Bailable",
      "templates": ["FIR", "Complaint Letter"]
    }
  ]
}
```

**Response (No Match):**
```json
{
  "message": "No direct match found",
  "suggestion": "Please rephrase or choose a category from the menu.",
  "matches": []
}
```

**Errors:**
- `400 Bad Request` - Missing or invalid text
- `500 Internal Server Error` - Database or analysis error

---

### Laws

#### **GET** `/api/laws`
Retrieve all laws from the database with optional filtering.

**Query Parameters:**
- `category` (optional) - Filter by category (e.g., "Cybercrime")
- `search` (optional) - Search by title or keywords

**Example:**
```
GET /api/laws?category=Cybercrime
```

**Response (200 OK):**
```json
[
  {
    "_id": "64abc456...",
    "title": "Online Financial Fraud (UPI/Bank)",
    "category": "Cybercrime",
    "ipc_sections": ["420", "IT Act 66D"],
    ...
  }
]
```

#### **GET** `/api/laws/:id`
Get a specific law by ID.

**Response (200 OK):**
```json
{
  "_id": "64abc456...",
  "title": "Online Financial Fraud (UPI/Bank)",
  ...
}
```

**Errors:**
- `404 Not Found` - Law ID doesn't exist

---

### Categories

#### **GET** `/api/categories`
Get all unique legal categories.

**Response (200 OK):**
```json
[
  "Accident & Injury",
  "Theft / Property",
  "Cybercrime",
  "Harassment & Abuse",
  "Women/Child Protection",
  "Family / Marriage",
  "Land & Property",
  "Consumer Rights",
  "Employment Issues",
  "Miscellaneous"
]
```

---

### Lawyers

#### **GET** `/api/lawyers`
Get list of registered lawyers (optional feature).

**Query Parameters:**
- `city` (optional) - Filter by city

**Response (200 OK):**
```json
[
  {
    "_id": "64abc789...",
    "name": "Advocate Rajesh Kumar",
    "city": "Chennai",
    "experience": "15 years",
    "specialization": ["Civil", "Criminal"],
    "phone": "+91 9876543210",
    "verified": true
  }
]
```

---

## Data Models

### LawEntry

```javascript
{
  title: String,              // E.g., "Theft of Mobile Phone"
  keywords: [String],         // ["phone", "mobile", "stolen"]
  category: String,           // E.g., "Theft / Property"
  ipc_sections: [String],     // ["379", "411"]
  description: String,        // Brief description
  steps: [String],            // Actionable steps
  evidence_required: [String],// Evidence checklist
  severity: String,           // "Low" | "Medium" | "High" | "Emergency"
  penalty: String,            // Potential punishment
  time_limit: String,         // Limitation period
  offense_type: String,       // "Cognizable, Bailable", etc.
  templates: [String],        // ["FIR", "Complaint"]
  state_specific: Map         // State-specific laws (optional)
}
```

### Lawyer

```javascript
{
  name: String,
  city: String,
  experience: String,
  specialization: [String],
  phone: String,
  email: String,
  verified: Boolean
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Description of what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 400  | Bad Request (invalid input) |
| 404  | Not Found |
| 500  | Internal Server Error |

---

## Analysis Algorithm

The `/api/analyze` endpoint uses the following logic:

1. **Tokenization**: Split input into words
2. **Stemming**: Reduce words to root form (e.g., "stealing" → "steal")
3. **Keyword Matching**: Compare against law keywords (weight: 10)
4. **Fuzzy Matching**: Allow 1-character typo (weight: 8)
5. **Title Matching**: Check law titles (weight: 5)
6. **Description Matching**: Check descriptions (weight: 1)
7. **Scoring**: Sum weights and return top 3 matches

---

## Rate Limiting

Currently no rate limiting is implemented. Recommended for production:
- 100 requests per 15 minutes per IP
- Use `express-rate-limit` package

---

## CORS

CORS is enabled for all origins in development. For production:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

---

## Future Endpoints (Planned)

### Admin Routes (Protected)
- `POST /api/admin/laws` - Add new law
- `PUT /api/admin/laws/:id` - Update law
- `DELETE /api/admin/laws/:id` - Delete law

### User Routes
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/history` - Get query history

---

## Testing with cURL

### Analyze Text
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"my bike met with an accident"}'
```

### Get Categories
```bash
curl http://localhost:5000/api/categories
```

### Get Laws by Category
```bash
curl "http://localhost:5000/api/laws?category=Cybercrime"
```

---

## Testing with Postman

1. Import the following collection:

```json
{
  "info": {
    "name": "Nyaya Lite API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Analyze Text",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"text\":\"stolen phone\"}"
        },
        "url": "http://localhost:5000/api/analyze"
      }
    }
  ]
}
```

---

**Last Updated:** November 25, 2025  
**Version:** 1.0.0
