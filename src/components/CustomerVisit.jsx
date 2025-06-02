import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faUser, faArrowsRotate, faCamera, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const mockCustomerData = {
    firstName: 'John',
    lastName: 'Doe',
    customerId: 'CUS123456',
    mobileNo: '+91 98765 43210',
    email: 'john.doe@example.com',
    panNo: 'ABCDE1234F',
    lockerNo: 'L001',
    photo: null
};

const CustomerVisit = () => {
    const [step, setStep] = useState(1);
    const [isScanning, setIsScanning] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [visitPhoto, setVisitPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // Handle fingerprint scanning
    const handleScanFingerprint = async () => {
        try {
            setIsScanning(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setCustomerData(mockCustomerData);
            toast.success("Customer identified successfully");
            setStep(2);
        } catch (error) {
            console.error('Error during fingerprint identification:', error);
            toast.error(`Identification failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsScanning(false);
        }
    };

    // Handle photo capture
    const handlePhotoCapture = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVisitPhoto(reader.result);
                setShowPhotoModal(false);
                handleSaveVisit();
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Access Vault Click
    const handleAccessVaultClick = () => {
        setShowPhotoModal(true);
    };

    // Save visit record
    const handleSaveVisit = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Visit recorded successfully. You may now access the vault.");
            // Don't reset the component state here to allow vault access
            setLoading(false);
        } catch (error) {
            console.error('Error recording visit:', error);
            toast.error(`Failed to record visit: ${error.message || 'Unknown error'}`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Step 1: Biometric Scan */}
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="max-w-md mx-auto">
                            <div className={`relative rounded-lg p-8 ${isScanning ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <div className="mb-6">
                                    <FontAwesomeIcon
                                        icon={faFingerprint}
                                        className={`text-6xl ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`}
                                    />
                                </div>
                                <h2 className="text-2xl font-semibold mb-4">
                                    {isScanning ? 'Scanning...' : 'Ready to Scan'}
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {isScanning
                                        ? 'Please keep your finger on the scanner'
                                        : 'Place your finger on the scanner to verify your identity'
                                    }
                                </p>
                                <button
                                    onClick={handleScanFingerprint}
                                    disabled={isScanning}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                                        ${isScanning
                                            ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isScanning ? 'Scanning...' : 'Start Scan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Verified Customer Details */}
                {step === 2 && customerData && (
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-8">
                                <div className="mb-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                                        <FontAwesomeIcon icon={faCheck} className="text-green-500 text-3xl" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-800">Authentication Successful</h2>
                                <p className="text-gray-600 mt-2">Customer verified successfully</p>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium">{`${customerData.firstName} ${customerData.lastName}`}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Customer ID</p>
                                            <p className="font-medium">{customerData.customerId}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Mobile Number</p>
                                            <p className="font-medium">{customerData.mobileNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Locker Number</p>
                                            <p className="font-medium">{customerData.lockerNo}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAccessVaultClick}
                                    className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    disabled={loading}
                                >
                                    {visitPhoto ? 'Access Vault' : 'Take Photo to Access Vault'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Photo Capture Modal */}
                {showPhotoModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Take Photo</h3>
                                <button
                                    onClick={() => setShowPhotoModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                            <div className="text-center p-6 bg-gray-50 rounded-lg mb-6">
                                <FontAwesomeIcon icon={faCamera} className="text-4xl text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-4">Please take a photo for visit record</p>
                                <label className="block">
                                    <div className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
                                        Take Photo
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handlePhotoCapture}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-center mt-4">Processing...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerVisit;
