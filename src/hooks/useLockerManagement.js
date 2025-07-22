import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../assets/config";
import {
    surrenderLocker,
    initiateSurrenderLocker,
    assignLocker,
} from "../store/slices/lockerSlice";
import { otpService } from "../services/otpService";
import { SUBSCRIPTION_STATUS, SubscriptionHelpers } from "../constants/subscriptionStatus";

export const useLockerManagement = (customerId = null) => {
    const dispatch = useDispatch();
    const primaryHolder = useSelector(
        (state) => state.customer.form.primaryHolder
    );

    // Use provided customerId or fallback to Redux state
    const effectiveCustomerId = customerId || primaryHolder?.customerInfo?.customerId;

    // Initial state
    const initialLockerDetails = {
        lockerId: "",
        center: "",
        assignedLocker: "",
        remarks: "",
        lockerSize: "",
        lockerKey: "",
        selectedPlan: "",
        isModalOpen: false,
        allowSurrenderLocker: false,
    };

    // State management
    const [lockerDetails, setLockerDetails] = useState(initialLockerDetails);
    const [centers, setCenters] = useState([]);
    const [lockerPlans, setLockerPlans] = useState([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
    const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);

    // Tracking if locker has been successfully assigned in backend
    const [isLockerAssignedInBackend, setIsLockerAssignedInBackend] = useState(false);

    // Subscription options
    const [isImmediateSubscription, setIsImmediateSubscription] = useState(true);

    // Surrender modal states
    const [showSurrenderModal, setShowSurrenderModal] = useState(false);
    const [surrenderStep, setSurrenderStep] = useState("confirm");
    const [otpRequestId, setOtpRequestId] = useState(null);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [responseMobile, setResponseMobile] = useState(null);
    const [surrenderConsent, setSurrenderConsent] = useState({
        keysReceived: false,
        paymentsCleared: false,
        lockerEmpty: false
    });

    // Cancel subscription modal states
    const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);

    // Utility functions
    const updateLockerDetails = (updates) => {
        setLockerDetails((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const resetCompleteForm = async () => {
        // Reset all form states
        setLockerDetails(initialLockerDetails);
        setLockerPlans([]);
        setSubscriptionStatus(null);
        setIsImmediateSubscription(true);
        setIsLockerAssignedInBackend(false);

        // Reset surrender modal states
        setShowSurrenderModal(false);
        setSurrenderStep("confirm");
        setOtpRequestId(null);
        setOtp("");
        setOtpError("");
        setResendTimer(0);
        setResponseMobile(null);
        setSurrenderConsent({
            keysReceived: false,
            paymentsCleared: false,
            lockerEmpty: false
        });

        // Reset cancel subscription modal
        setShowCancelSubscriptionModal(false);

        // Refetch customer data
        const customerIdToUse = effectiveCustomerId;
        if (customerIdToUse) {
            await fetchLockerDetails(customerIdToUse);
        }
    };

    const isLockerProperlySaved = () => {
        return !!(
            lockerDetails.lockerId &&
            lockerDetails.assignedLocker &&
            lockerDetails.center &&
            lockerDetails.selectedPlan &&
            isLockerAssignedInBackend // Must be assigned in backend too
        );
    };

    // Timer function for resend OTP cooldown
    const startResendTimer = () => {
        setResendTimer(30);
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // API functions
    const fetchCenters = async () => {
        try {
            setIsLoadingCenters(true);
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_URL}/lockers/locker-centers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCenters(response.data);
        } catch (error) {
            toast.error("Failed to fetch centers");
        } finally {
            setIsLoadingCenters(false);
        }
    };

    const fetchLockerDetails = async (customerId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            const response = await axios.get(
                `${API_URL}/lockers/locker-details?customer_id=${customerId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data?.data?.lockers?.[0]) {
                const lockerData = response.data.data.lockers[0];

                setLockerDetails((prev) => ({
                    ...prev,
                    assignedLocker: lockerData.lockerNumber || "",
                    lockerId: lockerData.lockerId || "",
                    center: lockerData.center_id || "",
                    lockerKey: lockerData.locker_key || "",
                    selectedPlan: lockerData.plan_id || "",
                    lockerSize: lockerData.size || "",
                    allowSurrenderLocker: lockerData.allow_surrender_locker || false,
                }));

                // Mark that locker is assigned in backend
                setIsLockerAssignedInBackend(true);

                if (lockerData.plan_id && lockerData.lockerId) {
                    await fetchPlansForLocker(lockerData.lockerId);
                }
            } else {
                // No locker found - ensure all fields are reset and surrender is not allowed
                setLockerDetails(initialLockerDetails);
                setLockerPlans([]);
                setSubscriptionStatus(null);
                setIsLockerAssignedInBackend(false);
            }
        } catch (error) {
            console.error("Error fetching locker details:", error);
            if (error.response?.status !== 404) {
                toast.error("Failed to fetch locker details");
            }
            // On error, also reset to initial state
            setLockerDetails(initialLockerDetails);
            setLockerPlans([]);
            setSubscriptionStatus(null);
            setIsLockerAssignedInBackend(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlansForLocker = async (lockerId) => {
        try {
            setIsLoadingPlans(true);
            const token = localStorage.getItem("authToken");
            const customerId = effectiveCustomerId;

            if (!customerId) {
                console.error("Customer ID not found");
                return;
            }

            const response = await axios.post(
                `${API_URL}/lockers/lockers/rent?lockerId=${lockerId}&customerId=${customerId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setLockerPlans(response.data.plans || []);

                // Handle subscription status
                if (response.data.subscriptionStatus) {
                    const subscriptionInfo = response.data.subscriptionStatus;

                    if (subscriptionInfo.hasActiveSubscription && subscriptionInfo.currentSubscription) {
                        const currentSub = subscriptionInfo.currentSubscription;
                        setSubscriptionStatus({
                            status: currentSub.status,
                            details: {
                                ...currentSub,
                                isActive: SubscriptionHelpers.isActive(currentSub.status),
                                needsAction: SubscriptionHelpers.needsUserAction(currentSub.status),
                                isPending: currentSub.status === SUBSCRIPTION_STATUS.PENDING,
                                isExpired: currentSub.status === SUBSCRIPTION_STATUS.EXPIRED
                            },
                            hasActiveSubscription: subscriptionInfo.hasActiveSubscription,
                            canCreateNew: subscriptionInfo.canCreateNew,
                            customerInfo: subscriptionInfo.customerInfo
                        });
                    } else if (subscriptionInfo.hasCancelledSubscription) {
                        setSubscriptionStatus({
                            status: SUBSCRIPTION_STATUS.CANCELLED,
                            details: {
                                status: SUBSCRIPTION_STATUS.CANCELLED,
                                isActive: false,
                                needsAction: false,
                                isPending: false,
                                isExpired: false
                            },
                            hasActiveSubscription: false,
                            canCreateNew: true,
                            customerInfo: subscriptionInfo.customerInfo
                        });
                    } else {
                        setSubscriptionStatus({
                            status: 'Not Available',
                            details: null,
                            hasActiveSubscription: false,
                            canCreateNew: true
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            toast.error("Failed to fetch plans");
        } finally {
            setIsLoadingPlans(false);
        }
    };

    // Event handlers
    const handleInputChange = (field, value) => {
        updateLockerDetails({ [field]: value });
    };

    const handleLockerAssign = async (locker) => {
        updateLockerDetails({
            assignedLocker: locker?.locker_number || "",
            lockerId: locker?.locker_id || null,
            lockerSize: locker?.size || "",
            lockerKey: locker?.locker_key || "",
            isModalOpen: false,
            allowSurrenderLocker: false, // Reset surrender permission when selecting new locker
        });

        // Reset backend assignment flag since this is a new selection
        setIsLockerAssignedInBackend(false);
    };

    const handlePlanSelect = (planId) => {
        const selectedPlan = lockerPlans.find((plan) => plan.planId === planId);
        if (selectedPlan) {
            updateLockerDetails({
                selectedPlan: planId,
            });
        }
    };

    const handleSaveLockerDetails = async () => {
        try {
            setIsSaving(true);

            if (!lockerDetails?.lockerId || !lockerDetails?.selectedPlan) {
                toast.error("Please assign a locker and select a plan");
                return;
            }

            const lockerAssignmentData = {
                customerId: effectiveCustomerId,
                lockerId: lockerDetails.lockerId,
                centerId: lockerDetails.center,
                planId: lockerDetails.selectedPlan,
                expiryDate: "2024-06-30",
                payFrequency: 1,
            };

            const response = await dispatch(assignLocker(lockerAssignmentData)).unwrap();
            toast.success("Locker assigned successfully!"); if (response.status_code === 200 || response.status_code === 201) {
                // After successful assignment, refetch plans and update surrender permission
                await fetchPlansForLocker(lockerDetails.lockerId);

                // Mark that locker is now successfully assigned in backend
                setIsLockerAssignedInBackend(true);

                // Update surrender permission based on successful assignment
                updateLockerDetails({
                    allowSurrenderLocker: true // Only allow surrender after successful assignment
                });
            }
        } catch (error) {
            console.error("Error assigning locker:", error);
            toast.error(error.message || "Failed to assign locker");
        } finally {
            setIsSaving(false);
        }
    };

    // Subscription management
    const createSubscription = async () => {
        try {
            setIsCreatingSubscription(true);
            const token = localStorage.getItem("authToken");
            const customerId = effectiveCustomerId;

            if (!customerId || !lockerDetails.selectedPlan || !lockerDetails.lockerId) {
                toast.error("Missing required data for subscription creation");
                return;
            }

            const subscriptionData = {
                plan_id: String(lockerDetails.selectedPlan),
                customer_id: parseInt(customerId),
                center_id: parseInt(lockerDetails.center),
                locker_number: lockerDetails.assignedLocker,
                locker_assignment_id: parseInt(lockerDetails.lockerId),
                is_immediate: isImmediateSubscription
            };

            const response = await axios.post(
                `${API_URL}/payment/create-locker-subscription`,
                subscriptionData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success("Subscription created successfully!");
                await fetchPlansForLocker(lockerDetails.lockerId);
            }
        } catch (error) {
            console.error("Error creating subscription:", error);
            toast.error(error.response?.data?.message || "Failed to create subscription");
        } finally {
            setIsCreatingSubscription(false);
        }
    };

    const cancelSubscription = async () => {
        // Show custom modal instead of window.confirm
        setShowCancelSubscriptionModal(true);
    };

    const handleCancelSubscriptionConfirm = async () => {
        try {
            setIsCancellingSubscription(true);
            const token = localStorage.getItem("authToken");
            const customerId = effectiveCustomerId;

            if (!customerId || !subscriptionStatus?.hasActiveSubscription) {
                toast.error("No active subscription found to cancel");
                setShowCancelSubscriptionModal(false);
                return;
            }

            const cancelData = {
                customer_id: parseInt(customerId),
                center_id: parseInt(lockerDetails.center),
                locker_id: lockerDetails.lockerId,
                plan_id: String(lockerDetails.selectedPlan),
                cancel_at_cycle_end: false,
                reason: "Customer request",
                notes: {
                    cancelled_by: "customer",
                    immediate: true
                }
            };

            const response = await axios.put(
                `${API_URL}/payment/locker-subscription/cancel`,
                cancelData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success("Subscription cancelled successfully!");
                await fetchPlansForLocker(lockerDetails.lockerId);
                setShowCancelSubscriptionModal(false);
            }
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            toast.error(error.response?.data?.message || "Failed to cancel subscription");
        } finally {
            setIsCancellingSubscription(false);
        }
    };

    const handleCancelSubscriptionCancel = () => {
        setShowCancelSubscriptionModal(false);
    };

    // Surrender functions
    const handleSurrenderClick = () => {
        setShowSurrenderModal(true);
        setSurrenderStep("confirm");
        setOtpError("");
        setOtp("");
    };

    const handleSurrenderCancel = () => {
        setShowSurrenderModal(false);
        setSurrenderStep("confirm");
        setOtpRequestId(null);
        setOtp("");
        setOtpError("");
        setResendTimer(0);
        setResponseMobile(null);
    };

    const handleSurrenderConfirm = async () => {
        try {
            setSurrenderStep("processing");

            const response = await dispatch(
                initiateSurrenderLocker({
                    customerId: effectiveCustomerId,
                    lockerId: lockerDetails.lockerId,
                })
            ).unwrap();

            if (response.data && response.data.request_id) {
                setOtpRequestId(response.data.request_id);
            } else if (response.request_id) {
                setOtpRequestId(response.request_id);
            }

            if (response.data && response.data.mobile) {
                setResponseMobile(response.data.mobile);
            } else if (response.mobile) {
                setResponseMobile(response.mobile);
            }

            setSurrenderStep("otp");
            startResendTimer();
            toast.success("OTP sent to your registered mobile number");
        } catch (error) {
            console.error("Error initiating surrender:", error);
            toast.error(error.message || "Failed to send OTP");
            setSurrenderStep("confirm");
        }
    };

    const handleOtpVerificationAndSurrender = async () => {
        if (!otp || otp.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP");
            return;
        }

        if (!otpRequestId) {
            setOtpError("OTP session expired. Please try again.");
            setSurrenderStep("confirm");
            return;
        }

        try {
            setSurrenderStep("processing");
            setOtpError("");

            const otpResponse = await otpService.verifyOtp(otpRequestId, otp);

            if (!otpResponse) {
                throw new Error("OTP verification failed");
            }

            await dispatch(
                surrenderLocker({
                    customerId: effectiveCustomerId,
                    lockerId: lockerDetails.lockerId,
                })
            ).unwrap();

            toast.success("Locker surrendered successfully!");

            // Complete form reset and refetch
            await resetCompleteForm();
        } catch (error) {
            console.error("Error in surrender process:", error);
            setOtpError(error.message || "Failed to surrender locker");
            setSurrenderStep("otp");
        }
    };

    const resendOtp = async () => {
        if (resendTimer > 0) return;

        try {
            const response = await dispatch(
                initiateSurrenderLocker({
                    customerId: effectiveCustomerId,
                    lockerId: lockerDetails.lockerId,
                })
            ).unwrap();

            if (response.data && response.data.request_id) {
                setOtpRequestId(response.data.request_id);
            } else if (response.request_id) {
                setOtpRequestId(response.request_id);
            }

            if (response.data && response.data.mobile) {
                setResponseMobile(response.data.mobile);
            } else if (response.mobile) {
                setResponseMobile(response.mobile);
            }

            startResendTimer();
            toast.success("OTP resent successfully");
            setOtpError("");
        } catch (error) {
            toast.error("Failed to resend OTP");
        }
    };

    const handleConsentChange = (field) => {
        setSurrenderConsent(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Effects
    useEffect(() => {
        fetchCenters();
        if (effectiveCustomerId) {
            fetchLockerDetails(effectiveCustomerId);
        }
    }, [effectiveCustomerId]);

    useEffect(() => {
        if (lockerDetails?.lockerId) {
            fetchPlansForLocker(lockerDetails.lockerId);
        }
    }, [lockerDetails.lockerId]);

    return {
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
        isLockerProperlySaved: isLockerProperlySaved(),
        isLockerAssignedInBackend,
        resetCompleteForm,

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
    };
};
