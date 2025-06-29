import { VITE_WEBAGENT_PROXY_URL, VITE_WEBAGENT_URL } from "../assets/config";

class BiometricService {
    constructor() {
        // this.baseProxyUrl = VITE_WEBAGENT_URL || 'http://localhost:8084';
        this.baseProxyUrl = VITE_WEBAGENT_PROXY_URL || 'http://localhost:4000';
        this.apiPrefix = '';
        this.isInitialized = false;
        this.deviceHandle = null;
        this.debugMode = true;
        this.scannerInfos = null;
        this.selectedDeviceIndex = 0;
        this.logDebug('BiometricService initialized', {
            baseProxyUrl: this.baseProxyUrl
        });
    }

    // Helper function for logging API calls in debug mode
    logDebug(message, data = null) {
        if (this.debugMode) {
            console.log(`BioMini WebAgent: ${message}`, data || '');
        }
    }

    // Check if device is connected (stateless, new API)
    async isDeviceConnected() {
        try {
            const response = await fetch(`${this.baseProxyUrl}/bio/device-info`);
            const data = await response.json();
            this.logDebug('Device info:', data);
            return data.success && Array.isArray(data.info) && data.info.length > 0;
        } catch (error) {
            this.logDebug('Device info error:', error);
            return false;
        }
    }


    // Get scanner status
    async getScannerStatus() {
        if (!this.isInitialized || !this.deviceHandle) {
            throw new Error('Device not initialized');
        }

        const response = await this.makeRequest(`${this.baseProxyUrl}/api/getScannerStatus`, {
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

        const response = await this.makeRequest(`${this.baseProxyUrl}/api/startCapturing`, {
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
    }

    // Capture a single fingerprint (stateless, new API)
    async captureSingle() {
        const deviceConnected = await this.isDeviceConnected();
        if (!deviceConnected) {
            throw new Error('No biometric device connected');
        }
        try {
            const response = await fetch(`${this.baseProxyUrl}/bio/capture-fingerprint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{}'
            });
            const data = await response.json();
            this.logDebug('Capture fingerprint response:', data);

            if (!data.success) {
                throw new Error(data.message || 'Fingerprint capture failed');
            }

            return {
                bmpBase64: data.bmpBase64,
                tplBase64: data.tplBase64,
                bmpPath: data.bmpPath,
                tplPath: data.tplPath,
                duration: data.duration,
                timestamp: data.timestamp
            };
        } catch (error) {
            this.logDebug('Capture fingerprint error:', error);
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
            await this.makeRequest(`${this.baseProxyUrl}/api/abortCapture`, {
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

    // Capture full fingerprint image data with template and WSQ (stateless, new API)
    async captureFingerprint() {
        const deviceConnected = await this.isDeviceConnected();
        if (!deviceConnected) {
            throw new Error('No biometric device connected');
        }
        try {
            const response = await fetch(`${this.baseProxyUrl}/bio/capture-fingerprint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{}'
            });
            const data = await response.json();
            this.logDebug('Capture fingerprint response:', data);

            if (!data.success) {
                throw new Error(data.message || 'Fingerprint capture failed');
            }

            return {
                success: true,
                template: data.tplBase64,
                wsq: data.wsqBase64,
                image: data.bmpBase64,
                bmpPath: data.bmpPath,
                tplPath: data.tplPath,
                duration: data.duration,
                timestamp: data.timestamp
            };
        } catch (error) {
            this.logDebug('Capture fingerprint error:', error);
            throw error;
        }
    }

    // Get fingerprint template quality (stateless, new API)
    async getTemplateQuality(templateBase64) {
        try {
            const response = await fetch(`${this.baseProxyUrl}/bio/quality`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template: templateBase64 })
            });
            const data = await response.json();
            this.logDebug('Template quality response:', data);
            return data;
        } catch (error) {
            this.logDebug('Template quality error:', error);
            throw error;
        }
    }

}

export default new BiometricService();