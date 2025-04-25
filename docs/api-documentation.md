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
### Create Customer Basic Info
- **Endpoint:** `${API_URL}/customers/add`
- **Method:** POST
- **Headers:**  
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Request Body:**
```json
{
  "customerInfo": {
    "photo": "base64string",
    "customerName": "string",
    "fatherOrHusbandName": "string",
    "dateOfBirth": "string",
    "gender": "string",
    "mobileNo": "string",
    "emailId": "string",
    "panNo": "string",
    "documentNo": "string",
    "address": "string"
  }
}
```
- **Response:**
```json
{
  "customerId": "string",
  "message": "Customer created successfully"
}
```

### Update Customer Basic Info
- **Endpoint:** `${API_URL}/customers/{customerId}/update`
- **Method:** PUT
- **Headers:**  
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Request Body:** Same as Create Customer
- **Response:**
```json
{
  "message": "Customer updated successfully"
}
```

### Upload Customer Attachments
- **Endpoint:** `${API_URL}/customers/{customerId}/attachments`
- **Method:** POST
- **Headers:**
  - Content-Type: multipart/form-data
  - Authorization: Bearer {token}
- **Request Body:**
```json
{
  "category": "identityProof|addressProof|contactDocument|otherDocument",
  "file": "File"
}
```

### Delete Customer Attachment
- **Endpoint:** `${API_URL}/customers/{customerId}/attachments/{attachmentId}`
- **Method:** DELETE
- **Headers:**
  - Authorization: Bearer {token}
- **Response:** HTTP 204 No Content

### Add Biometric Data
- **Endpoint:** `${API_URL}/customers/{customerId}/biometric`
- **Method:** POST
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Request Body:**
```json
{
  "fingerprints": ["base64string"],
  "device": {
    "id": "string",
    "type": "string"
  }
}
```

### Add Secondary/Third Holder
- **Endpoint:** `${API_URL}/customers/secondary-holder/add`
- **Method:** POST 
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Request Body:** Same structure as Add Customer Basic Info
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

### Get PAN Details Through OCR
- **Endpoint:** `${API_URL}/api/pan-details/ocr`
- **Method:** POST
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer {token}
  - Accept: application/json
- **Request Body:**
```json
{
  "image": "base64string"
}
```
- **Response:**
```json
{
  "status": "success",
  "data": {
    "panNo": "string",
    "customerName": "string",
    "fatherOrHusbandName": "string",
    "dateOfBirth": "string"
  }
}
```

Notes:
- The `image` field should contain the base64-encoded string of the PAN card image.
- The API extracts PAN details using OCR and returns the parsed information.
- Ensure the image is clear and properly formatted for accurate OCR results.

### Get Customer Complete Details
- **Endpoint:** `${API_URL}/customers/{customerId}`
- **Method:** GET
- **Headers:**
  - Authorization: Bearer {token}
  - Accept: application/json
- **Response:**
```json
{
  "customerId": "string",
  "status": "success",
  "data": {
    "customerInfo": {
      "photo": "base64string",
      "customerId": "string",
      "customerName": "string",
      "fatherOrHusbandName": "string",
      "dateOfBirth": "string",
      "gender": "string",
      "mobileNo": "string",
      "emailId": "string",
      "panNo": "string",
      "documentNo": "string",
      "address": "string",
      "status": "string"
    },
    "attachments": {
      "identityProof": [],
      "addressProof": [],
      "contactDocument": [],
      "otherDocument": []
    },
    "biometric": {
      "fingerprints": []
    },
    "lockerDetails": {
      "lockerId": "string",
      "lockerNumber": "string",
      "center": "string",
      "status": "string"
    },
    "secondaryHolders": [],
    "thirdHolders": []
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
