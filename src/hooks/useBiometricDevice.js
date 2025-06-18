import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BiometricService from '../services/BiometricService';

export const useBiometricDevice = () => {
    const [deviceManager, setDeviceManager] = useState(null);
    const [isDeviceInitialized, setIsDeviceInitialized] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        initializeDevice();
        return () => {
            if (deviceManager) {
                deviceManager.disconnect();
            }
        };
    }, []);

    const initializeDevice = async () => {
        try {
            const serviceRunning = await BiometricService.checkServiceRunning();
            if (serviceRunning) {
                const result = await BiometricService.initializeDevice();
                setDeviceManager(BiometricService);
                setIsDeviceInitialized(true);
                console.log('Biometric device initialized successfully');
            } else {
                throw new Error('BioMini WebAgent service not running');
            }
        } catch (error) {
            console.error('Failed to initialize biometric device:', error);
            toast.error('Failed to initialize biometric device');
            setIsDeviceInitialized(false);
        }
    };

    const retryConnection = async () => {
        try {
            if (deviceManager) {
                await deviceManager.disconnect();
            }
            await initializeDevice();
        } catch (error) {
            console.error('Retry connection failed:', error);
            toast.error('Failed to reconnect biometric device');
        }
    };

    const captureFingerprint = async () => {
        if (!isDeviceInitialized) {
            toast.error('Biometric device not initialized');
            return null;
        }

        try {
            setIsScanning(true);
            console.log('Starting fingerprint capture...');

            const result = await BiometricService.captureFingerprint();

            if (result.success) {
                console.log('Fingerprint captured successfully');
                return {
                    templateData: result.template,
                    quality: result.quality,
                    image: result.image
                };
            } else {
                throw new Error('Failed to capture fingerprint');
            }
        } catch (error) {
            console.error('Fingerprint capture error:', error);
            throw error;
        } finally {
            setIsScanning(false);
        }
    };

    return {
        isDeviceInitialized,
        isScanning,
        captureFingerprint,
        retryConnection
    };
};
