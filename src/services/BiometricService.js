import { VITE_WEBAGENT_PROXY_URL, VITE_WEBAGENT_URL } from "../assets/config";

class BiometricService {
    constructor() {
        this.baseUrl = VITE_WEBAGENT_URL || 'http://localhost:8084';
        this.baseProxyUrl = VITE_WEBAGENT_PROXY_URL || 'http://localhost:4000';

        // Debug the config values
        console.log('this.baseUrl:', this.baseUrl);
        console.log('this.baseProxyUrl:', this.baseProxyUrl);

        // Remove the /api from URLs since it's already in the API endpoint
        this.apiPrefix = '';

        this.isInitialized = false;
        this.deviceHandle = null;
        // this.pageId = Math.random().toString();
        this.sessionCreated = false;
        this.debugMode = true;
        this.scannerInfos = null;
        this.selectedDeviceIndex = 0;

        // Session management
        this.sessionId = null;

        // Restore session from storage if available
        this.sessionId = sessionStorage.getItem('biometric_session_id');
        this.sessionCreated = !!this.sessionId;

        this.logDebug('BiometricService initialized', {
            baseUrl: this.baseUrl,
            hasStoredSession: !!this.sessionId
        });
    }

    // Helper function for logging API calls in debug mode
    logDebug(message, data = null) {
        if (this.debugMode) {
            console.log(`BioMini WebAgent: ${message}`, data || '');
        }
    }
    async makeRequest(endpoint, options = {}, iscredentials = false) {
        try {
            // Ensure we have a session for non-ping requests
            if (!endpoint.includes('ping') && !endpoint.includes('createSessionID')) {
                await this.ensureSession();

                if (!this.sessionId) {
                    throw new Error('Failed to create biometric session');
                }
            }

            const url = `${endpoint}`;

            // Convert params to URLSearchParams
            const queryParams = new URLSearchParams();

            // Add session ID as username parameter (what the biometric service expects)
            if (this.sessionId && iscredentials) {
                queryParams.append('username', this.sessionId);
            }

            // Add dummy parameter to prevent caching - exactly as in working URL
            queryParams.append('dummy', Math.random().toString());

            // Add each parameter individually to match exact format of working URL
            if (options.params) {
                Object.entries(options.params).forEach(([key, value]) => {
                    queryParams.append(key, value);
                });
            }

            // Build the full URL in the same format as the working one
            const fullUrl = `${url}?${queryParams.toString()}`;
            this.logDebug(`Request to ${fullUrl}`);
            console.log('🔗 makeRequest URL:', fullUrl); // Debug log

            // Use fetch with no extra parameters except method
            const response = await fetch(fullUrl, {
                method: options.method || 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: iscredentials ? 'include' : 'omit'
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
    }    // Initialize a session ID
    async createSession() {
        try {
            this.cleanupSession();
            this.logDebug('Creating session ID');
            const response = await fetch(`${this.baseUrl}/api/createSessionID?dummy=${Math.random()}`);
            const data = await response.json();

            if (data && data.sessionId) {
                this.sessionId = data.sessionId;
                sessionStorage.setItem('biometric_session_id', data.sessionId);

                // Debug logs
                console.log('✅ Session created:', data.sessionId);
                console.log('✅ Stored in sessionStorage:', sessionStorage.getItem('biometric_session_id'));

                document.cookie = `username=${data.sessionId}; path=/; SameSite=None; Secure`;

                this.sessionCreated = true;
                this.logDebug('Session created successfully with ID:', data.sessionId);
                return true;
            }

            console.error('❌ Failed to create session:', data);
            this.logDebug('Failed to create session', data);
            return false;
        } catch (error) {
            console.error('❌ Session creation error:', error);
            this.logDebug('Session creation error', error);
            return false;
        }
    } async ensureSession() {
        if (!this.sessionId || !this.sessionCreated) {
            console.log('🔄 Creating new session...');
            const success = await this.createSession();
            if (!success) {
                console.error('❌ Failed to ensure session');
                return false;
            }
        }
        console.log('✅ Session ensured:', this.sessionId);
        return true;
    }

    // Clear session when needed
    clearSession() {
        this.sessionId = null;
        this.sessionCreated = false;
        sessionStorage.removeItem('biometric_session_id');
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Get current session status
    getSessionStatus() {
        return {
            hasSession: !!this.sessionId,
            sessionId: this.sessionId,
            created: this.sessionCreated
        };
    }    // Check if the service is running
    async checkServiceRunning() {
        try {
            const response = await fetch(`${this.baseUrl}/api/ping?dummy=${Math.random()}`);
            return response.ok;
        } catch (error) {
            this.logDebug('WebAgent service is not running or not accessible', error);
            return false;
        }
    }

    // Initialize the device (similar to Init function)
    async initializeDevice() {
        try {
            // Explicitly create session first - this is critical
            // const sessionCreated = await this.createSession();
            // if (!sessionCreated) {
            //     throw new Error('Failed to create session for device initialization');
            // }

            this.logDebug('Current cookies before init:', document.cookie);

            // Initialize device
            const response = await this.makeRequest(`${this.baseUrl}/api/initDevice`);
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
            await this.makeRequest(`${this.baseUrl}/api/uninitDevice`);
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

        const response = await this.makeRequest(`${this.baseUrl}/api/getScannerStatus`, {
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

        const response = await this.makeRequest(`${this.baseUrl}/api/startCapturing`, {
            params: {
                sHandle: this.deviceHandle,
                // id: this.pageId,
                resetTimer: 30000
            }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to start capturing');
        }

        return true;
    }    // Capture a single fingerprint
    async captureSingle() {
        if (!this.isInitialized || !this.deviceHandle) {
            await this.initializeDevice();
        }

        try {
            // Force session creation if not available
            if (!this.sessionId) {
                console.log('No session ID, creating...');
                await this.createSession();
            }

            // Get session ID from storage as backup
            const sessionId = this.sessionId || sessionStorage.getItem('biometric_session_id');

            if (!sessionId) {
                throw new Error('Unable to get session ID');
            }

            // Build URL with session ID parameter
            const url = new URL(`${this.baseProxyUrl}/api/captureSingle`);
            url.searchParams.append('dummy', Math.random());
            url.searchParams.append('sHandle', this.deviceHandle);
            // url.searchParams.append('id', this.pageId);
            url.searchParams.append('resetTimer', '30000');
            url.searchParams.append('username', sessionId); // Add session ID as username parameter

            console.log('🔗 Request URL:', url.toString());

            const captureResponse = await fetch(url.toString(), {
                method: 'GET',
                credentials: 'include',
                mode: 'cors'
            });
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

        const response = await this.makeRequest(`${this.baseProxyUrl}/api/autoCapture`, {
            params: {
                sHandle: this.deviceHandle,
                // id: this.pageId
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
            await this.makeRequest(`${this.baseUrl}/api/abortCapture`, {
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
            encryptKey: options.encryptKey || 1,
        };

        const response = await this.makeRequest(`${this.baseProxyUrl}/api/getTemplateData`, { params }, true);

        return response;
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
            compressionRatio: compressionRatio,
            width: 288,
            height: 300,
        };

        const response = await this.makeRequest(`${this.baseProxyUrl}/api/getImageData`, { params }, true);

        if (response.retValue != 0) {
            throw new Error(response.retString || 'Failed to get image data');
        }

        return {
            imageBase64: response.imageBase64,
            retValue: response.retValue,
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

        const response = await this.makeRequest(`${this.baseProxyUrl}/api/saveImageBuffer`, { params });

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

        const response = await this.makeRequest(`${this.baseUrl}/api/getParameters`, {
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

        const response = await this.makeRequest(`${this.baseUrl}/api/setParameters`, { params: requestParams });

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
            // id: this.pageId,
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
            // id: this.pageId,
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
            // id: this.pageId,
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
                // id: this.pageId,
                userSerialNo: userSerialNo,
                extractEx: 1,
                qualityLevel: 60
            }
        });

        if (response.retValue !== 0) {
            throw new Error(response.retString || 'Failed to update template');
        }

        return true;
    }    // Get full fingerprint image data with template and WSQ
    async captureFingerprint() {
        try {
            if (!this.isInitialized || !this.deviceHandle) {
                await this.initializeDevice();
            }

            // Force session creation if not available
            if (!this.sessionId) {
                console.log('No session ID, creating...');
                await this.createSession();
            }

            // Get session ID from storage as backup
            const sessionId = this.sessionId || sessionStorage.getItem('biometric_session_id');

            if (!sessionId) {
                throw new Error('Unable to get session ID');
            }


            // Step 1: Build URL with session ID parameter
            const url = new URL(`${this.baseProxyUrl}/api/captureSingle`);
            url.searchParams.append('dummy', Math.random());
            url.searchParams.append('sHandle', this.deviceHandle);
            url.searchParams.append('id', this.pageId);
            url.searchParams.append('resetTimer', '30000');
            url.searchParams.append('username', sessionId); // Add session ID as username parameter

            console.log('🔗 CaptureFingerprint URL:', url.toString());

            const captureResponse = await fetch(url.toString(), {
                method: 'GET',
                credentials: 'include',
                mode: 'cors'
            });

            const captureData = await captureResponse.json();

            console.log('Capture FingerPrint response:', captureData);

            if (captureData.retValue != 0) {
                this.logDebug('Capture failed:', captureData);
                throw new Error(captureData.retString || 'Capture failed');
            }
            const thresholdQuality = 80;

            // Step 2: Get the template data - use direct connection for this too
            const templateResponse = await this.getTemplateData({
                extractEx: 1,
                qualityLevel: thresholdQuality,
                encrypt: 0,
                encryptKey: 1
            }
            )

            console.log('Template response:', templateResponse);

            if (templateResponse.retValue != 0) {
                throw new Error(templateResponse.retString || 'Template extraction failed');
            }


            // Step 3: Get the image data in both formats (WSQ and BMP)
            const wsqResponse = await this.getImageData(3, 0.75); // WSQ format
            if (wsqResponse.retValue != 0) {
                throw new Error(wsqResponse.retString || 'WSQ extraction failed');
            }


            const imgResponse = await this.getImageData(1, 0.75); // BMP format
            if (imgResponse.retValue != 0) {
                throw new Error(imgResponse.retString || 'Image extraction failed');
            }


            return {
                success: true,
                template: templateResponse.templateBase64,
                quality: templateResponse.quality || thresholdQuality,
                wsq: wsqResponse.imageBase64,
                image: imgResponse.imageBase64
            };
        } catch (error) {
            console.error('Capture fingerprint error:', error);
            await this.abortCapture();
            throw error;
        }
    }    // Clear session data
    async cleanupSession() {
        if (!this.sessionCreated) return;

        try {
            await this.makeRequest(`${this.baseUrl}/api/sessionClear`, {
                params: {
                    // id: this.pageId
                }
            });

            // Use the new clearSession method
            this.clearSession();
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }
}

export default new BiometricService();