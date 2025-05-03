const SDK_ENDPOINTS = {
    STATUS: '/api/isServiceRunning',
    INIT: '/api/initDevice',
    SCAN: '/api/scanFingerprint',
    MATCH: '/api/matchFingerprints'
};

class BiometricService {
    constructor() {
        this.deviceSerialNumber = null;
        this.isInitialized = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    async checkServiceRunning() {
        try {
            const response = await fetch(`/api/isServiceRunning`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return data.running || false;
        } catch (error) {
            console.error('Service check failed:', error);
            return false;
        }
    }

    async initializeDevice() {
        try {
            // Step 1: Create session ID first
            await this.createSession();

            // Step 2: Initialize device with proxy path
            // Add dummy parameter for cache busting
            const params = new URLSearchParams({
                dummy: Math.random().toString()
            });

            const response = await fetch(`/api/initDevice?${params}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Device initialization failed');
            }

            const data = await response.json();
            this.isInitialized = (data.retValue === 0);
            return {
                isConnected: this.isInitialized,
                deviceInfo: data.ScannerInfos?.[0]
            };
        } catch (error) {
            throw new Error('Failed to initialize device: ' + error.message);
        }
    }

    async createSession() {
        try {
            const response = await fetch('/api/createSessionID', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data?.sessionId) {
                document.cookie = `username=${data.sessionId}`;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Session creation failed:', error);
            return false;
        }
    }

    async validateSetup() {
        try {
            // Check service
            const serviceCheck = await this.checkServiceRunning();
            if (!serviceCheck) {
                throw new Error('BioStar service not running');
            }

            // Check SDK
            const sdkPath = process.env.BIOSTAR_SDK_HOME;
            if (!sdkPath) {
                throw new Error('SDK environment not configured');
            }

            // Check device connection
            await this.initializeDevice();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                fixes: this.getSetupFixes(error.message)
            };
        }
    }

    getSetupFixes(error) {
        const fixes = {
            'BioStar service not running': [
                'Open Services (services.msc)',
                'Start "BioStar 2 Device Service"'
            ],
            'SDK environment not configured': [
                'Set BIOSTAR_SDK_HOME environment variable',
                'Add SDK bin folder to PATH'
            ],
            'Device not connected': [
                'Check USB connection',
                'Verify driver installation',
                'Run UFScanner test'
            ]
        };
        return fixes[error] || ['Refer to BIOMETRIC_SETUP.md'];
    }

    async captureFingerprint(finger = 'R1', options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initializeDevice();
            }

            // Step 1: Start capture
            const startResponse = await fetch('/api/startCapturing', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                params: {
                    resetTimer: 30000
                }
            });

            if (!startResponse.ok) {
                throw new Error('Failed to start capture');
            }

            // Step 2: Capture single fingerprint
            const captureResponse = await fetch('/api/captureSingle', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!captureResponse.ok) {
                throw new Error('Capture failed');
            }

            // Step 3: Get template data
            const templateResponse = await fetch('/api/getTemplateData', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                params: {
                    extractEx: true,
                    qualityLevel: options.quality || 80
                }
            });

            const templateData = await templateResponse.json();

            if (templateData.retValue !== 0) {
                throw new Error('Template extraction failed');
            }

            return {
                template: templateData.templateBase64,
                quality: templateData.quality,
                finger,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            await this.abortCapture(); // Cleanup on error
            throw new Error('Capture failed: ' + error.message);
        }
    }

    async abortCapture() {
        try {
            await fetch('/api/abortCapture', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Abort capture failed:', error);
        }
    }

    async matchFingerprints(template1, template2) {
        try {
            const response = await fetch(`/api/matchFingerprints`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ template1, template2 })
            });

            const data = await response.json();
            return {
                matched: data.matched,
                score: data.score
            };
        } catch (error) {
            throw new Error('Fingerprint matching failed');
        }
    }
}

export default new BiometricService();
