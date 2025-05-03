# BioMini SDK Setup Guide

## 1. Download Required Software
- Download from Official Suprema Partner Portal (https://www.supremainc.com/partner/en/customer-support/technical-resources/sdk-download.asp)
  - Login required - Contact Suprema Support for access
  - Download Items:
    1. BioMini SDK for Windows (v2.9.8)
    2. Device Driver Package
    3. UFScanner Demo
  - Alternative Download Source:
    - Contact local Suprema distributor
    - Email: support@supremainc.com

## 2. Installation Steps

### A. Device Driver Installation
1. Run `BioStar2_Setup_{version}.exe`
2. Select Components:
   - BioStar 2 Device SDK
   - Device Driver
   - UFScanner
3. Default installation path: `C:\Program Files (x86)\BioStar 2\`

### B. Device Configuration
1. Connect BioMini device via USB
2. Open Device Manager
3. Verify under "Biometric Devices" → "Suprema BioMini"
4. Note the COM port number

## Service Configuration
1. Install BioMini SDK
2. Verify BioMini Agent is running on http://localhost:8084
3. Check Device Manager for proper device recognition

## 3. SDK Integration

### A. Environment Variables
```powershell
# Add to System Path
C:\Program Files (x86)\BioStar 2\SDK\bin
C:\Program Files (x86)\BioStar 2\SDK\lib

# Add New Variable
BIOSTAR_SDK_HOME=C:\Program Files (x86)\BioStar 2\SDK
```

### B. Port Configuration
```json
// C:\Program Files (x86)\BioStar 2\SDK\conf\config.json
{
  "server": {
    "port": 51212,
    "allowedOrigins": ["http://localhost:3000"]
  }
}
```

### C. Firewall Rules
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "BioStar Device" `
    -Direction Inbound `
    -LocalPort 51212 `
    -Protocol TCP `
    -Action Allow
```

## API Testing
```bash
# Test device connection
curl http://localhost:8084/api/devices

# Test capture
curl -X POST http://localhost:8084/api/capture \
  -H "Content-Type: application/json" \
  -d '{"imageQuality": 80}'
```

## 4. Testing Setup

### A. Using UFScanner
1. Open UFScanner
2. Click "Search" to find device
3. Click "Connect"
4. Test fingerprint capture

### B. Using API
```bash
# Test device connection
curl http://localhost:51212/api/devices/scan

# Test fingerprint capture
curl -X POST http://localhost:51212/api/devices/{deviceId}/fingerprint/scan
```

## 5. Troubleshooting

### Common Issues:
1. Device Not Found
   - Check USB connection
   - Verify driver installation
   - Restart BioStar 2 Device Service

2. Access Denied
   - Run as Administrator
   - Check firewall rules
   - Verify port configuration

3. Connection Failed
   - Verify service is running
   - Check port conflicts
   - Confirm SDK path setup

### Logs Location:
```
C:\Program Files (x86)\BioStar 2\SDK\logs\
```
