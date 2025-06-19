import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { useBiometricDevice } from '../../hooks/useBiometricDevice';

const BiometricScanner = ({ onScanSuccess, onScanError }) => {
    const { isDeviceInitialized, isScanning, captureFingerprint, retryConnection } = useBiometricDevice();

    const handleScan = async () => {
        try {
            const fingerprintData = await captureFingerprint();
            if (fingerprintData) {
                onScanSuccess(fingerprintData);
            }
        } catch (error) {
            onScanError(error);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faFingerprint} className="mr-2 w-4 h-4 text-blue-600" />
                    Biometric Verification
                </h2>
            </div>
            <div className="p-4">
                <div className={`relative rounded-lg p-4 text-center transition-all duration-300 ${isScanning ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                    }`}>
                    <div className="mb-3">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-all duration-300 ${isScanning ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'
                            }`}>
                            <FontAwesomeIcon
                                icon={faFingerprint}
                                className={`text-lg transition-all duration-300 ${isScanning ? 'text-blue-600 animate-pulse' : 'text-gray-400'
                                    }`}
                            />
                        </div>
                    </div>
                    <h3 className={`text-sm font-medium mb-2 transition-all duration-300 ${isScanning ? 'text-blue-800' : 'text-gray-700'
                        }`}>
                        {isScanning ? 'Scanning...' : 'Ready to Authenticate'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        {isScanning
                            ? 'Keep your finger steady on the scanner'
                            : isDeviceInitialized
                                ? 'Place your finger on the biometric scanner'
                                : 'Initializing biometric device...'
                        }
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={handleScan}
                            disabled={isScanning || !isDeviceInitialized}
                            className={`w-full py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${isScanning || !isDeviceInitialized
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transform hover:scale-105'
                                }`}
                        >
                            {isScanning ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
                                    Scanning...
                                </div>
                            ) : !isDeviceInitialized ? (
                                'Device Not Ready'
                            ) : (
                                'Start Fingerprint Scan'
                            )}
                        </button>

                        {!isDeviceInitialized && (
                            <button
                                onClick={retryConnection}
                                className="w-full py-2 px-3 rounded text-sm font-medium transition-all duration-200 bg-orange-600 text-white hover:bg-orange-700 cursor-pointer transform hover:scale-105"
                            >
                                <FontAwesomeIcon icon={faArrowsRotate} className="mr-2 w-3 h-3" />
                                Retry Connection
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiometricScanner;
