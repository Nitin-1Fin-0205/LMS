import React, { useState, useEffect } from 'react';
import BiometricService from '../services/BiometricService';

const DeviceConnection = () => {
    const [status, setStatus] = useState({ connected: false, checking: true });
    const [error, setError] = useState(null);

    const checkConnection = async () => {
        try {
            setStatus({ ...status, checking: true });
            const deviceStatus = await BiometricService.checkDeviceConnection();
            setStatus({ connected: deviceStatus.isConnected, checking: false });
            setError(null);
        } catch (error) {
            setStatus({ connected: false, checking: false });
            setError(error.message);
        }
    };

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="device-status">
            {status.checking ? (
                <span>Checking device connection...</span>
            ) : status.connected ? (
                <span className="connected">Device Connected ✓</span>
            ) : (
                <span className="disconnected">Device Disconnected ✗</span>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default DeviceConnection;
