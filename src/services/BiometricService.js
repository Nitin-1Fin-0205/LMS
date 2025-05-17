const SDK_ENDPOINTS = {
    STATUS: '/api/isServiceRunning',
    INIT: '/api/initDevice',
    SCAN: '/api/scanFingerprint',
    MATCH: '/api/matchFingerprints'
};

class BiometricService {
    constructor() {
        // Use the Vite proxy URL instead of direct connection
        this.baseUrl = '/api'; // This will use the proxy defined in vite.config.js
        this.isInitialized = false;
        this.deviceHandle = null;
        this.pageId = Math.random().toString();
        this.sessionCreated = false;
        this.debugMode = true;
        this.scannerInfos = null;
        this.selectedDeviceIndex = 0;
    }

    // Helper function for logging API calls in debug mode
    logDebug(message, data = null) {
        if (this.debugMode) {
            console.log(`BioMini WebAgent: ${message}`, data || '');
        }
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;

            // Convert params to URLSearchParams
            const queryParams = new URLSearchParams();

            // Add each parameter individually to match exact format of working URL
            if (options.params) {
                Object.entries(options.params).forEach(([key, value]) => {
                    queryParams.append(key, value);
                });
            }

            // Add dummy parameter to prevent caching - exactly as in working URL
            queryParams.append('dummy', Math.random().toString());

            // Build the full URL in the same format as the working one
            const fullUrl = `${url}?${queryParams.toString()}`;
            this.logDebug(`Request to ${fullUrl}`);

            // Use fetch with no extra parameters except method
            const response = await fetch(fullUrl, {
                method: options.method || 'GET',
                headers: {
                    'Accept': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();
            this.logDebug(`Response from ${endpoint}:`, data);
            return data;
        } catch (error) {
            this.logDebug(`Error in ${endpoint}:`, error);
            throw new Error(`Biometric service error: ${error.message}`);
        }
    }

    // Initialize a session ID
    async createSession() {
        try {
            this.logDebug('Creating session ID');
            const response = await fetch(`${this.baseUrl}/api/createSessionID?dummy=${Math.random()}`);
            const data = await response.json();

            if (data && data.sessionId) {
                // Format expiration exactly as in the working example
                const date = new Date();
                date.setTime(date.getTime() + 60 * 60 * 1000);

                // Set cookie exactly as in the working example - note the path=/
                document.cookie = `username=${data.sessionId}; expires=${date.toUTCString()};`;
                this.sessionCreated = true;
                this.logDebug('Session created successfully with ID:', data.sessionId);
                return true;
            }

            this.logDebug('Failed to create session', data);
            return false;
        } catch (error) {
            this.logDebug('Session creation error', error);
            return false;
        }
    }

    // Check if the service is running
    async checkServiceRunning() {
        try {
            // Try to create a session as that's the first API call to check
            return await this.createSession();
        } catch (error) {
            this.logDebug('WebAgent service is not running or not accessible', error);
            return false;
        }
    }

    // Initialize the device (similar to Init function)
    async initializeDevice() {
        try {
            // // Explicitly create session first - this is critical
            // const sessionCreated = await this.createSession();
            // if (!sessionCreated) {
            //     throw new Error('Failed to create session for device initialization');
            // }

            this.logDebug('Current cookies before init:', document.cookie);

            // Initialize device
            const response = await this.makeRequest('/api/initDevice');
            this.logDebug('Init device response:', response);

            // if (response.retValue !== 0) {
            //     throw new Error(response.retString || 'Failed to initialize device');
            // }

            if (!response.ScannerInfos || response.ScannerInfos.length === 0) {
                throw new Error('No biometric devices found');
            }

            // Store all scanner infos and set device handle
            this.scannerInfos = response.ScannerInfos;
            this.deviceHandle = response.ScannerInfos[this.selectedDeviceIndex].DeviceHandle;
            this.isInitialized = true;

            return {
                success: true,
                deviceInfo: response.ScannerInfos[this.selectedDeviceIndex]
            };
        } catch (error) {
            this.isInitialized = false;
            this.deviceHandle = null;
            throw error;
        }
    }

    // Uninitialize device
    async uninitializeDevice() {
        if (!this.isInitialized) return;

        try {
            await this.makeRequest('/api/uninitDevice');
            this.isInitialized = false;
            this.deviceHandle = null;
            this.scannerInfos = null;
        } catch (error) {
            console.error('Failed to uninitialize device:', error);
        }
    }

    // Get scanner status
    async getScannerStatus() {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const response = await this.makeRequest('/api/getScannerStatus', {
            params: {
                sHandle: this.deviceHandle
            }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to get scanner status');
        }

        return {
            sensorValid: response.SensorValid === "true",
            sensorOn: response.SensorOn === "true",
            isCapturing: response.IsCapturing === "true",
            isFingerOn: response.IsFingerOn === "true"
        };
    }

    // Start capturing (preview mode)
    async startCapturing() {
        if (!this.isInitialized || !this.deviceHandle) {
            await this.initializeDevice();
        }

        const response = await this.makeRequest('/api/startCapturing', {
            params: {
                sHandle: this.deviceHandle,
                id: this.pageId,
                resetTimer: 30000
            }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to start capturing');
        }

        return true;
    }

    // Capture a single fingerprint
    async captureSingle() {
        if (!this.isInitialized || !this.deviceHandle) {
            await this.initializeDevice();
        }

        try {
            // // Create/verify session before capture
            // const sessionCreated = await this.createSession();
            // if (!sessionCreated) {
            //     throw new Error('Session creation failed');
            // }

            this.logDebug('Current cookies before capture:', document.cookie);

            // Very important: build URL exactly in the format that works
            const captureUrl = `${this.baseUrl}/captureSingle?sHandle=${this.deviceHandle}&id=${this.pageId}&resetTimer=30000&dummy=${Math.random()}`;
            this.logDebug(`Sending direct request to: ${captureUrl}`);

            const captureResponse = await fetch(captureUrl);
            const captureData = await captureResponse.json();

            if (captureData.retValue !== 0) {
                this.logDebug('Capture failed:', captureData);
                throw new Error(captureData.retString || 'Capture failed');
            }

            return true;
        } catch (error) {
            await this.abortCapture();
            throw error;
        }
    }

    // Auto capture
    async autoCapture() {
        if (!this.isInitialized || !this.deviceHandle) {
            await this.initializeDevice();
        }

        const response = await this.makeRequest('/api/autoCapture', {
            params: {
                sHandle: this.deviceHandle,
                id: this.pageId
            }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to auto capture');
        }

        return true;
    }

    // Abort capture
    async abortCapture() {
        if (!this.deviceHandle) return;

        try {
            await this.makeRequest('/api/abortCapture', {
                params: {
                    sHandle: this.deviceHandle,
                    resetTimer: 30000
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to abort capture:', error);
            return false;
        }
    }

    // Get template data
    async getTemplateData(options = {}) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const params = {
            sHandle: this.deviceHandle,
            id: this.pageId,
            extractEx: options.extractEx || 1,
            qualityLevel: options.qualityLevel || 60,
            encrypt: options.encrypt || 0,
            encryptKey: options.encryptKey || ''
        };

        const response = await this.makeRequest('/api/getTemplateData', { params });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to get template data');
        }

        return {
            templateBase64: response.templateBase64,
            quality: response.quality || 0
        };
    }

    // Get image data (in different formats)
    async getImageData(fileType = 1, compressionRatio = 0.75) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const params = {
            sHandle: this.deviceHandle,
            id: this.pageId,
            fileType: fileType, // 1=BMP, 2=ISO19794, 3=WSQ
            compressionRatio: compressionRatio
        };

        const response = await this.makeRequest('/api/getImageData', { params });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to get image data');
        }

        return {
            imageBase64: response.imageBase64
        };
    }

    // Save image buffer to a file on server
    async saveImageBuffer(fileType = 1, compressionRatio = 0.75) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const params = {
            sHandle: this.deviceHandle,
            id: this.pageId,
            fileType: fileType,
            compressionRatio: compressionRatio
        };

        const response = await this.makeRequest('/api/saveImageBuffer', { params });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to save image buffer');
        }

        return true;
    }

    // Get parameters
    async getParameters() {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const response = await this.makeRequest('/api/getParameters', {
            params: { sHandle: this.deviceHandle }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to get parameters');
        }

        return {
            brightness: response.brightness,
            sensitivity: response.sensitivity,
            fastmode: response.fastmode === 1,
            securitylevel: response.securitylevel,
            timeout: response.timeout,
            templateType: response.TemplateType,
            fakeLevel: response.fakeLevel,
            detectFakeAdvancedMode: response.detectFakeAdvancedMode === 1
        };
    }

    // Set parameters
    async setParameters(params) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const requestParams = {
            sHandle: this.deviceHandle,
            ...params
        };

        const response = await this.makeRequest('/api/setParameters', { params: requestParams });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to set parameters');
        }

        return {
            unsupportedVariables: response.unsupportedVariables
        };
    }

    // Database operations: enroll template
    async enroll(options) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const params = {
            sHandle: this.deviceHandle,
            id: this.pageId,
            userID: options.userId,
            userSerialNo: options.userSerialNo || 0,
            selectTemplate: options.selectTemplate || 0,
            encrypt: options.encrypt || 0,
            encryptKey: options.encryptKey || '',
            extractEx: options.extractEx || 1,
            qualityLevel: options.qualityLevel || 60
        };

        const response = await this.makeRequest('/db/enroll', { params });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to enroll');
        }

        return true;
    }

    // Database operations: verify template
    async verify(userSerialNo) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const params = {
            sHandle: this.deviceHandle,
            id: this.pageId,
            userSerialNo: userSerialNo,
            extractEx: 1,
            qualityLevel: 60
        };

        const response = await this.makeRequest('/db/verify', { params });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to verify');
        }

        return {
            verified: response.retVerify === true
        };
    }

    // Database operations: identify user
    async identify() {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const params = {
            sHandle: this.deviceHandle,
            id: this.pageId,
            extractEx: 1,
            qualityLevel: 60
        };

        const response = await this.makeRequest('/db/identify', { params });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to identify');
        }

        return {
            matchedIndex: response.matchedIndex,
            matchedID: response.matchedID
        };
    }

    // Abort identification
    async abortIdentify() {
        try {
            const response = await this.makeRequest('/db/abortIdentify');
            return response.retValue === 0;
        } catch (error) {
            console.error('Failed to abort identify:', error);
            return false;
        }
    }

    // Query user data
    async queryData() {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const response = await this.makeRequest('/db/queryData', {
            params: { sHandle: this.deviceHandle }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to query data');
        }

        return {
            users: response.db
        };
    }

    // Delete user template
    async deleteTemplate(userSerialNo) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const response = await this.makeRequest('/db/delete', {
            params: {
                sHandle: this.deviceHandle,
                userSerialNo: userSerialNo
            }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to delete template');
        }

        return true;
    }

    // Delete all templates
    async deleteAllTemplates() {
        const response = await this.makeRequest('/db/deleteAll');

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to delete all templates');
        }

        return true;
    }

    // Update template
    async updateTemplate(userSerialNo) {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const response = await this.makeRequest('/db/update', {
            params: {
                sHandle: this.deviceHandle,
                id: this.pageId,
                userSerialNo: userSerialNo,
                extractEx: 1,
                qualityLevel: 60
            }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to update template');
        }

        return true;
    }

    // Get full fingerprint image data with template and WSQ
    async captureFingerprint() {
        try {
            if (!this.isInitialized || !this.deviceHandle) {
                await this.initializeDevice();
            }

            // // Create/verify session before capture
            // const sessionCreated = await this.createSession();
            // if (!sessionCreated) {
            //     throw new Error('Session creation failed');
            // }

            this.logDebug('Current cookies before capture:', document.cookie);
            this.logDebug(`Capturing with handle: ${this.deviceHandle}, pageId: ${this.pageId}`);

            // Step 1: Capture the fingerprint with captureSingle
            const captureUrl = `${this.baseUrl}/captureSingle?dummy=${Math.random()}&sHandle=${this.deviceHandle}&id=${this.pageId}&resetTimer=30000`;

            const captureResponse = await fetch(captureUrl);
            const captureData = await captureResponse.json();

            console.log('Capture response:', captureData);

            if (captureData.retValue !== 0) {
                this.logDebug('Capture failed:', captureData);
                throw new Error(captureData.retString || 'Capture failed');
            }

            // Step 2: Get the template data from the captured fingerprint
            const templateResponse = await this.makeRequest('/api/getTemplateData', {
                params: {
                    sHandle: this.deviceHandle,
                    id: this.pageId,
                    extractEx: 1,
                    qualityLevel: 60 // Quality threshold
                }
            });

            if (templateResponse.retValue !== 0) {
                throw new Error(templateResponse.retString || 'Template extraction failed');
            }

            // Step 3: Get the image data in both formats (WSQ and BMP)
            const wsqResponse = await this.makeRequest('/api/getImageData', {
                params: {
                    sHandle: this.deviceHandle,
                    id: this.pageId,
                    fileType: 3, // WSQ format
                    compressionRatio: 0.75
                }
            });

            const imgResponse = await this.makeRequest('/api/getImageData', {
                params: {
                    sHandle: this.deviceHandle,
                    id: this.pageId,
                    fileType: 1, // BMP format
                    compressionRatio: 1.0
                }
            });

            return {
                success: true,
                template: templateResponse.templateBase64,
                quality: templateResponse.quality || 80,
                wsq: wsqResponse.imageBase64,
                image: imgResponse.imageBase64
            };
        } catch (error) {
            console.error('Capture fingerprint error:', error);
            await this.abortCapture();
            throw error;
        }
    }

    // Clear session data
    async cleanupSession() {
        if (!this.sessionCreated) return;

        try {
            await this.makeRequest('/api/sessionClear', {
                params: {
                    id: this.pageId
                }
            });

            // Clear cookie
            document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            this.sessionCreated = false;
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }
}

export default new BiometricService();