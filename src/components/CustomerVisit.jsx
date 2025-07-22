import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

import BiometricScanner from './CustomerVisit/BiometricScanner';
import OtpAuthenticator from './CustomerVisit/OtpAuthenticator';
import VisitHistory from './CustomerVisit/VisitHistory';
import CustomerDetails from './CustomerVisit/CustomerDetails';
import PhotoCaptureModal from './CustomerVisit/PhotoCaptureModal';
import LockerSelectionModal from './CustomerVisit/LockerSelectionModal';
import CustomerVisitService from '../services/customerVisitService';

const CustomerVisit = () => {
    const [customerData, setCustomerData] = useState(null);
    const [visitPhoto, setVisitPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showLockerSelectionModal, setShowLockerSelectionModal] = useState(false);
    const [visitHistory, setVisitHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [lockerAccessData, setLockerAccessData] = useState([]);
    const [selectedLocker, setSelectedLocker] = useState(null);

    const handleBiometricScanSuccess = async (fingerprintData) => {
        try {
            toast.info('Fingerprint captured. Matching against Users...', { autoClose: 3000 });

            const matchResult = await CustomerVisitService.matchFingerprint(fingerprintData);

            if (matchResult.success) {
                // Check locker access scenarios
                if (matchResult.hasNoLockers) {
                    toast.error("No locker access found for this customer");
                    return;
                }

                if (matchResult.hasMultipleLockers) {
                    // Show locker selection modal
                    setLockerAccessData(matchResult.lockerAccess);
                    setShowLockerSelectionModal(true);

                    // Get customer details for display in modal
                    const customerDetails = await CustomerVisitService.fetchCustomerDetails(matchResult.customerId);
                    if (customerDetails) {
                        setCustomerData(customerDetails);
                    }
                } else {
                    // Single locker - proceed directly
                    const selectedLockerInfo = matchResult.lockerAccess[0];
                    const customerDetails = await CustomerVisitService.fetchCustomerDetails(matchResult.customerId);

                    if (customerDetails) {
                        // Update customer data with selected locker info
                        const updatedCustomerData = {
                            ...customerDetails,
                            lockerNo: selectedLockerInfo.locker_number,
                            lockerId: selectedLockerInfo.locker_id,
                            lockerKey: selectedLockerInfo.locker_key,
                            memberCode: selectedLockerInfo.member_id,
                            customerType: selectedLockerInfo.access_type,
                            lockerSize: selectedLockerInfo.size
                        };

                        setCustomerData(updatedCustomerData);
                        setSelectedLocker(selectedLockerInfo);
                        await fetchCustomerVisitHistory(selectedLockerInfo.locker_id);
                    } else {
                        toast.error("Customer details not found");
                    }
                }
            } else {
                toast.error(matchResult.message || 'No matching fingerprint found in database');
            }
        } catch (error) {
            console.error('Error during fingerprint identification:', error);
            let errorMessage = 'Fingerprint identification failed';

            if (error.message?.includes('timeout')) {
                errorMessage = 'Fingerprint capture timed out. Please try again.';
            } else if (error.message?.includes('quality')) {
                errorMessage = 'Fingerprint quality too low. Please clean finger and try again.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage);
        }
    };

    const handleBiometricScanError = (error) => {
        console.error('Biometric scan error:', error);
        toast.error('Failed to capture fingerprint');
    };

    const handleOtpSuccess = async (otpData) => {
        try {
            // Check locker access scenarios similar to biometric flow
            if (otpData.hasNoLockers) {
                toast.error("No locker access found for this customer");
                return;
            }

            if (otpData.hasMultipleLockers) {
                // Show locker selection modal
                setLockerAccessData(otpData.lockerAccess);
                setShowLockerSelectionModal(true);

                // Get customer details for display in modal
                const customerDetails = await CustomerVisitService.fetchCustomerDetails(otpData.customerId);
                if (customerDetails) {
                    setCustomerData(customerDetails);
                }
            } else {
                // Single locker - proceed directly
                const selectedLockerInfo = otpData.lockerAccess[0];
                const customerDetails = await CustomerVisitService.fetchCustomerDetails(otpData.customerId);

                if (customerDetails) {
                    // Update customer data with selected locker info
                    const updatedCustomerData = {
                        ...customerDetails,
                        lockerNo: selectedLockerInfo.locker_number,
                        lockerId: selectedLockerInfo.locker_id,
                        lockerKey: selectedLockerInfo.locker_key,
                        memberCode: selectedLockerInfo.member_id,
                        customerType: selectedLockerInfo.access_type,
                        lockerSize: selectedLockerInfo.size
                    };

                    setCustomerData(updatedCustomerData);
                    setSelectedLocker(selectedLockerInfo);
                    await fetchCustomerVisitHistory(otpData.customerId);
                } else {
                    toast.error("Customer details not found");
                }
            }
        } catch (error) {
            console.error('Error after OTP verification:', error);
            toast.error('Failed to fetch customer details after OTP verification');
        }
    };

    const fetchCustomerVisitHistory = async (lockerId) => {
        if (!lockerId) return;

        setHistoryLoading(true);
        try {
            const history = await CustomerVisitService.fetchCustomerVisitHistory(lockerId);
            setVisitHistory(history);
        } catch (error) {
            console.error('Error fetching visit history:', error);
            toast.error('Failed to fetch visit history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleAccessVaultClick = () => {
        setShowPhotoModal(true);
    };

    const handleSaveVisit = async () => {
        try {
            setLoading(true);

            // Validate visit photo
            if (!visitPhoto || visitPhoto === 'data:,' || visitPhoto.length < 50) {
                toast.error('Please capture a valid photo before recording the visit');
                return;
            }

            const visitData = {
                customer_id: customerData.customerId,
                locker_id: customerData.lockerId,
                locker_number: customerData.lockerNo,
                entry_time: new Date().toISOString(),
                visit_photo: visitPhoto,
                authenticated_by: 'biometric',
                customer_type: customerData.customerType,
                member_id: customerData.memberCode,
                purpose: 'locker_access',
                locker_center_id: customerData.lockerCenterId
            };

            console.log('Visit data payload:', visitData);
            await CustomerVisitService.recordVisit(visitData);
            toast.success("Visit recorded successfully. You may now access the vault.");
            await fetchCustomerVisitHistory(customerData.lockerId);
            setVisitPhoto(null);
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
        } finally {
            setLoading(false);
        }
    };

    const handleLockerSelection = async (selectedLockerInfo) => {
        try {
            setShowLockerSelectionModal(false);

            // Update customer data with selected locker info
            const updatedCustomerData = {
                ...customerData,
                lockerNo: selectedLockerInfo.locker_number,
                lockerId: selectedLockerInfo.locker_id,
                lockerKey: selectedLockerInfo.locker_key,
                memberCode: selectedLockerInfo.member_id,
                customerType: selectedLockerInfo.access_type,
                lockerSize: selectedLockerInfo.size
            };

            setCustomerData(updatedCustomerData);
            setSelectedLocker(selectedLockerInfo);
            await fetchCustomerVisitHistory(selectedLockerInfo.locker_id);

            // toast.success(`Locker ${selectedLockerInfo.locker_number} selected successfully`);
        } catch (error) {
            console.error('Error selecting locker:', error);
            toast.error('Failed to select locker');
        }
    };

    const handleReset = () => {
        setCustomerData(null);
        setVisitPhoto(null);
        setShowPhotoModal(false);
        setShowLockerSelectionModal(false);
        setLockerAccessData([]);
        setSelectedLocker(null);
        setLoading(false);
        setVisitHistory([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Left Column - Authentication & History */}
                    <div className="xl:col-span-1 space-y-4">
                        <BiometricScanner
                            onScanSuccess={handleBiometricScanSuccess}
                            onScanError={handleBiometricScanError}
                        />

                        <OtpAuthenticator
                            onOtpSuccess={handleOtpSuccess}
                            disabled={loading}
                        />
                        {/* Reset Button */}
                        <div className="text-center">
                            <button
                                onClick={handleReset}
                                className="w-full py-2 px-3 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 transform hover:scale-105"
                            >
                                <FontAwesomeIcon icon={faArrowsRotate} className="mr-2 w-3 h-3" />
                                Reset Session
                            </button>
                        </div>
                        <VisitHistory
                            visitHistory={visitHistory}
                            customerData={customerData}
                            historyLoading={historyLoading}
                        />


                    </div>

                    {/* Right Column - Customer Details */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-lg border border-blue-100 shadow-lg shadow-blue-100/30 h-full transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1">
                            <CustomerDetails
                                customerData={customerData}
                                onAccessVault={handleAccessVaultClick}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <PhotoCaptureModal
                isOpen={showPhotoModal}
                onClose={() => setShowPhotoModal(false)}
                visitPhoto={visitPhoto}
                setVisitPhoto={setVisitPhoto}
                onSaveVisit={handleSaveVisit}
                loading={loading}
            />

            <LockerSelectionModal
                isOpen={showLockerSelectionModal}
                onClose={() => setShowLockerSelectionModal(false)}
                lockerAccess={lockerAccessData}
                onLockerSelect={handleLockerSelection}
                customerName={customerData?.name || `${customerData?.firstName} ${customerData?.lastName}`}
            />

            {/* CSS animations */}
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
        </div>
    );
};

export default CustomerVisit;
