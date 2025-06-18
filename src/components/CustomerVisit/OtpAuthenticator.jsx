import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import OtpVerification from '../OtpVerification';

const OtpAuthenticator = ({ onOtpSuccess, disabled }) => {
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState('mobile');

    const handleOtpSuccess = (otpData) => {
        setShowOtpModal(false);
        onOtpSuccess(otpData);
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
                                onClick={() => setShowOtpModal(true)}
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

            <OtpVerification
                isVisible={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onSuccess={handleOtpSuccess}
                otpType={otpType}
                title="Customer Verification"
                onTypeChange={setOtpType}
            />
        </>
    );
};

export default OtpAuthenticator;
