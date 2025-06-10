import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faUser, faArrowsRotate, faCamera, faCheck, faTimes, faLock, faInfoCircle, faHistory, faIdCard, faMapMarkerAlt, faPhone, faEnvelope, faKey, faHashtag, faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../assets/config';
import OtpVerification from './OtpVerification';

const CustomerVisit = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [visitPhoto, setVisitPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [visitHistory, setVisitHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState('mobile');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Fetch customer details by ID
    const fetchCustomerDetails = async (customerId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${API_URL}/customers/details-by-id?customer_id=${customerId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 && response.data?.data) {
                const customerInfo = response.data.data;
                return {
                    customerId: customerInfo.customer_id,
                    memberCode: customerInfo.member_id,
                    customerCode: customerInfo.customer_code,
                    firstName: customerInfo.first_name,
                    lastName: customerInfo.last_name,
                    middleName: customerInfo.middle_name,
                    name: customerInfo.name,
                    customerType: customerInfo.type?.toUpperCase(),
                    mobileNo: customerInfo.mobile_number,
                    email: customerInfo.email,
                    panNo: customerInfo.pan,
                    lockerNo: customerInfo.locker_number,
                    lockerId: customerInfo.locker_id,
                    lockerKey: customerInfo.locker_id,
                    address: `${customerInfo.permanent_address_line1 || ''} ${customerInfo.permanent_address_line2 || ''} ${customerInfo.permanent_address_line3 || ''}`.trim(),
                    permanentAddressLine1: customerInfo.permanent_address_line1,
                    permanentAddressLine2: customerInfo.permanent_address_line2,
                    permanentAddressLine3: customerInfo.permanent_address_line3,
                    city: customerInfo.permanent_city,
                    state: customerInfo.permanent_state,
                    permanentCity: customerInfo.permanent_city,
                    permanentState: customerInfo.permanent_state,
                    permanentStateCode: customerInfo.permanent_state_code,
                    correspondenceAddressLine1: customerInfo.correspondence_address_line1,
                    correspondenceAddressLine2: customerInfo.correspondence_address_line2,
                    correspondenceAddressLine3: customerInfo.correspondence_address_line3,
                    correspondenceCity: customerInfo.correspondence_city,
                    correspondenceState: customerInfo.correspondence_state,
                    correspondenceStateCode: customerInfo.correspondence_state_code,
                    photo: customerInfo.profile_img,
                    dob: customerInfo.dob,
                    gender: customerInfo.gender,
                    aadhar: customerInfo.aadhar,
                    guardian: customerInfo.guardian,
                    lockerCenterId: customerInfo.locker_center_id,
                    parentCustomerId: customerInfo.parent_customer_id,
                    secondaryHolderId: customerInfo.secondary_holder_id,
                    thirdHolderId: customerInfo.third_holder_id
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching customer details:', error);
            throw error;
        }
    };

    // Fetch customer visit history
    const fetchCustomerVisitHistory = async (customerId) => {
        if (!customerId) return;

        setHistoryLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${API_URL}/customers/visits/${customerId}?page=1&limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 && response.data?.data?.visits) {
                const formattedHistory = response.data.data.visits.map(visit => ({
                    visit_id: visit.visit_id,
                    accessedBy: visit.accessed_by,
                    customerType: visit.customer_type?.toUpperCase(),
                    time: new Date(visit.entry_time).toLocaleTimeString('en-US',
                        {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }),
                    date: new Date(visit.visit_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    purpose: visit.locker_number ? `Locker ${visit.locker_number}` : 'Locker Access',
                    duration: visit.duration_minutes ? `${visit.duration_minutes} min` : visit.exit_time ? 'Completed' : 'In Progress',
                    status: visit.exit_time ? 'COMPLETED' : 'IN_PROGRESS',
                    authenticated_by: visit.authenticated_by
                }));
                setVisitHistory(formattedHistory);
            }
        } catch (error) {
            console.error('Error fetching visit history:', error);
            toast.error('Failed to fetch visit history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleScanFingerprint = async () => {
        try {
            setIsScanning(true);
            // Simulate biometric authentication
            await new Promise(resolve => setTimeout(resolve, 2000));

            // TODO For demo purposes, using customer ID 1
            // In real implementation, this would come from biometric authentication
            const mockCustomerId = 1;

            const customerDetails = await fetchCustomerDetails(mockCustomerId);
            if (customerDetails) {
                setCustomerData(customerDetails);
                toast.success("Customer identified successfully");

                // Fetch visit history after successful authentication
                await fetchCustomerVisitHistory(mockCustomerId);
            } else {
                toast.error("Customer not found");
            }
        } catch (error) {
            console.error('Error during fingerprint identification:', error);
            toast.error(`Identification failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsScanning(false);
        }
    };
    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error('Webcam not supported on this browser.');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    aspectRatio: { ideal: 16 / 9 }
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
    };
    const handleAccessVaultClick = () => {
        setShowPhotoModal(true);
        startCamera();
    };

    const handleSaveVisit = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('authToken');

            // Prepare visit data
            const visitData = {
                customer_id: customerData.customerId,
                locker_id: customerData.lockerId,
                locker_number: customerData.lockerNo,
                entry_time: new Date().toISOString(),
                visit_photo: visitPhoto,
                authenticated_by: 'biometric', // or 'otp' based on authentication method
                customer_type: customerData.customerType,
                member_id: customerData.memberCode,
                purpose: 'locker_access',
                locker_center_id: customerData.lockerCenterId
            };

            // Send visit data to server
            const response = await axios.post(
                `${API_URL}/customers/visits/record`,
                visitData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 || response.data?.status_code === 201) {
                toast.success("Visit recorded successfully. You may now access the vault.");
                await fetchCustomerVisitHistory(customerData.customerId);
                setVisitPhoto(null);
            } else {
                throw new Error(response.data?.message || 'Failed to record visit');
            }

            setLoading(false);
            setShowPhotoModal(false);
        } catch (error) {
            console.error('Error recording visit:', error);

            let errorMessage = 'Failed to record visit';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            setLoading(false);
        }
    };

    // Handle OTP verification success
    const handleOtpSuccess = async (otpData) => {
        try {
            const customerDetails = await fetchCustomerDetails(otpData.customerId);
            if (customerDetails) {
                setCustomerData(customerDetails);
                toast.success("Customer verified via OTP successfully");

                // Fetch visit history after successful authentication
                await fetchCustomerVisitHistory(otpData.customerId);
            } else {
                toast.error("Customer details not found");
            }
        } catch (error) {
            console.error('Error after OTP verification:', error);
            toast.error('Failed to fetch customer details after OTP verification');
        }
    };

    const handleReset = () => {
        setCustomerData(null);
        setVisitPhoto(null);
        setShowPhotoModal(false);
        setShowOtpModal(false);
        setIsScanning(false);
        setLoading(false);
        setVisitHistory([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">

                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Left Column - Biometric & History */}
                    <div className="xl:col-span-1 space-y-4">
                        {/* Biometric Scan Section */}
                        <div className="bg-white rounded-lg border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                                    <FontAwesomeIcon icon={faFingerprint} className="mr-2 w-4 h-4 text-blue-600" />
                                    Biometric Scanner
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className={`relative rounded-lg p-4 text-center transition-all duration-300 ${isScanning
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                    <div className="mb-3">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-all duration-300 ${isScanning ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'
                                            }`}>
                                            <FontAwesomeIcon
                                                icon={faFingerprint}
                                                className={`text-lg transition-all duration-300 ${isScanning ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`}
                                            />
                                        </div>
                                    </div>
                                    <h3 className={`text-sm font-medium mb-2 transition-all duration-300 ${isScanning ? 'text-blue-800' : 'text-gray-700'}`}>
                                        {isScanning ? 'Scanning...' : 'Ready to Authenticate'}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        {isScanning
                                            ? 'Keep your finger steady on the scanner'
                                            : 'Place your finger on the biometric scanner'
                                        }
                                    </p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleScanFingerprint}
                                            disabled={isScanning}
                                            className={`w-full py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${isScanning
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transform hover:scale-105'
                                                }`}
                                        >
                                            {isScanning ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
                                                    Authenticating...
                                                </div>
                                            ) : (
                                                'Start Authentication'
                                            )}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="w-full py-2 px-3 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
                                        >
                                            <FontAwesomeIcon icon={faArrowsRotate} className="mr-2 w-3 h-3" />
                                            Reset Session
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OTP Verification Section */}
                        <div className="bg-white rounded-lg border border-green-100 shadow-lg shadow-green-100/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-green-100/40 hover:-translate-y-1">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
                                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                                    <FontAwesomeIcon icon={faMobileAlt} className="mr-2 w-4 h-4 text-green-600" />
                                    OTP Verification
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className="relative rounded-lg p-4 text-center transition-all duration-300 bg-gray-50 border border-gray-200">
                                    <div className="mb-3">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-all duration-300 bg-gray-100">
                                            <FontAwesomeIcon
                                                icon={faMobileAlt}
                                                className="text-lg transition-all duration-300 text-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium mb-2 transition-all duration-300 text-gray-700">
                                        Alternative Authentication
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        Verify customer identity using mobile or email OTP
                                    </p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setShowOtpModal(true)}
                                            disabled={isScanning}
                                            className="w-full py-2 px-3 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FontAwesomeIcon icon={faMobileAlt} className="mr-2 w-3 h-3" />
                                            Verify via OTP
                                        </button>
                                    </div>
                                </div>

                                {/* OTP Options Info */}
                                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                                    <div className="text-center">
                                        <p className="text-xs text-green-700 font-medium mb-1">Verification Options</p>
                                        <div className="flex items-center justify-center space-x-4 text-xs text-green-600">
                                            <span className="flex items-center">
                                                <FontAwesomeIcon icon={faPhone} className="mr-1 w-3 h-3" />
                                                Mobile OTP
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center">
                                                <FontAwesomeIcon icon={faEnvelope} className="mr-1 w-3 h-3" />
                                                Email OTP
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Access History */}
                        <div className="bg-white rounded-lg border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                    <FontAwesomeIcon icon={faHistory} className="mr-2 w-4 h-4 text-blue-600" />
                                    Recent Access History
                                    {historyLoading && (
                                        <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                    )}
                                </h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {visitHistory.length > 0 ? (
                                    visitHistory.map((access, index) => (
                                        <div key={access.visit_id || index} className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-xs">
                                                    {access.accessedBy.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-gray-900 truncate text-xs">{access.accessedBy}</h4>
                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${access.customerType === 'PRIMARY'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {access.customerType}
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${access.status === 'COMPLETED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {access.status === 'COMPLETED' ? 'Done' : 'Active'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="font-medium">{access.time}</span>
                                                        <span>•</span>
                                                        <span>{access.date}</span>
                                                        <span>•</span>
                                                        <span>{access.purpose}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        Duration: {access.duration} | Auth: {access.authenticated_by}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : customerData && !historyLoading ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <FontAwesomeIcon icon={faHistory} className="w-8 h-8 text-gray-300 mb-2" />
                                        <p className="text-sm">No recent visits found</p>
                                    </div>
                                ) : !customerData ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <FontAwesomeIcon icon={faInfoCircle} className="w-6 h-6 text-gray-300 mb-2" />
                                        <p className="text-sm">Authenticate to view access history</p>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center">
                                        <div className="animate-pulse space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Customer Details */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-lg border border-blue-100 shadow-lg shadow-blue-100/30 h-full transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1">

                            {customerData ? (
                                <div className="p-6">
                                    {/* Success Header */}
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-3">
                                            <FontAwesomeIcon icon={faCheck} className="text-green-600 w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Authentication Successful</h2>
                                        <p className="text-green-600 font-medium text-sm">Customer verified and authorized for vault access</p>
                                    </div>

                                    {/* Customer Profile */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200 shadow-md shadow-blue-100/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {customerData.photo ? (
                                                    <img
                                                        src={customerData.photo}
                                                        alt="Customer"
                                                        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="w-14 h-14 rounded-lg bg-gray-300 flex items-center justify-center border border-gray-200" style={{ display: customerData.photo ? 'none' : 'flex' }}>
                                                    <FontAwesomeIcon icon={faUser} className="text-lg text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {customerData.name || `${customerData.firstName} ${customerData.lastName}`}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${customerData.customerType === 'PRIMARY'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {customerData.customerType}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p><span className="font-medium text-gray-400">Member ID:</span> {customerData.memberCode}</p>
                                                    <p><span className="font-medium text-gray-400">Customer ID:</span> {customerData.customerId}</p>
                                                    <p><span className="font-medium text-gray-400">PAN:</span> {customerData.panNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unified Details Section with Blue Shadow */}
                                    <div className="bg-white rounded-lg p-6 mb-6 border border-blue-200 shadow-xl shadow-blue-100/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/60 hover:-translate-y-1">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Locker Information */}
                                            <div>
                                                <div className="flex items-center mb-4">
                                                    <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center mr-3">
                                                        <FontAwesomeIcon icon={faLock} className="text-white w-3 h-3" />
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900">Locker Details</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center py-2 border-b border-gray-100">
                                                        <FontAwesomeIcon icon={faHashtag} className="text-blue-600 w-3 h-3 mr-3" />
                                                        <span className="text-sm font-medium text-gray-600 flex-1">Locker Number</span>
                                                        <span className="font-semibold text-gray-900 text-sm">{customerData.lockerNo}</span>
                                                    </div>
                                                    <div className="flex items-center py-2 border-b border-gray-100">
                                                        <FontAwesomeIcon icon={faKey} className="text-blue-600 w-3 h-3 mr-3" />
                                                        <span className="text-sm font-medium text-gray-600 flex-1">Locker Key</span>
                                                        <span className="font-semibold text-gray-900 text-sm">{customerData.lockerKey}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div>
                                                <div className="flex items-center mb-4">
                                                    <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center mr-3">
                                                        <FontAwesomeIcon icon={faIdCard} className="text-white w-4 h-4" />
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900">Contact Details</h4>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <FontAwesomeIcon icon={faPhone} className="text-blue-600 w-3 h-3" />
                                                        <span className="text-xs font-medium text-gray-500 min-w-[60px]">Phone:</span>
                                                        <span className="text-sm text-gray-900">{customerData.mobileNo}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 w-3 h-3" />
                                                        <span className="text-xs font-medium text-gray-500 min-w-[60px]">Email:</span>
                                                        <span className="text-sm text-gray-900">{customerData.email}</span>
                                                    </div>
                                                    <div className="flex items-start space-x-3">
                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 w-3 h-3 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="text-sm text-gray-900 space-y-1">
                                                                <div className="flex">
                                                                    <span className="text-xs font-medium text-gray-500 min-w-[60px]">Address:</span>
                                                                    <span className="ml-2">{customerData.address}</span>
                                                                </div>
                                                                <div className="flex">
                                                                    <span className="text-xs font-medium text-gray-500 min-w-[60px]">City:</span>
                                                                    <span className="ml-2">{customerData.city}</span>
                                                                </div>
                                                                <div className="flex">
                                                                    <span className="text-xs font-medium text-gray-500 min-w-[60px]">State:</span>
                                                                    <span className="ml-2">{customerData.state}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Access Button */}
                                    <div className="text-center">
                                        <button
                                            onClick={handleAccessVaultClick}
                                            disabled={loading}
                                            className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                                        >
                                            <FontAwesomeIcon icon={faLock} className="mr-2 w-4 h-4" />
                                            {loading ? 'Processing...' : 'Access Vault'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* No Customer State */
                                <div className="flex items-center justify-center h-full p-6">
                                    <div className="text-center max-w-md">
                                        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FontAwesomeIcon icon={faUser} className="text-xl text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Customer Authenticated</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            Please use the biometric scanner to authenticate and view customer details.
                                        </p>
                                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                            <div className="flex items-center justify-center text-blue-700">
                                                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 w-4 h-4" />
                                                <span className="text-sm font-medium">Secure authentication required</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Capture Modal */}
            {showPhotoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className=" bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl shadow-blue-500/20 transform transition-all duration-300 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                <FontAwesomeIcon icon={faCamera} className="mr-3 w-5 h-5 text-blue-600" />
                                Capture Visit Photo
                            </h3>
                            <button
                                onClick={() => {
                                    setShowPhotoModal(false);
                                    const stream = videoRef.current?.srcObject;
                                    if (stream) {
                                        stream.getTracks().forEach(track => track.stop());
                                    }
                                }}
                                className="w-8 h-8 cursor-pointer rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-red-200"
                            >
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    className="text-red-500 w-6 h-6"
                                />
                            </button>
                        </div>

                        <div className="photo-capture-container flex flex-col items-center space-y-6">
                            {!visitPhoto ? (
                                <div className="camera-container text-center space-y-4 animate-fade-in">
                                    <div className=" relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-lg shadow-blue-100/50 inline-block border border-blue-200 transform transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/60">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="max-h-80 max-w-full object-contain rounded-lg"
                                            style={{
                                                aspectRatio: 'auto',
                                                width: 'auto',
                                                height: 'auto'
                                            }}
                                        />
                                    </div>
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    <div className="text-center">
                                        <button
                                            onClick={handleCapturePhoto}
                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 cursor-pointer text-sm shadow-lg shadow-blue-500/30 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
                                        >
                                            <FontAwesomeIcon icon={faCamera} className="mr-2 w-4 h-4" beatFade />
                                            Capture Photo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="captured-photo-container text-center space-y-4 animate-fade-in">
                                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-lg shadow-blue-100/50 inline-block border border-blue-200 transform transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/60">
                                        <img
                                            src={visitPhoto}
                                            alt="Captured Visit"
                                            className="max-h-80 max-w-full object-contain rounded-lg"
                                            style={{
                                                aspectRatio: 'auto',
                                                width: 'auto',
                                                height: 'auto'
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={() => {
                                                setVisitPhoto(null);
                                                startCamera();
                                            }}
                                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300 text-sm transform hover:scale-105 shadow-md hover:shadow-lg"
                                        >
                                            <FontAwesomeIcon icon={faArrowsRotate} className="mr-2 w-3 h-3" />
                                            Retake Photo
                                        </button>
                                        <button
                                            onClick={handleSaveVisit}
                                            className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer text-sm transform hover:scale-105"
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="mr-2 w-4 h-4" bounce />
                                            Save & Continue
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Verification Modal */}
            <OtpVerification
                isVisible={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onSuccess={handleOtpSuccess}
                otpType={otpType}
                title="Customer Verification"
                onTypeChange={setOtpType}
            />

            {/* Add CSS animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
            `}</style>
        </div >
    );
};

export default CustomerVisit;
