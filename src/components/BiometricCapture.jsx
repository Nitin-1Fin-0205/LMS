import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint } from '@fortawesome/free-solid-svg-icons';
import '../styles/BiometricCapture.css';
import BiometricService from '../services/BiometricService';
import { toast } from 'react-toastify';

const FINGER_OPTIONS = {
    'right-thumb': 'Right Thumb',
    'right-index': 'Right Index',
    'right-middle': 'Right Middle',
    'right-ring': 'Right Ring',
    'right-little': 'Right Little',
    'left-thumb': 'Left Thumb',
    'left-index': 'Left Index',
    'left-middle': 'Left Middle',
    'left-ring': 'Left Ring',
    'left-little': 'Left Little'
};

const BiometricCapture = ({ onUpdate, initialData }) => {
    const [fingerprints, setFingerprints] = useState(initialData?.fingerprints || {});
    const [isScanning, setIsScanning] = useState(false);
    const [selectedFinger, setSelectedFinger] = useState('right-thumb');
    const [deviceStatus, setDeviceStatus] = useState({ connected: false, error: null });

    useEffect(() => {
        const initDevice = async () => {
            try {
                setDeviceStatus({ connected: false, error: null });
                await BiometricService.initializeDevice();
                setDeviceStatus({ connected: true, error: null });
                toast.success('Fingerprint device connected');
            } catch (error) {
                setDeviceStatus({ connected: false, error: error.message });
                toast.error(error.message);
            }
        };

        initDevice();
    }, []);

    const handleCapture = async (finger) => {
        try {
            if (!deviceStatus.connected) {
                toast.error('Please ensure device is connected');
                return;
            }

            setIsScanning(true);

            const result = await BiometricService.captureFingerprint();

            if (result.quality < 60) {
                toast.warning('Low quality fingerprint, please try again');
                return;
            }

            const updatedFingerprints = {
                ...fingerprints,
                [finger]: {
                    template: result.template,
                    image: result.image,
                    wsq: result.wsq,
                    quality: result.quality,
                    timestamp: new Date().toISOString()
                }
            };

            setFingerprints(updatedFingerprints);
            onUpdate(updatedFingerprints);
            toast.success(`Fingerprint captured successfully`);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="biometric-section">
            {deviceStatus.error && (
                <div className="device-error">
                    <p>{deviceStatus.error}</p>
                    <button onClick={() => BiometricService.initializeDevice()}>
                        Retry Connection
                    </button>
                </div>
            )}
            <h2>Fingerprint Registration</h2>
            <div className="fingerprint-initial">
                <div className={`fingerprint-box ${fingerprints[selectedFinger] ? 'captured' : ''}`}>
                    <FontAwesomeIcon icon={faFingerprint} className="fingerprint-icon" />
                    <select
                        className="finger-select"
                        value={selectedFinger}
                        onChange={(e) => setSelectedFinger(e.target.value)}
                        disabled={isScanning}
                    >
                        {Object.entries(FINGER_OPTIONS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    {!fingerprints[selectedFinger] ? (
                        <button
                            onClick={() => handleCapture(selectedFinger)}
                            disabled={isScanning}
                        >
                            {isScanning ? 'Scanning...' : 'Capture'}
                        </button>
                    ) : (
                        <span className="quality-score">
                            Quality: {fingerprints[selectedFinger].quality}%
                        </span>
                    )}
                </div>
            </div>

            <div className="captured-fingerprints">
                {Object.entries(fingerprints).map(([finger, data]) => (
                    <div key={finger} className="fingerprint-item captured">
                        <FontAwesomeIcon icon={faFingerprint} className="fingerprint-icon" />
                        <div className="fingerprint-details">
                            <p>{data.fingerName}</p>
                            <span className="quality-score">
                                Quality: {data.quality}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BiometricCapture;
