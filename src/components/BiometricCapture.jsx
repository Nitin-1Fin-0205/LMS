import React, { useState } from 'react';
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

    const handleCapture = async () => {
        if (!selectedFinger) {
            toast.error('Please select a finger first');
            return;
        }

        try {
            setIsScanning(true);
            const deviceStatus = await BiometricService.checkDeviceConnection();

            if (!deviceStatus.isConnected) {
                toast.error('Biometric device not connected');
                return;
            }

            const captureResult = await BiometricService.captureFingerprint();

            const updatedFingerprints = {
                ...fingerprints,
                [selectedFinger]: {
                    template: captureResult.template,
                    quality: captureResult.quality,
                    image: captureResult.image,
                    timestamp: new Date().toISOString(),
                    fingerName: FINGER_OPTIONS[selectedFinger]
                }
            };

            setFingerprints(updatedFingerprints);
            onUpdate({ fingerprints: updatedFingerprints });
            toast.success(`${FINGER_OPTIONS[selectedFinger]} captured successfully`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="biometric-section">
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
                            onClick={handleCapture}
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
