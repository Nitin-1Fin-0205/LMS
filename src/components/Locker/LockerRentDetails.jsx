import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { ContentLoader } from "../ui";
import { useLockerManagement } from "../../hooks/useLockerManagement";
import LockerAssignmentSection from "./LockerAssignmentSection";
import PaymentDetailsSection from "./PaymentDetailsSection";
import AssignLocker from "./AssignLocker";
import SurrenderLockerModal from "./SurrenderLockerModal";
import ConfirmationModal from "../ui/ConfirmationModal";

const LockerRentDetails = ({ customerId = null }) => {
    const navigate = useNavigate();
    const {
        // State
        lockerDetails,
        centers,
        lockerPlans,
        subscriptionStatus,

        // Loading states
        loading,
        isLoadingCenters,
        isLoadingPlans,
        isSaving,
        isCreatingSubscription,
        isCancellingSubscription,

        // Subscription options
        isImmediateSubscription,
        setIsImmediateSubscription,

        // Surrender modal states
        showSurrenderModal,
        surrenderStep,
        otp,
        setOtp,
        otpError,
        resendTimer,
        responseMobile,
        surrenderConsent,

        // Cancel subscription modal states
        showCancelSubscriptionModal,

        // Utility functions
        isLockerProperlySaved,

        // Event handlers
        handleInputChange,
        updateLockerDetails,
        handleLockerAssign,
        handlePlanSelect,
        handleSaveLockerDetails,
        createSubscription,
        cancelSubscription,
        handleCancelSubscriptionConfirm,
        handleCancelSubscriptionCancel,

        // Surrender functions
        handleSurrenderClick,
        handleSurrenderCancel,
        handleSurrenderConfirm,
        handleOtpVerificationAndSurrender,
        resendOtp,
        handleConsentChange,

        // Primary holder
        primaryHolder
    } = useLockerManagement(customerId);

    // Notify parent of locker data changes
    // React.useEffect(() => {
    //     if (onLockerDataChange) {
    //         onLockerDataChange(lockerDetails);
    //     }
    // }, [lockerDetails, onLockerDataChange]);

    // Show loading spinner while fetching locker details
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="mb-6">
                    <div className="flex items-center text-blue-600 mb-2">
                        <h1 className="text-xl font-semibold">Locker & Rent Details</h1>
                    </div>
                </div>
                <ContentLoader
                    text="Loading locker details..."
                    className="bg-white rounded-lg border border-gray-200 p-8"
                    minHeight="min-h-[400px]"
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-blue-600 mb-2">
                    <h1 className="text-xl font-semibold">Locker & Rent Details</h1>
                    <div className="flex justify-end">
                        <button
                            className="cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-2 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                            onClick={() => navigate(-1)}
                        >
                            <FontAwesomeIcon icon={faArrowLeftLong} className="mr-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Locker Assignment Section */}
                <LockerAssignmentSection
                    lockerDetails={lockerDetails}
                    centers={centers}
                    isLoadingCenters={isLoadingCenters}
                    onInputChange={handleInputChange}
                    onUpdateLockerDetails={updateLockerDetails}
                    onSurrenderClick={handleSurrenderClick}
                />

                {/* Payment Details Section */}
                <PaymentDetailsSection
                    lockerDetails={lockerDetails}
                    lockerPlans={lockerPlans}
                    isLoadingPlans={isLoadingPlans}
                    subscriptionStatus={subscriptionStatus}
                    isCreatingSubscription={isCreatingSubscription}
                    isCancellingSubscription={isCancellingSubscription}
                    isImmediateSubscription={isImmediateSubscription}
                    isSaving={isSaving}
                    primaryHolder={primaryHolder}
                    customerId={customerId}
                    onPlanSelect={handlePlanSelect}
                    onSaveLockerDetails={handleSaveLockerDetails}
                    onCreateSubscription={createSubscription}
                    onCancelSubscription={cancelSubscription}
                    onSetIsImmediateSubscription={setIsImmediateSubscription}
                    isLockerProperlySaved={isLockerProperlySaved}
                />
            </div>

            {/* Modals */}
            {lockerDetails.isModalOpen && (
                <AssignLocker
                    isOpen={lockerDetails.isModalOpen}
                    onLockerAssign={handleLockerAssign}
                    onClose={() => updateLockerDetails({ isModalOpen: false })}
                    centerId={lockerDetails.center}
                />
            )}

            <SurrenderLockerModal
                show={showSurrenderModal}
                onClose={handleSurrenderCancel}
                lockerDetails={lockerDetails}
                onConfirm={handleSurrenderConfirm}
                surrenderStep={surrenderStep}
                otp={otp}
                setOtp={setOtp}
                otpError={otpError}
                handleOtpVerificationAndSurrender={handleOtpVerificationAndSurrender}
                resendOtp={resendOtp}
                resendTimer={resendTimer}
                responseMobile={responseMobile}
                surrenderConsent={surrenderConsent}
                handleConsentChange={handleConsentChange}
                disabled={!(surrenderConsent.keysReceived && surrenderConsent.paymentsCleared && surrenderConsent.lockerEmpty) || surrenderStep === 'processing'}
            />

            <ConfirmationModal
                show={showCancelSubscriptionModal}
                onClose={handleCancelSubscriptionCancel}
                onConfirm={handleCancelSubscriptionConfirm}
                title="Cancel Subscription"
                message="Are you sure you want to cancel your subscription? This action cannot be undone and will immediately terminate your access to the locker."
                confirmText="Cancel Subscription"
                cancelText="Keep Subscription"
                confirmButtonStyle="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                isProcessing={isCancellingSubscription}
            />
        </div>
    );
};

export default LockerRentDetails;
