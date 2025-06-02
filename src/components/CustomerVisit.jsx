import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faUser, faArrowsRotate, faCamera, faCheck, faTimes, faLock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const mockCustomerData = {
    firstName: 'John',
    lastName: 'Doe',
    customerId: 'CUS123456',
    customerType: 'PRIMARY',
    mobileNo: '+91 98765 43210',
    email: 'john.doe@example.com',
    panNo: 'ABCDE1234F',
    lockerNo: 'L001',
    lockerKey: 'KEY001',
    address: '123 Main Street, Sector 1',
    city: 'Mumbai',
    state: 'Maharashtra',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg'
};

const CustomerVisit = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [visitPhoto, setVisitPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleScanFingerprint = async () => {
        try {
            setIsScanning(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setCustomerData(mockCustomerData);
            toast.success("Customer identified successfully");
        } catch (error) {
            console.error('Error during fingerprint identification:', error);
            toast.error(`Identification failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsScanning(false);
        }
    }; const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error('Webcam not supported on this browser.');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast.error('Failed to access camera');
        }
    };

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
            setVisitPhoto(photoUrl);

            // Stop the camera after capturing
            const stream = video.srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }; const handleAccessVaultClick = () => {
        setShowPhotoModal(true);
        startCamera();
    };

    const handleSaveVisit = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success("Visit recorded successfully. You may now access the vault.");
            setLoading(false);
        } catch (error) {
            console.error('Error recording visit:', error);
            toast.error(`Failed to record visit: ${error.message || 'Unknown error'}`);
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCustomerData(null);
        setVisitPhoto(null);
        setShowPhotoModal(false);
        setIsScanning(false);
        setLoading(false);
        toast.info("Reset successful");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-6">
                        {/* Biometric Scan Section - Always Visible */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="mx-auto">
                                <div className={`relative rounded-lg p-6 ${isScanning ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                    <div className="mb-4">
                                        <FontAwesomeIcon
                                            icon={faFingerprint}
                                            className={`text-5xl ${isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`}
                                        />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-3">
                                        {isScanning ? 'Scanning...' : 'Ready to Scan'}
                                    </h2>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {isScanning
                                            ? 'Please keep your finger on the scanner'
                                            : 'Place your finger on the scanner to verify your identity'
                                        }
                                    </p>
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleScanFingerprint}
                                            disabled={isScanning}
                                            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors text-sm
                                                ${isScanning
                                                    ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {isScanning ? 'Scanning...' : 'Start Scan'}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="w-full py-2.5 px-4 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm"
                                        >
                                            <FontAwesomeIcon icon={faArrowsRotate} className="mr-2" />
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Access History Block */}
                        <div className="bg-white rounded-lg shadow-lg flex-1 relative">
                            <div className="flex items-center px-4 py-3 bg-green-50 border-b border-green-300">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faLock} className="text-green-800 w-4 h-4" />
                                    <h3 className="text-sm font-semibold text-green-800 ml-2">Access History</h3>
                                </div>
                            </div>
                            <div className="overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ maxHeight: '400px', minHeight: '300px' }}>
                                {[
                                    {
                                        date: '2025-06-01',
                                        time: '2:30 PM',
                                        purpose: 'Document Update',
                                        accessedBy: 'John Doe',
                                        customerType: 'PRIMARY',
                                        lockerAccessed: 'L001',
                                        duration: '15 mins'
                                    },
                                    {
                                        date: '2025-05-28',
                                        time: '11:15 AM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'John Doe',
                                        customerType: 'PRIMARY',
                                        lockerAccessed: 'L001',
                                        duration: '20 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    },
                                    {
                                        date: '2025-05-20',
                                        time: '4:45 PM',
                                        purpose: 'Locker Access',
                                        accessedBy: 'Sarah Smith',
                                        customerType: 'NOMINEE',
                                        lockerAccessed: 'L001',
                                        duration: '25 mins'
                                    }
                                ].map((access, index) => (
                                    <div key={index}
                                        className="px-4 py-2.5 border-b border-green-100 hover:bg-green-50/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                                    {access.accessedBy.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-gray-800 truncate">
                                                            {access.accessedBy}
                                                        </p>
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                                            {access.customerType}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                                        <span className="text-green-700">{access.time}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500">{access.date}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-600">{access.purpose}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-xs text-green-600 font-medium">
                                                    {access.duration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Customer Details Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {customerData ? (
                            <div>                                <div className="text-center mb-6">
                                <div className="mb-3">
                                    <div className="inline-flex items-center justify-center w-15 h-15 rounded-full bg-green-100">
                                        <FontAwesomeIcon icon={faCheck} className="text-green-600 text-3xl" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-green-700">Authentication Successful</h2>
                                <p className="text-sm font-bold text-green-600 mt-2">Customer verified successfully</p>
                            </div><div className="space-y-6">
                                    <div className="flex items-start space-x-6 mb-6">
                                        <div className="flex-shrink-0">
                                            {customerData.photo ? (
                                                <img
                                                    src={customerData.photo}
                                                    alt="Customer"
                                                    className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faUser} className="text-3xl text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl text-blue-800">
                                                    {`${customerData.firstName} ${customerData.lastName}`}
                                                </h3>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                                                    {customerData.customerType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>                                <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                            <div className="col-span-2">
                                                <div className="flex items-center justify-between bg-blue-100 rounded-md px-3 py-2">
                                                    <span className="text-sm font-semibold text-blue-800">LOCKER DETAILS</span>
                                                    <FontAwesomeIcon icon={faLock} className="text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center px-3">
                                                <span className="text-xs font-medium text-gray-500">LOCKER No:</span>
                                                <span className="text-sm font-semibold text-blue-800">{customerData.lockerNo}</span>
                                            </div>
                                            <div className="flex justify-between items-center px-3">
                                                <span className="text-xs font-medium text-gray-500">KEY ID</span>
                                                <span className="text-sm font-semibold text-blue-800">{customerData.lockerKey}</span>
                                            </div>
                                            <div className="col-span-2 mt-2">
                                                <div className="flex items-center justify-between bg-blue-100 rounded-md px-3 py-2">
                                                    <span className="text-sm font-semibold text-blue-800">CONTACT & ADDRESS</span>
                                                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                                                </div>
                                            </div>                                            <div className="col-span-2">
                                                <div className="grid grid-cols-2 gap-4 px-3">
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-500 block mb-1">EMAIL</span>
                                                        <span className="text-sm text-blue-800">{customerData.email}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-500 block mb-1">PHONE</span>
                                                        <span className="text-sm text-blue-800">{customerData.mobileNo}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-500 block mb-1">CITY</span>
                                                        <span className="text-sm text-blue-800">{customerData.city}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-500 block mb-1">STATE</span>
                                                        <span className="text-sm text-blue-800">{customerData.state}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-xs font-medium text-gray-500 block mb-1">ADDRESS</span>
                                                        <span className="text-sm text-blue-800">{customerData.address}</span>
                                                    </div>
                                                </div>                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAccessVaultClick}
                                        className="w-full py-3 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                                        disabled={loading}
                                    >
                                        <FontAwesomeIcon icon={faLock} className="mr-2" />
                                        Access Vault
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FontAwesomeIcon icon={faUser} className="text-6xl text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-600">No Customer Selected</h3>
                                <p className="text-gray-500 mt-2">Please scan fingerprint to view customer details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>            {/* Photo Capture Modal */}
            {showPhotoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-4xl  mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Capture Image</h3>
                            <button
                                onClick={() => {
                                    setShowPhotoModal(false);
                                    const stream = videoRef.current?.srcObject;
                                    if (stream) {
                                        stream.getTracks().forEach(track => track.stop());
                                    }
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FontAwesomeIcon className='text-gray-500 text-2xl cursor-pointer hover:text-red-700 hover:scale-110 transition-transform duration-200'
                                    icon={faTimes} />
                            </button>
                        </div>

                        <div className="photo-capture-container">
                            {!visitPhoto ? (
                                <div className="camera-container">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="camera-video"
                                        style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="camera-controls mt-4 flex justify-center">
                                        <button
                                            onClick={handleCapturePhoto}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faCamera} className="mr-2" />
                                            Capture Photo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="captured-photo-container text-center">
                                    <img
                                        src={visitPhoto}
                                        alt="Captured"
                                        className="mx-auto max-h-[70vh] object-contain rounded-lg"
                                    />
                                    <div className="mt-4 space-x-4">
                                        <button
                                            onClick={() => {
                                                setVisitPhoto(null);
                                                startCamera();
                                            }}
                                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                        >
                                            Retake Photo
                                        </button>
                                        <button
                                            onClick={handleSaveVisit}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Save & Continue
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* Loading State */}
            {
                loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-center mt-4">Processing...</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default CustomerVisit;
