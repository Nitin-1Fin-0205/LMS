const MANTRA_HOST = 'http://localhost:8097';

const DEVICE_CONFIG = {
    minQuality: 60,
    maxTimeout: 10,
    deviceName: 'MANTRA.MFS100',
    templateFormat: 'ISO19794_2',
    isFormatAnsi: false
};

class BiometricService {
    async checkDeviceConnection() {
        try {
            const response = await fetch(`${MANTRA_HOST}/getDeviceInfo`);
            const data = await response.json();
            return {
                isConnected: data.deviceConnected,
                deviceInfo: data.deviceInfo
            };
        } catch (error) {
            throw new Error('Biometric device not connected');
        }
    }

    async captureFingerprint(finger = 'R1', options = {}) {
        try {
            const captureParams = {
                quality: options.quality || DEVICE_CONFIG.minQuality,
                timeout: options.timeout || DEVICE_CONFIG.maxTimeout,
                deviceName: DEVICE_CONFIG.deviceName,
                finger,
                templateFormat: DEVICE_CONFIG.templateFormat
            };

            const response = await fetch(`${MANTRA_HOST}/capture`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(captureParams)
            });

            if (!response.ok) {
                throw new Error(`Device Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Validate quality
            if (data.quality < DEVICE_CONFIG.minQuality) {
                throw new Error(`Poor fingerprint quality: ${data.quality}`);
            }

            return {
                template: data.template,
                quality: data.quality,
                nfiq: data.nfiq,
                image: data.biometricImage,
                finger,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Device not connected or service not running');
            }
            throw error;
        }
    }

    async matchFingerprints(template1, template2) {
        try {
            const response = await fetch(`${MANTRA_HOST}/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template1, template2 })
            });
            const data = await response.json();
            return {
                matched: data.matched,
                score: data.matchScore
            };
        } catch (error) {
            throw new Error('Failed to match fingerprints');
        }
    }
}

export default new BiometricService();
