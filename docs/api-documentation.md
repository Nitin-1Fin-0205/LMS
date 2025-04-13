# API Documentation

## Authentication API (Mocked)
### Validate Token
- **Endpoint:** `${API_URL}/api/auth/validate`
- **Method:** GET
- **Headers:** 
  - Authorization: Bearer {token}
- **Response:**
```json
{
  "valid": true,
  "role": "customer_executive"
}
```

## User Management APIs (Mocked)
### Get Users List
- **Endpoint:** `${API_URL}/api/users`
- **Method:** GET
- **Headers:**
  - Authorization: Bearer {token}
- **Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "center": "string",
    "email": "string",
    "role": "string"
  }
]
```

### Update User Role
- **Endpoint:** `${API_URL}/api/users/{userId}/role`
- **Method:** PATCH
- **Headers:**
  - Authorization: Bearer {token}
- **Request Body:**
```json
{
  "role": "string"
}
```
- **Response:** HTTP 200 OK

## Customer Management APIs (Mocked)
### Add Customer
- **Endpoint:** `${API_URL}`
- **Method:** POST
- **Headers:**  
  - Content-Type: application/json
  - Authorization: Bearer {token}
  - Accept: application/json
- **Request Body:**
```json
{
  "primaryHolder": {
    "customerInfo": {
      "photo": "base64string",
      "customerId": "string",
      "customerName": "string", 
      "fatherOrHusbandName": "string",
      "address": "string",
      "dateOfBirth": "string",
      "mobileNo": "string",
      "panNo": "string",
      "gender": "string",
      "emailId": "string",
      "documentNo": "string"
    },
    "lockerInfo": {
      "assignedLocker": "string",
      "center": "string",
      "remarks": "string"
    },
    "rentDetails": {
      "lockerNo": "string",
      "deposit": "string",  
      "rent": "string",
      "admissionFees": "string",
      "total": "string",
      "lockerKeyNo": "string",
      "contactNumber": "string",
      "moveInDate": "string",
      "anticipatedMoveOutDate": "string"
    }
  },
  "secondHolder": {
    // Similar structure as primaryHolder
  },
  "thirdHolder": {
    // Similar structure as primaryHolder  
  }
}
```
- **Response:** HTTP 201 Created

### Get Centers List
- **Endpoint:** `${API_URL}/api/centers`
- **Method:** GET
- **Headers:**
  - Authorization: Bearer {token}
  - Accept: application/json
- **Response:**
```json
[
  {
    "id": "number",
    "name": "string"
  }
]
```

### Get PAN Details (Mocked)
- **Endpoint:** `${API_URL}/api/pan-details` 
- **Method:** POST
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer {token}
  - Accept: application/json
- **Request Body:**
```json
{
  "panNo": "string"
}
```
- **Response:**
```json
{
  "status": "success",
  "data": {
    "customerId": "string",
    "customerName": "string",
    "fatherOrHusbandName": "string", 
    "address": "string",
    "dateOfBirth": "string",
    "mobileNo": "string"
  }
}
```

## Locker Management APIs (Mocked)
### Get Locker Data
- **Endpoint:** `${API_URL}/api/lockers`
- **Method:** GET
- **Headers:**
  - Authorization: Bearer {token}
- **Response:**
```json
{
  "cabinets": [
    {
      "cabinet_number": "number",
      "location": "string",
      "lockers": [
        {
          "locker_number": "string",
          "room_number": "string",
          "row": "number",
          "column": "number",
          "type": "string",
          "size": "string",
          "status": "available|occupied|maintenance"
        }
      ]
    }
  ],
  "metadata": {
    "rooms": ["string"],
    "types": [
      {
        "code": "string",  
        "name": "string"
      }
    ]
  }
}
```

### Assign Locker
- **Endpoint:** `${API_URL}/api/lockers/assign`
- **Method:** POST  
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Request Body:**
```json
{
  "customerId": "string",
  "lockerId": "string",
  "cabinetId": "number",
  "startDate": "string",
  "endDate": "string"
}
```
- **Response:**
```json
{
  "status": "success",
  "data": {
    "assignmentId": "string",
    "lockerNumber": "string",
    "cabinetNumber": "number",
    "assignedAt": "string"
  }
}
```

Note: All these APIs are currently mocked in the codebase and will need to be implemented on the backend. The actual API endpoints and response formats may need to be adjusted based on the backend implementation.
