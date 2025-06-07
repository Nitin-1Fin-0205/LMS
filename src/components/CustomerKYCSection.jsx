import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoCapture from './PhotoCapture';
import BiometricCapture from './BiometricCapture';
import { toast } from 'react-toastify';
import { ROUTES } from '../constants/routes';

const CustomerKYCSection = ({ customerId, holderType, onSuccess, onBack }) => {
    const [fingerprints, setFingerprints] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const handleHome = async () => {
        try {
            navigate(ROUTES.CUSTOMER);

        } catch (error) {
            console.error('Biometric submission error:', error);
            toast.error('Failed to save biometric data');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 min-h-[450px]">
                {/* Photo Capture Section */}
                <div className="flex-1 min-w-0">
                    <PhotoCapture customerId={customerId} />
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px bg-gray-300"></div>
                <div className="lg:hidden h-px bg-gray-300"></div>

                {/* Biometric Section */}
                <div className="flex-1 min-w-0">

                    <BiometricCapture
                        customerId={customerId}
                    // onFingerprintsCaptured={setFingerprints}
                    />
                </div>
            </div>            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                {onBack && (
                    <button
                        type="button"
                        className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onBack}
                        disabled={isSubmitting}
                    >
                        Back
                    </button>
                )}
                <div className="flex gap-3 ml-auto">
                    <button
                        type="button"
                        className="px-6 py-2 bg-blue-600 text-white border-none rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleHome}
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerKYCSection;
