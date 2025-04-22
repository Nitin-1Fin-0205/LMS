import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint } from '@fortawesome/free-solid-svg-icons';
import '../styles/BiometricCapture.css';

const BiometricCapture = ({ onUpdate, initialData }) => {
    const [fingerprints, setFingerprints] = useState(initialData?.fingerprints || []);
    const [currentFinger, setCurrentFinger] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleCapture = (finger) => {
        setCurrentFinger(finger);
        setIsScanning(true);
        // Simulate fingerprint capture
        setTimeout(() => {
            setFingerprints(prev => [...prev, finger]);
            setIsScanning(false);
            setCurrentFinger(null);
            onUpdate({ fingerprints: [...fingerprints, finger] });
        }, 2000);
    };

    return (
        <div className="biometric-section">
            <h2>Fingerprint Registration</h2>
            <div className="fingerprint-grid">
                {['right-thumb', 'right-index', 'left-thumb', 'left-index'].map((finger) => (
                    <div
                        key={finger}
                        className={`fingerprint-box ${fingerprints.includes(finger) ? 'captured' : ''} 
                                  ${currentFinger === finger ? 'scanning' : ''}`}
                    >
                        <FontAwesomeIcon icon={faFingerprint} className="fingerprint-icon" />
                        <p>{finger.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                        {!fingerprints.includes(finger) && (
                            <button
                                onClick={() => handleCapture(finger)}
                                disabled={isScanning}
                            >
                                {currentFinger === finger ? 'Scanning...' : 'Capture'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BiometricCapture;
