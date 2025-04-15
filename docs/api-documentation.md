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
  "userId" :"adeaf0b1-4c3d-4a2e-8b5c-7f3e9a6d1f2b",
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
- **Endpoint:** `${API_URL}/lockers/locker-master/{cabinetId}`
- **Method:** GET
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Response:**
```json
{
  "rooms": [
    {
      "room_number": "string",
      "cabinets": [
        {
          "cabinet_number": "string",
          "lockers": [
            {
              "locker_number": "string",
              "size": "string",
              "status": "available|occupied|maintenance",
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "rooms": ["string"],
    "types": ["string"]
  }
}
```

Notes:
- Status values can be: "available", "occupied", or "maintenance"
- Row and column values are used for grid layout
- Cabinet numbers and locker numbers are strings
- The response structure supports multiple rooms, each containing multiple cabinets
- Types in metadata represent available locker sizes

### Get Locker Rent Details
- **Endpoint:** `${API_URL}/lockers/lockers/rent`
- **Method:** POST
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer {token}
  - Accept: application/json
- **Query Parameters:**
  - lockerId: string (required)
- **Response:**
```json
{
  "lockerId": "number",
  "lockerNumber": "string",
  "type": "string",
  "center": "string",
  "plans": [
    {
      "planId": "string",
      "name": "string",
      "deposit": "string",
      "baseRent": "string",
      "admissionFees": "string",
      "totalAmount": "string",
      "grandTotalAmount": "string",
      "roundAmount": "string",
      "cgst": "string",
      "igst": "string",
      "sgst": "string",
      "grandTotalAmountInWords": "string"
    }
  ]
}
```

Note: 
- The API now returns multiple plans for a locker
- Each plan includes tax details (CGST, IGST, SGST)
- Amount fields are returned as strings to handle currency values
- The response includes the total amount in words
```

Note: All these APIs are currently mocked in the codebase and will need to be implemented on the backend. The actual API endpoints and response formats may need to be adjusted based on the backend implementation.
