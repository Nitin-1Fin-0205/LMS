import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { otpService } from '../services/otpService';

const OtpVerification = ({
    isVisible,
    onClose,
    onSuccess,
    otpType = 'mobile', // 'mobile' or 'email'
    title = 'OTP Verification',
    onTypeChange = null // Optional callback for type change
}) => {
    const [contactValue, setContactValue] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [requestId, setRequestId] = useState(null);
    const [currentOtpType, setCurrentOtpType] = useState(otpType);

    // Reset states when modal is opened/closed
    useEffect(() => {
        if (isVisible) {
            resetStates();
            setCurrentOtpType(otpType);
        }
    }, [isVisible, otpType]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (resendTimer > 0) {
                clearInterval(window.otpTimerInterval);
            }
        };
    }, []);

    const resetStates = () => {
        setContactValue('');
        setOtpValue('');
        setIsOtpSent(false);
        setOtpLoading(false);
        setResendTimer(0);
        setRequestId(null);
    };

    const validateInput = () => {
        if (!contactValue) {
            toast.error(`Please enter ${currentOtpType === 'mobile' ? 'mobile number' : 'email address'}`);
            return false;
        }

        if (currentOtpType === 'mobile' && !/^[6-9]\d{9}$/.test(contactValue)) {
            toast.error('Please enter a valid 10-digit mobile number');
            return false;
        }

        if (currentOtpType === 'email' && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contactValue)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const sendOtp = async () => {
        if (!validateInput()) return;

        setOtpLoading(true);
        try {
            const response = await (currentOtpType === 'email'
                ? otpService.sendEmailOtp(contactValue)
                : otpService.sendMobileOtp(contactValue)
            );

            // console.log('OTP Response:', response);
            setRequestId(response?.request_id || null);

            if (!response?.request_id) {
                throw new Error('Failed to send OTP');
            }

            setIsOtpSent(true);
            toast.success(`OTP sent to ${contactValue}`);
            startResendTimer();
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error(error.message || `Failed to send ${currentOtpType} OTP`);
        } finally {
            setOtpLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otpValue || otpValue.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setOtpLoading(true);
        try {
            await otpService.verifyOtp(requestId, otpValue);

            toast.success("OTP verified successfully");

            // Call success callback with customer data
            if (onSuccess) {
                onSuccess({
                    customerId: 1, // Mock customer ID for demo - in real implementation this would come from verification response
                    contactValue,
                    otpType: currentOtpType,
                    verified: true
                });
            }

            resetStates();
            onClose();
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error('Invalid OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const startResendTimer = () => {
        setResendTimer(30);
        const timer = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendOtp = () => {
        if (resendTimer === 0) {
            sendOtp();
        }
    };

    const handleClose = () => {
        resetStates();
        onClose();
    };

    const handleTypeChange = (newType) => {
        setCurrentOtpType(newType);
        setContactValue('');
        setOtpValue('');
        setIsOtpSent(false);
        setRequestId(null);
        setResendTimer(0);

        if (onTypeChange) {
            onTypeChange(newType);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <FontAwesomeIcon
                            icon={currentOtpType === 'mobile' ? faPhone : faEnvelope}
                            className="mr-3 w-5 h-5 text-blue-600"
                        />
                        {title}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-red-500 w-4 h-4" />
                    </button>
                </div>

                {/* Type Selector */}
                {onTypeChange && (
                    <div className="mb-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleTypeChange('mobile')}
                                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${currentOtpType === 'mobile'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faPhone} className="mr-2 w-3 h-3" />
                                Mobile
                            </button>
                            <button
                                onClick={() => handleTypeChange('email')}
                                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${currentOtpType === 'email'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faEnvelope} className="mr-2 w-3 h-3" />
                                Email
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {!isOtpSent ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {currentOtpType === 'mobile' ? 'Mobile Number' : 'Email Address'}
                                </label>
                                <input
                                    type={currentOtpType === 'mobile' ? 'tel' : 'email'}
                                    value={contactValue}
                                    onChange={(e) => setContactValue(e.target.value)}
                                    placeholder={currentOtpType === 'mobile' ? 'Enter 10-digit mobile number' : 'Enter email address'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    maxLength={currentOtpType === 'mobile' ? 10 : undefined}
                                />
                            </div>
                            <button
                                onClick={sendOtp}
                                disabled={otpLoading}
                                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {otpLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">
                                    OTP sent to {contactValue}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter 6-digit OTP
                                </label>
                                <input
                                    type="text"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                                    maxLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <button
                                    onClick={verifyOtp}
                                    disabled={otpLoading || otpValue.length !== 6}
                                    className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    onClick={handleResendOtp}
                                    disabled={resendTimer > 0 || otpLoading}
                                    className="w-full py-2 text-blue-600 font-medium hover:text-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOtpSent(false);
                                        setOtpValue('');
                                    }}
                                    className="w-full py-2 text-gray-600 font-medium hover:text-gray-700 transition-all duration-200"
                                >
                                    Change {currentOtpType === 'mobile' ? 'Mobile Number' : 'Email'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CSS animations */}
            <style jsx>{`
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
        </div>
    );
};

export default OtpVerification;
