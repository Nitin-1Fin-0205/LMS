import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faSync, faCheck, faTimes, faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';
import '../../styles/BiometricCapture.css';
import BiometricService from '../../services/BiometricService';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../../assets/config';
import ConfirmationModal from '../ui/ConfirmationModal';

const FINGER_OPTIONS = {
    'right-thumb': 'Right Thumb',
    'left-thumb': 'Left Thumb'
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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingCapture, setPendingCapture] = useState(false);

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

    // Stateless device connection check
    const checkDeviceConnection = async () => {
        setScannerState(prev => ({ ...prev, isInitializing: true, error: null }));
        try {
            // Fetch device info directly
            const response = await fetch(BiometricService.baseProxyUrl + '/bio/device-info');
            const data = await response.json();
            const isConnected = data.success && Array.isArray(data.info) && data.info.length > 0;
            setScannerState(prev => ({
                ...prev,
                isConnected,
                isInitializing: false,
                error: isConnected ? null : 'No biometric device connected',
                deviceInfo: isConnected ? data.info[0] : null
            }));
        } catch (error) {
            setScannerState(prev => ({
                ...prev,
                isConnected: false,
                isInitializing: false,
                error: error.message,
                deviceInfo: null
            }));
        }
    };

    // On mount, check device connection and fetch biometrics
    useEffect(() => {
        checkDeviceConnection();
        if (customerId) {
            fetchCustomerBiometrics();
        }
        // Cleanup: abort capture
        return () => {
            BiometricService.abortCapture().catch(console.error);
        };
    }, [customerId]);

    const getQualityClass = useCallback((quality) => {
        if (quality >= QUALITY_THRESHOLDS.excellent) return 'excellent';
        if (quality >= QUALITY_THRESHOLDS.good) return 'good';
        if (quality >= QUALITY_THRESHOLDS.fair) return 'fair';
        if (quality >= QUALITY_THRESHOLDS.poor) return 'poor';
        return 'very-poor';
    }, []);

    const handleCapture = async () => {
        if (fingerprints[selectedFinger]) {
            setShowConfirmModal(true);
            return;
        }
        await performCapture();
    };

    const handleConfirmOverwrite = async () => {
        setShowConfirmModal(false);
        await performCapture();
    };

    const performCapture = async () => {
        try {
            setScannerState(prev => ({ ...prev, isScanning: true }));
            setCaptureProgress(10);
            setRetryCount(0);
            const progressInterval = setInterval(() => {
                setCaptureProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 5;
                });
            }, 300);
            const result = await BiometricService.captureFingerprint();
            clearInterval(progressInterval);
            setCaptureProgress(100);

            // Get template quality from API
            let quality = 0;
            try {
                const qualityResp = await BiometricService.getTemplateQuality(result.template);
                if (qualityResp.success && qualityResp.result && typeof qualityResp.result.quality === 'number') {
                    quality = qualityResp.result.quality;
                } else {
                    toast.warn('Could not determine fingerprint quality');
                }
            } catch (qerr) {
                toast.warn('Could not determine fingerprint quality');
            }

            if (quality < QUALITY_THRESHOLDS.poor) {
                toast.warning(`Low quality fingerprint (${quality}%), please try again`);

                if (retryCount < 2) {
                    setRetryCount(count => count + 1);
                    setCaptureProgress(0);
                    return;
                }
            }

            const updatedFingerprints = {
                ...fingerprints,
                [selectedFinger]: {
                    template: result.template,
                    image: result.image,
                    wsq: result.wsq,
                    quality,
                    fingerName: FINGER_OPTIONS[selectedFinger],
                    timestamp: new Date().toISOString()
                }
            };

            // Store fingerprint data in backend
            try {
                const token = localStorage.getItem('authToken');

                // Send the fingerprint data to the backend
                await axios.post(
                    `${API_URL}/biometrics/capture`,
                    {
                        customerId: Number(customerId),
                        fingerprint: {
                            template: result.template,
                            finger: selectedFinger,
                            fingerName: FINGER_OPTIONS[selectedFinger],
                            quality: Number(quality),
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

                toast.success(`${FINGER_OPTIONS[selectedFinger]} captured successfully`);
            } catch (apiError) {
                toast.error(`Warning: Fingerprint captured but not stored in database: ${apiError.message}`);
            }

            setFingerprints(updatedFingerprints);

            // Notify parent component
            if (onUpdate) {
                onUpdate(updatedFingerprints);
            }

            // If this was a required finger, select the next required finger automatically
            if (required.length > 0) {
                const currentIndex = required.indexOf(selectedFinger);
                if (currentIndex >= 0 && currentIndex < required.length - 1) {
                    setSelectedFinger(required[currentIndex + 1]);
                }
            }

        } catch (error) {
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
        if (scannerState.isInitializing) {
            return (
                <div className="status-indicator checking">
                    <FontAwesomeIcon icon={faSync} spin /> Checking device connection...
                </div>
            );
        }
        if (scannerState.error) {
            return (
                <div className="status-indicator error">
                    <FontAwesomeIcon icon={faExclamationTriangle} beatFade /> {scannerState.error}
                    <button className="error-retry-button" onClick={checkDeviceConnection}>
                        <FontAwesomeIcon icon={faSync} /> Retry
                    </button>
                </div>
            );
        }
        if (scannerState.isConnected) {
            console.log('Device connected:', scannerState)
            return (
                <div className="status-indicator success">
                    <FontAwesomeIcon icon={faCheck} bounce /> Device ready: {scannerState.deviceInfo?.Serial || scannerState.deviceInfo?.ID || 'Fingerprint Scanner'}
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
            <div className="bio-section-header">
                <FontAwesomeIcon icon={faFingerprint} className="section-title-icon" />
                <h2 className="section-title">Fingerprint Registration</h2>
            </div>
            {renderServiceStatus()}

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

                        <div className="fingerprint-capture-area">
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
                                            Quality &gt;= {fingerprints[selectedFinger].quality}%
                                        </div>
                                        <div className="timestamp">
                                            Captured: {new Date(fingerprints[selectedFinger].timestamp).toLocaleTimeString()}
                                        </div>
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

                            {/* Only show the captured fingerprints preview if there are fingerprints */}
                            {Object.keys(fingerprints).length > 0 && (
                                <div className="captured-fingerprints-preview">
                                    <div className="captured-preview-title">Captured Fingerprints</div>
                                    {Object.entries(fingerprints).map(([finger, data]) => (
                                        <div
                                            key={finger}
                                            className={`captured-preview-item ${selectedFinger === finger ? 'selected' : ''}`}
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
                </>
            )}

            <ConfirmationModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmOverwrite}
                title="Overwrite Existing Fingerprint"
                message={`Are you sure you want to overwrite the existing ${FINGER_OPTIONS[selectedFinger]} fingerprint?`}
                confirmText="Yes, Overwrite"
                cancelText="Cancel"
                confirmButtonStyle="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                isProcessing={scannerState.isScanning}
            />
        </div>
    );
};

export default BiometricCapture;
