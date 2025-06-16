class ElectronBiometricService {
    constructor() {
        this.isInitialized = false;
        this.deviceHandle = null;
        this.pageId = Math.random().toString();
        this.debugMode = true;
        this.scannerInfos = null;
        this.selectedDeviceIndex = 0;
        this.isElectron = window.electronAPI?.isElectron || false;
    }

    logDebug(message, data = null) {
        if (this.debugMode) {
            console.log(`Electron BioMini: ${message}`, data || '');
        }
    }

    async checkServiceRunning() {
        try {
            if (!this.isElectron) {
                throw new Error('Electron API not available');
            }
            
            const result = await window.electronAPI.biometricCheckService();
            this.logDebug('Service check result:', result);
            return Boolean(result?.sessionId);
        } catch (error) {
            this.logDebug('Service check failed:', error);
            return false;
        }
    }

    async initializeDevice() {
        try {
            if (!this.isElectron) {
                throw new Error('Electron API not available');
            }

            this.logDebug('Initializing device via Electron IPC...');
            
            const response = await window.electronAPI.biometricInitDevice();
            this.logDebug('Init device response:', response);

            if (!response.ScannerInfos || response.ScannerInfos.length === 0) {
                throw new Error('No biometric devices found');
            }

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
            this.logDebug('Device initialization failed:', error);
            throw error;
        }
    }

    async captureFingerprint() {
        try {
            if (!this.isElectron) {
                throw new Error('Electron API not available');
            }

            if (!this.isInitialized || !this.deviceHandle) {
                await this.initializeDevice();
            }

            this.logDebug('Starting fingerprint capture via Electron...');

            const result = await window.electronAPI.biometricCapture(this.deviceHandle, this.pageId);
            
            this.logDebug('Capture result:', result);

            if (result.success) {
                return {
                    success: true,
                    template: result.template,
                    quality: result.quality,
                    wsq: result.wsq,
                    image: result.image
                };
            } else {
                throw new Error('Capture failed');
            }
        } catch (error) {
            this.logDebug('Capture error:', error);
            throw error;
        }
    }

    async uninitializeDevice() {
        // For Electron, we don't need explicit cleanup as the main process handles it
        this.isInitialized = false;
        this.deviceHandle = null;
        this.scannerInfos = null;
    }

    // Fallback methods for web environment
    async makeRequest(endpoint, options = {}) {
        // This is a fallback that shouldn't be used in Electron
        throw new Error('Direct HTTP requests not supported in Electron environment');
    }
}

export default new ElectronBiometricService();
