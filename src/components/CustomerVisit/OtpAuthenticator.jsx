import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faPhone, faEnvelope, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import CustomerVisitService from '../../services/customerVisitService';

const OtpAuthenticator = ({ onOtpSuccess, disabled }) => {
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState('mobile');
    const [contactValue, setContactValue] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requestData, setRequestData] = useState(null);

    const handleOtpModalOpen = () => {
        resetOtpFlow();
        setShowOtpModal(true);
    };

    const resetOtpFlow = () => {
        setContactValue('');
        setOtpValue('');
        setIsOtpSent(false);
        setLoading(false);
        setRequestData(null);
    };

    const handleSendOtp = async () => {
        try {
            if (!contactValue.trim()) {
                toast.error(`Please enter ${otpType === 'mobile' ? 'mobile number' : 'email address'}`);
                return;
            }

            // Validate input
            if (otpType === 'mobile' && !/^[6-9]\d{9}$/.test(contactValue)) {
                toast.error('Please enter a valid 10-digit mobile number');
                return;
            }

            if (otpType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
                toast.error('Please enter a valid email address');
                return;
            }

            setLoading(true);

            const identifierType = otpType === 'mobile' ? 1 : 2;
            const result = await CustomerVisitService.identifyByContact(contactValue, identifierType);

            if (result.success) {
                setRequestData(result);
                setIsOtpSent(true);
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            if (!otpValue || otpValue.length !== 6) {
                toast.error('Please enter a valid 6-digit OTP');
                return;
            }

            setLoading(true);

            const result = await CustomerVisitService.verifyIdentificationOtp(
                requestData.requestId,
                requestData.customerId,
                otpValue
            );

            if (result.success) {
                toast.success('Customer verified successfully');
                setShowOtpModal(false);
                resetOtpFlow();

                // Pass the result to parent component with locker access information
                onOtpSuccess({
                    customerId: result.customerId,
                    lockerAccess: result.lockerAccess,
                    hasMultipleLockers: result.hasMultipleLockers,
                    hasNoLockers: result.hasNoLockers,
                    contactValue: contactValue,
                    otpType: otpType
                });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error('Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleContactValueChange = (e) => {
        const value = e.target.value;
        if (otpType === 'mobile') {
            // Only allow numbers for mobile
            if (value === '' || /^[0-9]+$/.test(value)) {
                setContactValue(value.slice(0, 10));
            }
        } else {
            setContactValue(value);
        }
    };

    const handleClose = () => {
        setShowOtpModal(false);
        resetOtpFlow();
    };

    return (
        <>
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
                                onClick={handleOtpModalOpen}
                                disabled={disabled}
                                className="w-full py-2 px-3 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faMobileAlt} className="mr-2 w-3 h-3" />
                                Verify via OTP
                            </button>
                        </div>
                    </div>

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

            {/* Custom OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                            onClick={handleClose}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Customer Verification
                        </h3>

                        {!isOtpSent ? (
                            <>
                                {/* Contact Method Selection */}
                                <div className="mb-4">
                                    <label className="text-sm text-gray-600 font-medium mb-2 block">
                                        Verification Method
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="otpType"
                                                value="mobile"
                                                checked={otpType === 'mobile'}
                                                onChange={(e) => setOtpType(e.target.value)}
                                                className="mr-2"
                                            />
                                            <FontAwesomeIcon icon={faPhone} className="mr-1" />
                                            Mobile
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="otpType"
                                                value="email"
                                                checked={otpType === 'email'}
                                                onChange={(e) => setOtpType(e.target.value)}
                                                className="mr-2"
                                            />
                                            <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
                                            Email
                                        </label>
                                    </div>
                                </div>

                                {/* Contact Input */}
                                <div className="mb-4">
                                    <label className="text-sm text-gray-600 font-medium mb-1 block">
                                        {otpType === 'mobile' ? 'Mobile Number' : 'Email Address'}
                                    </label>
                                    <input
                                        type={otpType === 'mobile' ? 'tel' : 'email'}
                                        value={contactValue}
                                        onChange={handleContactValueChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none"
                                        placeholder={
                                            otpType === 'mobile'
                                                ? 'Enter 10-digit mobile number'
                                                : 'Enter email address'
                                        }
                                        maxLength={otpType === 'mobile' ? 10 : undefined}
                                    />
                                </div>

                                <button
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-green-600 text-white border-none rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600">
                                        OTP sent to {requestData?.maskedIdentifier}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Expires in {requestData?.expiresIn}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="text-sm text-gray-600 font-medium mb-1 block">
                                        Enter 6-digit OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={otpValue}
                                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none text-center text-lg tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={loading || otpValue.length !== 6}
                                        className="w-full px-4 py-2 bg-green-600 text-white border-none rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {loading ? 'Verifying...' : 'Verify OTP'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsOtpSent(false);
                                            setOtpValue('');
                                        }}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
                                    >
                                        Change {otpType === 'mobile' ? 'Mobile Number' : 'Email'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default OtpAuthenticator;
