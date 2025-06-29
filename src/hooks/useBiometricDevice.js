import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BiometricService from '../services/BiometricService';

export const useBiometricDevice = () => {
    const [isDeviceInitialized, setIsDeviceInitialized] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState(null);

    useEffect(() => {
        checkDeviceConnection();
    }, []);

    const checkDeviceConnection = async () => {
        try {
            const response = await fetch(BiometricService.baseProxyUrl + '/bio/device-info');
            const data = await response.json();
            const isConnected = data.success && Array.isArray(data.info) && data.info.length > 0;
            setIsDeviceInitialized(isConnected);
            setDeviceInfo(isConnected ? data.info[0] : null);
            if (!isConnected) {
                toast.error('No biometric device connected');
            }
        } catch (error) {
            setIsDeviceInitialized(false);
            setDeviceInfo(null);
            toast.error('Failed to check biometric device connection');
        }
    };

    const retryConnection = async () => {
        await checkDeviceConnection();
    };

    const captureFingerprint = async () => {
        if (!isDeviceInitialized) {
            toast.error('Biometric device not initialized');
            return null;
        }
        try {
            setIsScanning(true);
            const result = await BiometricService.captureFingerprint();
            if (result && result.success) {
                return {
                    templateData: result.template,
                    wsq: result.wsq,
                    image: result.image,
                };
            } else {
                toast.error(result && result.message ? result.message : 'Failed to capture fingerprint');
                return null;
            }
        } catch (error) {
            toast.error(error.message || 'Fingerprint capture error');
            return null;
        } finally {
            setIsScanning(false);
        }
    };

    return {
        isDeviceInitialized,
        isScanning,
        deviceInfo,
        captureFingerprint,
        retryConnection
    };
};
