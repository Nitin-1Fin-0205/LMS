import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faSync, faCheck, faTimes, faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';
import '../styles/BiometricCapture.css';
import BiometricService from '../services/BiometricService';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../assets/config';

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

const QUALITY_THRESHOLDS = {
    excellent: 90,
    good: 75,
    fair: 60,
    poor: 40
};

const BiometricCapture = ({ onUpdate, initialData, required = [], customerId }) => {
    const [fingerprints, setFingerprints] = useState(initialData?.fingerprints || {});
    const [scannerState, setScannerState] = useState({
        isScanning: false,
        isConnected: false,
        isInitializing: false,
        error: null,
        deviceInfo: null
    });
    const [selectedFinger, setSelectedFinger] = useState('right-thumb');
    const [serviceStatus, setServiceStatus] = useState({
        running: false,
        checked: false
    });
    const [captureProgress, setCaptureProgress] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch customer's previously captured biometric records
    const fetchCustomerBiometrics = async () => {
        if (!customerId) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await axios.get(
                `${API_URL}/biometrics/customer/${customerId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    }
                }
            );

            // Check the response structure - the API returns data.biometrics array
            console.log('API Response:', response.data);

            if (response.data?.data?.biometrics && Array.isArray(response.data.data.biometrics)) {
                const fetchedFingerprints = {};

                // Map API response to component format
                response.data.data.biometrics.forEach(record => {
                    // Use fingerPosition instead of finger
                    fetchedFingerprints[record.fingerPosition] = {
                        // These fields aren't included in list response but are needed for UI
                        template: record.template || '',
                        wsq: record.wsq || '',
                        image: record.image || null,
                        // Fields from actual response
                        quality: record.quality || 0,
                        fingerName: record.fingerName || FINGER_OPTIONS[record.fingerPosition],
                        timestamp: record.createdAt || new Date().toISOString(),
                        // Additional metadata if needed
                        id: record.id,
                        verificationCount: record.verificationCount || 0,
                        lastVerified: record.lastVerified
                    };
                });

                console.log('Mapped fingerprint records:', fetchedFingerprints);
                setFingerprints(fetchedFingerprints);

                // Notify parent component
                if (onUpdate) {
                    onUpdate(fetchedFingerprints);
                }
            } else {
                console.log('No biometric records found or unexpected response format');
            }
        } catch (error) {
            console.error('Error fetching customer biometrics:', error);
            // Only show toast if there's a real error, not just empty records
            if (error.response && error.response.status !== 404) {
                toast.error('Failed to fetch customer biometrics');
            }
        } finally {
            setLoading(false);
        }
    };

    const initializeDevice = async () => {
        try {
            setScannerState(prev => ({
                ...prev,
                isInitializing: true,
                error: null
            }));

            // Check if service is running
            const serviceRunning = await BiometricService.checkServiceRunning();
            setServiceStatus({
                running: serviceRunning,
                checked: true
            });

            if (!serviceRunning) {
                throw new Error('BioMini WebAgent service is not running. Please verify the service is installed and running.');
            }

            // Initialize device
            const result = await BiometricService.initializeDevice();

            setScannerState({
                isScanning: false,
                isConnected: true,
                isInitializing: false,
                error: null,
                deviceInfo: result.deviceInfo
            });

            // toast.success(`Fingerprint device connected: ${result.deviceInfo?.ScannerName}`);
        } catch (error) {
            console.error('Failed to initialize device:', error);
            setScannerState({
                isScanning: false,
                isConnected: false,
                isInitializing: false,
                error: error.message,
                deviceInfo: null
            });

            toast.error(`Failed to connect to fingerprint device: ${error.message}`);
        }
    };

    // Initialize device and fetch biometrics on component mount
    useEffect(() => {
        initializeDevice();

        // Fetch customer biometrics if customerId is provided
        if (customerId) {
            fetchCustomerBiometrics();
        }

        // Cleanup on component unmount
        return () => {
            BiometricService.abortCapture()
                .then(() => BiometricService.cleanupSession())
                .catch(console.error);
        };
    }, [customerId]); // Re-fetch when customerId changes

    const getQualityClass = useCallback((quality) => {
        if (quality >= QUALITY_THRESHOLDS.excellent) return 'excellent';
        if (quality >= QUALITY_THRESHOLDS.good) return 'good';
        if (quality >= QUALITY_THRESHOLDS.fair) return 'fair';
        if (quality >= QUALITY_THRESHOLDS.poor) return 'poor';
        return 'very-poor';
    }, []);

    const handleCapture = async () => {
        if (fingerprints[selectedFinger]) {
            if (!window.confirm(`Overwrite existing ${FINGER_OPTIONS[selectedFinger]} fingerprint?`)) {
                return;
            }
        }

        try {
            // Start capture process
            setScannerState(prev => ({ ...prev, isScanning: true }));
            setCaptureProgress(10);
            setRetryCount(0);

            // Set progress to simulate feedback
            const progressInterval = setInterval(() => {
                setCaptureProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 5;
                });
            }, 300);

            // Check current cookies before capture
            console.log('Current cookies before capture:', document.cookie);

            const result = await BiometricService.captureFingerprint();
            clearInterval(progressInterval);
            setCaptureProgress(100);

            // Check quality
            if (result.quality < QUALITY_THRESHOLDS.poor) {
                toast.warning(`Low quality fingerprint (${result.quality}%), please try again`);

                if (retryCount < 2) {
                    setRetryCount(count => count + 1);
                    setCaptureProgress(0);
                    return;
                }
            }

            // Store captured fingerprint
            const updatedFingerprints = {
                ...fingerprints,
                [selectedFinger]: {
                    template: result.template,
                    image: result.image,
                    wsq: result.wsq,
                    quality: result.quality,
                    fingerName: FINGER_OPTIONS[selectedFinger],
                    timestamp: new Date().toISOString()
                }
            };

            // Store fingerprint data in backend
            try {
                const token = localStorage.getItem('authToken');

                // Send the fingerprint data to the backend
                const response = await axios.post(
                    `${API_URL}/biometrics/capture`,
                    {
                        customerId: Number(customerId),
                        fingerprint: {
                            template: result.template,
                            finger: selectedFinger,
                            fingerName: FINGER_OPTIONS[selectedFinger],
                            quality: Number(result.quality),
                            wsq: result.wsq,
                            templateFormat: 'SUPREMA',
                            deviceInfo: scannerState.deviceInfo || {}
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': '*/*' // Match the accept header from the curl example
                        }
                    }
                );

                console.log('Fingerprint stored in database:', response.data);
                toast.success(`${FINGER_OPTIONS[selectedFinger]} stored in database`);
            } catch (apiError) {
                console.error('Failed to store fingerprint in database:', apiError);
                toast.error(`Warning: Fingerprint captured but not stored in database: ${apiError.message}`);
            }

            setFingerprints(updatedFingerprints);

            // Notify parent component
            if (onUpdate) {
                onUpdate(updatedFingerprints);
            }

            toast.success(`${FINGER_OPTIONS[selectedFinger]} captured successfully`);

            // If this was a required finger, select the next required finger automatically
            if (required.length > 0) {
                const currentIndex = required.indexOf(selectedFinger);
                if (currentIndex >= 0 && currentIndex < required.length - 1) {
                    setSelectedFinger(required[currentIndex + 1]);
                }
            }

        } catch (error) {
            console.error('Capture failed:', error);
            toast.error(`Capture failed: ${error.message}`);
        } finally {
            setScannerState(prev => ({ ...prev, isScanning: false }));
            setCaptureProgress(0);
        }
    };

    const handleUpdateFingerprint = (finger) => {
        setSelectedFinger(finger);
        handleCapture();
    };

    const renderServiceStatus = () => {
        if (!serviceStatus.checked) {
            return (
                <div className="status-indicator checking">
                    <FontAwesomeIcon icon={faSync} spin /> Checking biometric service...
                </div>
            );
        }

        if (!serviceStatus.running) {
            return (
                <div className="status-indicator error">
                    <FontAwesomeIcon icon={faTimes} /> Biometric service not available
                    <button className="retry-button" onClick={initializeDevice}>
                        <FontAwesomeIcon icon={faSync} /> Retry
                    </button>
                </div>
            );
        }

        if (scannerState.isInitializing) {
            return (
                <div className="status-indicator checking">
                    <FontAwesomeIcon icon={faSync} spin /> Connecting to device...
                </div>
            );
        }

        if (scannerState.error) {
            return (
                <div className="status-indicator error">
                    <FontAwesomeIcon icon={faExclamationTriangle} /> {scannerState.error}
                    <button className="retry-button" onClick={initializeDevice}>
                        <FontAwesomeIcon icon={faSync} /> Retry
                    </button>
                </div>
            );
        }

        if (scannerState.isConnected) {
            return (
                <div className="status-indicator success">
                    <FontAwesomeIcon icon={faCheck} /> Device ready: {scannerState.deviceInfo?.ScannerName || "Fingerprint Scanner"}
                </div>
            );
        }

        return null;
    };

    // Calculate if all required fingers have been captured
    const allRequiredCaptured = required.length === 0 ||
        required.every(finger => Boolean(fingerprints[finger]));

    return (
        <div className="biometric-capture-section">
            <div className="section-header">
                <h2>Fingerprint Registration</h2>
                {renderServiceStatus()}
            </div>

            {loading ? (
                <div className="loading-container">
                    <FontAwesomeIcon icon={faSync} spin /> Loading fingerprint records...
                </div>
            ) : (
                <>
                    <div className="capture-container">
                        <div className="finger-selection">
                            <label htmlFor="finger-select">Select Finger:</label>
                            <select
                                id="finger-select"
                                className="finger-select"
                                value={selectedFinger}
                                onChange={(e) => setSelectedFinger(e.target.value)}
                                disabled={scannerState.isScanning || !scannerState.isConnected}
                            >
                                {Object.entries(FINGER_OPTIONS).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label} {required.includes(key) ? '(Required)' : ''}
                                        {fingerprints[key] ? ' ✓' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={`fingerprint-box ${fingerprints[selectedFinger] ? 'captured' : ''} ${scannerState.isScanning ? 'scanning' : ''}`}>
                            <div className="fingerprint-icon-container">
                                <FontAwesomeIcon
                                    icon={faFingerprint}
                                    className="fingerprint-icon"
                                    pulse={scannerState.isScanning}
                                />
                                {captureProgress > 0 && (
                                    <div className="capture-progress">
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${captureProgress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>

                            {fingerprints[selectedFinger] ? (
                                <div className="fingerprint-details">
                                    <div className={`quality-indicator ${getQualityClass(fingerprints[selectedFinger].quality)}`}>
                                        Quality: {fingerprints[selectedFinger].quality}%
                                    </div>
                                    <div className="timestamp">
                                        Captured: {new Date(fingerprints[selectedFinger].timestamp).toLocaleTimeString()}
                                    </div>
                                    {/* <button 
                                        className="update-button" 
                                        onClick={() => handleCapture()}
                                        disabled={scannerState.isScanning || !scannerState.isConnected}
                                        title="Update this fingerprint"
                                    >
                                        <FontAwesomeIcon icon={faRedo} /> Update
                                    </button> */}
                                </div>
                            ) : (
                                <button
                                    className="capture-button"
                                    onClick={handleCapture}
                                    disabled={scannerState.isScanning || !scannerState.isConnected}
                                >
                                    {scannerState.isScanning ? 'Scanning...' : 'Capture'}
                                </button>
                            )}
                        </div>
                    </div>

                    {required.length > 0 && (
                        <div className="required-fingers">
                            <h3>Required Fingers:</h3>
                            <div className="finger-grid">
                                {required.map(finger => (
                                    <div
                                        key={finger}
                                        className={`finger-item ${fingerprints[finger] ? 'captured' : ''}`}
                                        onClick={() => setSelectedFinger(finger)}
                                    >
                                        <FontAwesomeIcon icon={faFingerprint} />
                                        <span>{FINGER_OPTIONS[finger]}</span>
                                        {fingerprints[finger] && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
                                    </div>
                                ))}
                            </div>
                            <div className="completion-status">
                                {allRequiredCaptured
                                    ? <span className="complete">✓ All required fingerprints captured</span>
                                    : <span className="incomplete">Required fingerprints pending</span>
                                }
                            </div>
                        </div>
                    )}

                    <div className="captured-summary">
                        <h3>Captured Fingerprints ({Object.keys(fingerprints).length})</h3>
                        {Object.keys(fingerprints).length === 0 ? (
                            <p className="no-data">No fingerprints captured yet</p>
                        ) : (
                            <div className="fingerprints-grid">
                                {Object.entries(fingerprints).map(([finger, data]) => (
                                    <div
                                        key={finger}
                                        className={`fingerprint-item ${getQualityClass(data.quality)}`}
                                        onClick={() => setSelectedFinger(finger)}
                                    >
                                        <FontAwesomeIcon icon={faFingerprint} className="fingerprint-icon-small" />
                                        <div className="finger-details">
                                            <span className="finger-name">{data.fingerName}</span>
                                            <span className="quality-score">Quality: {data.quality}%</span>
                                        </div>
                                        <button
                                            className="update-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateFingerprint(finger);
                                            }}
                                            title="Update this fingerprint"
                                        >
                                            <FontAwesomeIcon icon={faRedo} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default BiometricCapture;
