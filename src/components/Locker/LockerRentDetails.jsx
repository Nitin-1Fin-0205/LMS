import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { API_URL } from "../../assets/config";
import {
    surrenderLocker,
    initiateSurrenderLocker,
    assignLocker,
} from "../../store/slices/lockerSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faKey,
    faMinus,
    faRemove,
    faEraser,
    faArrowLeft,
    faArrowLeftLong,
} from "@fortawesome/free-solid-svg-icons";
import AssignLocker from "./AssignLocker";
import { otpService } from "../../services/otpService";
import axios from "axios";
import SurrenderLockerModal from "./SurrenderLockerModal";
import { Loader, InlineLoader, ContentLoader } from "../ui";
import { SUBSCRIPTION_STATUS, SubscriptionHelpers } from "../../constants/subscriptionStatus";

const LockerRentDetails = ({
    holderType,
    onLockerDataChange,
    showSurrenderButton,
    setShowSurrenderButton,
}) => {
    const dispatch = useDispatch();

    // Centers state management
    const [centers, setCenters] = useState([]);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Internal saving state
    let initialLockerDetails = {
        lockerId: "",
        center: "",
        assignedLocker: "",
        remarks: "",
        lockerSize: "",
        lockerKey: "",
        selectedPlan: "",
        upiId: "",
        rentDetails: {
            deposit: "",
            rent: "",
            admissionFees: "",
            total: "",
        },
        isModalOpen: false,
    }
    const [lockerDetails, setLockerDetails] = useState(initialLockerDetails);

    const [loading, setLoading] = useState(false);
    const [lockerPlans, setLockerPlans] = useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
    const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
    const [isImmediateSubscription, setIsImmediateSubscription] = useState(true);
    const [showSurrenderModal, setShowSurrenderModal] = useState(false);
    const [surrenderStep, setSurrenderStep] = useState("confirm"); // 'confirm', 'otp', 'processing'
    const [otpRequestId, setOtpRequestId] = useState(null);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [responseMobile, setResponseMobile] = useState(null);
    const primaryHolder = useSelector(
        (state) => state.customer.form.primaryHolder
    );

    const [surrenderConsent, setSurrenderConsent] = useState({
        keysReceived: false,
        paymentsCleared: false,
        lockerEmpty: false
    });

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

    // Function to fetch locker details directly from API
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
                    upiId: lockerData.upi_id || "",
                    rentDetails: lockerData.rent_details || {
                        deposit: "",
                        rent: "",
                        admissionFees: "",
                        total: "",
                    },
                }));

                // If plan exists, fetch the plans and set the details
                if (lockerData.plan_id && lockerData.lockerId) {
                    await fetchPlansForLocker(lockerData.lockerId);
                }

                setShowSurrenderButton(true);
            }
        } catch (error) {
            console.error("Error fetching locker details:", error);
            // Don't show error toast if no locker is assigned yet
            if (error.response?.status !== 404) {
                toast.error("Failed to fetch locker details");
            }
        } finally {
            // Always set loading to false, whether success or failure
            setLoading(false);
        }
    };

    const isLockerProperlySaved = () => {
        return !!(
            lockerDetails.lockerId &&
            lockerDetails.assignedLocker &&
            lockerDetails.center &&
            lockerDetails.selectedPlan &&
            showSurrenderButton
        );
    };

    // Function to update locker details locally
    const updateLockerDetails = (updates) => {
        setLockerDetails((prev) => ({
            ...prev,
            ...updates,
        }));
    };

    const handleInputChange = (field, value) => {
        updateLockerDetails({ [field]: value });
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

    const fetchPlansForLocker = async (lockerId) => {
        console.log("Fetching plans for locker ID:", lockerId);
        try {
            setIsLoadingPlans(true);
            const token = localStorage.getItem("authToken");
            const customerId = primaryHolder?.customerInfo?.customerId;

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
                setLockerPlans(response.data.plans || []);                // Handle subscription status from API response
                if (response.data.subscriptionStatus) {
                    const subscriptionInfo = response.data.subscriptionStatus;

                    // Set subscription status based on API response
                    if (subscriptionInfo.hasActiveSubscription && subscriptionInfo.currentSubscription) {
                        const currentSub = subscriptionInfo.currentSubscription;

                        // Use the subscription status directly from the API
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
                            status: 'none',
                            details: null,
                            hasActiveSubscription: false,
                            canCreateNew: true
                        });
                    }

                    console.log("Subscription Status:", subscriptionInfo);

                    // Log subscription details for debugging
                    if (subscriptionInfo.hasActiveSubscription) {
                        console.log("Customer has active subscription:", subscriptionInfo.currentSubscription);

                        // You can add UI logic here based on subscription status
                        // For example, show different UI elements or disable certain actions
                        if (!subscriptionInfo.canCreateNew) {
                            console.log("Customer cannot create new subscription - already has active one");
                        }
                    }
                } else {
                    // Try to fetch subscription status separately if not included in main response
                    try {
                        const subscriptionResponse = await axios.get(
                            `${API_URL}/payment/customer/${customerId}/subscriptions?locker_id=${lockerId}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'accept': 'application/json'
                                }
                            }
                        );

                        if (subscriptionResponse.data?.success) {
                            const subscriptions = subscriptionResponse.data.data || []; const activeSubscription = subscriptions.find(sub =>
                                SubscriptionHelpers.isActive(sub.status)
                            );

                            if (activeSubscription) {
                                setSubscriptionStatus({
                                    status: activeSubscription.status,
                                    details: {
                                        ...activeSubscription,
                                        isActive: SubscriptionHelpers.isActive(activeSubscription.status),
                                        needsAction: SubscriptionHelpers.needsUserAction(activeSubscription.status),
                                        isPending: activeSubscription.status === SUBSCRIPTION_STATUS.PENDING,
                                        isExpired: activeSubscription.status === SUBSCRIPTION_STATUS.EXPIRED
                                    },
                                    hasActiveSubscription: true,
                                    canCreateNew: false
                                });
                            } else {
                                const hasAnySubscription = subscriptions.length > 0;
                                if (hasAnySubscription) {
                                    // Set to the most recent subscription status
                                    const latestSub = subscriptions[subscriptions.length - 1];
                                    setSubscriptionStatus({
                                        status: latestSub.status,
                                        details: {
                                            ...latestSub,
                                            isActive: SubscriptionHelpers.isActive(latestSub.status),
                                            needsAction: SubscriptionHelpers.needsUserAction(latestSub.status),
                                            isPending: latestSub.status === SUBSCRIPTION_STATUS.PENDING,
                                            isExpired: latestSub.status === SUBSCRIPTION_STATUS.EXPIRED
                                        },
                                        hasActiveSubscription: SubscriptionHelpers.isActive(latestSub.status),
                                        canCreateNew: SubscriptionHelpers.isTerminalState(latestSub.status)
                                    });
                                } else {
                                    setSubscriptionStatus({
                                        status: 'none',
                                        details: null,
                                        hasActiveSubscription: false,
                                        canCreateNew: true
                                    });
                                }
                            }
                        } else {
                            setSubscriptionStatus({
                                status: 'none',
                                details: null,
                                hasActiveSubscription: false,
                                canCreateNew: true
                            });
                        }
                    } catch (subscriptionError) {
                        console.warn("Could not fetch subscription status separately:", subscriptionError);
                        setSubscriptionStatus({
                            status: 'none',
                            details: null,
                            hasActiveSubscription: false,
                            canCreateNew: true
                        });
                    }
                }

                // toast.success('Plans fetched successfully');
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            toast.error("Failed to fetch plans");
        } finally {
            setIsLoadingPlans(false);
        }
    }; // Fetch locker details and centers on component mount
    useEffect(() => {
        // Fetch centers
        fetchCenters();

        const customerId = primaryHolder?.customerInfo?.customerId;
        if (customerId) {
            // Fetch locker details from API
            fetchLockerDetails(customerId);
        }
    }, [primaryHolder?.customerInfo?.customerId]);

    // Notify parent of locker data changes
    useEffect(() => {
        if (onLockerDataChange) {
            onLockerDataChange(lockerDetails);
        }
    }, [lockerDetails, onLockerDataChange]);

    useEffect(() => {
        if (lockerDetails?.lockerId) {
            fetchPlansForLocker(lockerDetails.lockerId);
        }
    }, [lockerDetails.lockerId]);

    useEffect(() => {
        const fetchPlanAndUpdateRent = async () => {
            if (lockerDetails?.selectedPlan && lockerPlans.length > 0) {
                const selectedPlan = lockerPlans.find(
                    (plan) => Number(plan.planId) === Number(lockerDetails.selectedPlan)
                );
                if (selectedPlan) {
                    updateLockerDetails({
                        rentDetails: {
                            deposit: selectedPlan.deposit,
                            rent: selectedPlan.baseRent,
                            admissionFees: selectedPlan.admissionFees,
                            total: selectedPlan.grandTotalAmount,
                        },
                    });
                }
            }
        };

        fetchPlanAndUpdateRent();
    }, [lockerDetails.selectedPlan, lockerPlans]);
    const handleLockerAssign = async (locker) => {
        updateLockerDetails({
            assignedLocker: locker?.locker_number || "",
            lockerId: locker?.locker_id || null,
            lockerSize: locker?.size || "",
            lockerKey: locker?.locker_key || "",
            isModalOpen: false,
        });
        console.log("Locker assigned:", locker);
    };
    const handlePlanSelect = (planId) => {
        const selectedPlan = lockerPlans.find((plan) => plan.planId === planId);
        if (selectedPlan) {
            console.log("Selected plan:", selectedPlan);
            // Update lockerDetails with plan information
            updateLockerDetails({
                selectedPlan: planId,
                rentDetails: {
                    deposit: selectedPlan.deposit,
                    rent: selectedPlan.baseRent,
                    admissionFees: selectedPlan.admissionFees,
                    total: selectedPlan.grandTotalAmount,
                },
            });
        }
    };

    // Surrender locker functions
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

            // Use the initiate surrender API to send OTP
            const response = await dispatch(
                initiateSurrenderLocker({
                    customerId: primaryHolder?.customerInfo?.customerId,
                    lockerId: lockerDetails.lockerId,
                })
            ).unwrap();

            // Store the request_id from the response for OTP verification
            if (response.data && response.data.request_id) {
                setOtpRequestId(response.data.request_id);
            } else if (response.request_id) {
                setOtpRequestId(response.request_id);
            }

            // Store the mobile number from the response
            if (response.data && response.data.mobile) {
                setResponseMobile(response.data.mobile);
            } else if (response.mobile) {
                setResponseMobile(response.mobile);
            }

            setSurrenderStep("otp");
            startResendTimer(); // Start the 30-second cooldown
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

            // First verify OTP using the existing otpService
            const otpResponse = await otpService.verifyOtp(otpRequestId, otp);
            console.log("OTP Verification Response:", otpResponse);

            if (!otpResponse) {
                throw new Error("OTP verification failed");
            }

            // After successful OTP verification, complete the surrender
            await dispatch(
                surrenderLocker({
                    customerId: primaryHolder?.customerInfo?.customerId,
                    lockerId: lockerDetails.lockerId,
                })
            ).unwrap();
            toast.success("Locker surrendered successfully!");
            setShowSurrenderModal(false);
            setSurrenderStep("confirm");
            setOtpRequestId(null);
            setOtp("");
            setOtpError("");
            setResendTimer(0);
            setResponseMobile(null);
            //reset locker details
            setLockerDetails(initialLockerDetails);
        } catch (error) {
            console.error("Error in surrender process:", error);
            setOtpError(error.message || "Failed to surrender locker");
            setSurrenderStep("otp");
        }
    };
    const resendOtp = async () => {
        if (resendTimer > 0) {
            return;
        }
        try {
            // Re-initiate surrender to resend OTP
            const response = await dispatch(
                initiateSurrenderLocker({
                    customerId: primaryHolder?.customerInfo?.customerId,
                    lockerId: lockerDetails.lockerId,
                })
            ).unwrap();

            // Update the request_id for the new OTP
            if (response.data && response.data.request_id) {
                setOtpRequestId(response.data.request_id);
            } else if (response.request_id) {
                setOtpRequestId(response.request_id);
            }

            // Update the mobile number from the response
            if (response.data && response.data.mobile) {
                setResponseMobile(response.data.mobile);
            } else if (response.mobile) {
                setResponseMobile(response.mobile);
            }

            startResendTimer(); // Start the 30-second cooldown again
            toast.success("OTP resent successfully");
            setOtpError("");
        } catch (error) {
            toast.error("Failed to resend OTP");
        }
    };

    const handleConsentChange = (field) => {
        setSurrenderConsent(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Subscription management functions
    const createSubscription = async () => {
        try {
            setIsCreatingSubscription(true);
            const token = localStorage.getItem("authToken");
            const customerId = primaryHolder?.customerInfo?.customerId;

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
                // Refresh the subscription status
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
        try {
            setIsCancellingSubscription(true);
            const token = localStorage.getItem("authToken");
            const customerId = primaryHolder?.customerInfo?.customerId;

            if (!customerId || !subscriptionStatus?.hasActiveSubscription) {
                toast.error("No active subscription found to cancel");
                return;
            }

            // Show confirmation dialog
            const confirmed = window.confirm(
                "Are you sure you want to cancel the subscription? This action cannot be undone."
            );

            if (!confirmed) {
                setIsCancellingSubscription(false);
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
                // Refresh the subscription status
                await fetchPlansForLocker(lockerDetails.lockerId);
            }
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            toast.error(error.response?.data?.message || "Failed to cancel subscription");
        } finally {
            setIsCancellingSubscription(false);
        }
    };

    // Handle locker assignment/save
    const handleSaveLockerDetails = async () => {
        try {
            setIsSaving(true);
            console.log("Current Locker Data:", lockerDetails);

            if (!lockerDetails?.upiId) {
                toast.error("UPI ID is required");
                return;
            }

            if (!lockerDetails?.lockerId || !lockerDetails?.selectedPlan) {
                toast.error("Please assign a locker and select a plan");
                return;
            }

            const lockerAssignmentData = {
                customerId: primaryHolder?.customerInfo?.customerId,
                lockerId: lockerDetails.lockerId,
                centerId: lockerDetails.center,
                planId: lockerDetails.selectedPlan,
                expiryDate: "2024-06-30",
                payFrequency: 1,
                upiId: lockerDetails.upiId,
            };

            const response = await dispatch(assignLocker(lockerAssignmentData)).unwrap();
            toast.success("Locker assigned successfully!");
            console.log("Locker assignment response:", response);

            if (response.status_code === 200 || response.status_code === 201) {
                setShowSurrenderButton(true);
                // Refresh subscription status after successful assignment
                await fetchPlansForLocker(lockerDetails.lockerId);
            }
        } catch (error) {
            console.error("Error assigning locker:", error);
            toast.error(error.message || "Failed to assign locker");
        } finally {
            setIsSaving(false);
        }
    };    // Show loading spinner while fetching locker details
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center text-blue-600 mb-2">
                        <h1 className="text-xl font-semibold">Locker & Rent Details</h1>
                    </div>
                </div>

                {/* Loading State */}
                <ContentLoader
                    text="Loading locker details..."
                    className="bg-white rounded-lg border border-gray-200 p-8"
                    minHeight="min-h-[400px]"
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto  space-y-4  ">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-blue-600 mb-2">
                    {/* <FontAwesomeIcon icon={faKey} className="w-5 h-5 mr-2" /> */}
                    <h1 className="text-xl font-semibold">Locker & Rent Details</h1>
                    {/* back button to right end  */}
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
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-4">
                        <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center mr-2">
                            <svg
                                className="w-3 h-3 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h2 className="text-base font-medium text-gray-900">
                            Locker Assignment
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {/* Center Selection */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Center <span className="text-red-500">*</span>
                            </label>
                            {isLoadingCenters ? (
                                <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 flex items-center">
                                    <InlineLoader
                                        size="sm"
                                        text="Loading centers..."
                                        color="blue"
                                    />
                                </div>
                            ) : (
                                <select
                                    value={lockerDetails.center}
                                    onChange={(e) => handleInputChange("center", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Center</option>
                                    {centers.map((center) => (
                                        <option key={center.id} value={center.id}>
                                            {center.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        {/* Assign Locker */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Assign Locker <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={`${lockerDetails.assignedLocker}${lockerDetails.lockerSize
                                        ? ` (${lockerDetails.lockerSize})`
                                        : ""
                                        }`}
                                    placeholder="Select locker"
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    readOnly
                                />
                                <button
                                    onClick={() => updateLockerDetails({ isModalOpen: true })}
                                    disabled={!lockerDetails.center}
                                    className="px-3 py-2 bg-green-500 text-white rounded-r hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                                    title={
                                        lockerDetails.assignedLocker
                                            ? "Change Locker"
                                            : "Assign Locker"
                                    }
                                >
                                    <FontAwesomeIcon icon={faPlus} className="text-xm" />
                                </button>
                            </div>
                        </div>
                        {/* Locker Key No */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Locker Key No <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                title="Select locker first."
                                placeholder="Auto-filled on locker assignment"
                                value={lockerDetails.lockerKey || ""}
                                onChange={(e) => handleInputChange("lockerKey", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none  cursor-not-allowed"
                                readOnly
                            />
                        </div>{" "}
                        {/* Surrender Locker Button - Only show when locker is properly assigned and saved */}
                        {lockerDetails.assignedLocker && isLockerProperlySaved() && (
                            <div>
                                {/* <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Locker Actions
                                </label> */}
                                <button
                                    onClick={handleSurrenderClick}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-102 shadow-sm hover:shadow-md flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faEraser} className="mr-2" />
                                    Surrender Locker
                                </button>


                            </div>
                        )}
                    </div>
                </div>
                {/* Payment Details Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-4">
                        <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center mr-2">
                            <svg
                                className="w-3 h-3 text-purple-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2H6z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-medium text-gray-900">
                            Payment Details
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {/* Select Plan */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Plan <span className="text-red-500">*</span>
                            </label>
                            {isLoadingPlans ? (
                                <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 flex items-center">
                                    <InlineLoader
                                        size="sm"
                                        text="Loading plans..."
                                        color="blue"
                                    />
                                </div>
                            ) : (
                                <select
                                    value={lockerDetails.selectedPlan || ""}
                                    onChange={(e) => handlePlanSelect(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a plan</option>
                                    {lockerPlans.map((plan) => (
                                        <option key={plan.planId} value={plan.planId}>
                                            {plan.name} - ₹{plan.grandTotalAmount}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Payment Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Deposit <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-500 text-xm">
                                        ₹
                                    </span>
                                    <input
                                        type="text"
                                        value={lockerDetails.rentDetails?.deposit || ""}
                                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Rent <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-500 text-xm">
                                        ₹
                                    </span>
                                    <input
                                        type="text"
                                        value={lockerDetails.rentDetails?.rent || ""}
                                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Admission Fees */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Admission Fees <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-gray-500 text-xm">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    value={lockerDetails.rentDetails?.admissionFees || ""}
                                    className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Total */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Total <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-blue-600 text-xm font-medium">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    value={lockerDetails.rentDetails?.total || ""}
                                    className="w-full pl-6 pr-2 py-2 text-sm border border-blue-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium text-blue-900"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* UPI ID */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={lockerDetails.upiId || ""}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, "");
                                    handleInputChange("upiId", value);
                                }}
                                placeholder="Enter UPI ID"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Assign Locker Button - Only show if no locker is assigned yet */}
                    {!isLockerProperlySaved() && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <button
                                className="w-full px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                onClick={handleSaveLockerDetails}
                                disabled={
                                    !lockerDetails?.lockerId ||
                                    !lockerDetails?.selectedPlan ||
                                    !lockerDetails?.upiId ||
                                    isSaving
                                }
                            >
                                {isSaving ? 'Assigning Locker...' : 'Assign Locker'}
                            </button>
                        </div>
                    )}

                    {/* Subscription Management Section - Show when locker is properly saved */}
                    {isLockerProperlySaved() && primaryHolder?.customerInfo?.customerId && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="space-y-4">
                                {/* Subscription Status */}
                                {subscriptionStatus && (
                                    <div className="space-y-3">
                                        {/* Header with Status Badge */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Payment Subscription Status:
                                                </span>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${SubscriptionHelpers.getStatusClasses(subscriptionStatus.status || subscriptionStatus)}`}>
                                                    {SubscriptionHelpers.getDisplayText(subscriptionStatus.status || subscriptionStatus)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Subscription Information */}
                                        {subscriptionStatus.details && (
                                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Subscription ID:</span>
                                                        <p className="font-medium text-gray-900 text-xs">
                                                            {subscriptionStatus.details.subscriptionId}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Amount per Cycle:</span>
                                                        <p className="font-medium text-green-600">
                                                            ₹{subscriptionStatus.details.amountPerCycle}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Paid Cycles:</span>
                                                        <p className="font-medium text-gray-900">
                                                            {subscriptionStatus.details.paidCycles} / {subscriptionStatus.details.totalCycles}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Remaining Cycles:</span>
                                                        <p className="font-medium text-blue-600">
                                                            {subscriptionStatus.details.remainingCycles}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Next Charge Date */}
                                                {subscriptionStatus.details.nextChargeAt && (
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <span className="text-gray-600 text-sm">Next Charge Date:</span>
                                                        <p className="font-medium text-orange-600">
                                                            {new Date(subscriptionStatus.details.nextChargeAt).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Current Period End */}
                                                {subscriptionStatus.details.currentEnd && (
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <span className="text-gray-600 text-sm">Current Period Ends:</span>
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(subscriptionStatus.details.currentEnd).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Created Date */}
                                                <div className="pt-2 border-t border-gray-200">
                                                    <span className="text-gray-600 text-sm">Created On:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(subscriptionStatus.details.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status-specific messages */}
                                        {subscriptionStatus.details?.needsAction && (
                                            <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                Action required: Please update your payment method or contact support.
                                            </div>
                                        )}

                                        {subscriptionStatus.details?.isPending && (
                                            <div className="text-sm text-orange-700 bg-orange-50 p-2 rounded border border-orange-200">
                                                <i className="fas fa-clock mr-2"></i>
                                                Payment is pending. We'll retry automatically.
                                            </div>
                                        )}

                                        {subscriptionStatus.details?.isExpired && (
                                            <div className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                                <i className="fas fa-times-circle mr-2"></i>
                                                This subscription has expired. Please create a new subscription.
                                            </div>
                                        )}

                                        {SubscriptionHelpers.isTerminalState(subscriptionStatus.status) && subscriptionStatus.status !== 'none' && (
                                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                This subscription has ended and cannot be reactivated. You can create a new subscription if needed.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Subscription Configuration */}
                                {(subscriptionStatus.status === 'none' ||
                                    (!subscriptionStatus.hasActiveSubscription || subscriptionStatus.details?.isExpired) && subscriptionStatus.canCreateNew) && (
                                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="immediateSubscription"
                                                    checked={isImmediateSubscription}
                                                    onChange={(e) => setIsImmediateSubscription(e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <label htmlFor="immediateSubscription" className="text-sm font-medium text-blue-900 cursor-pointer">
                                                    Start subscription immediately
                                                </label>
                                            </div>
                                            <p className="text-xs text-blue-700 mt-1 ml-6">
                                                {isImmediateSubscription
                                                    ? "Subscription will start immediately upon creation"
                                                    : "Subscription will start according to the plan schedule"
                                                }
                                            </p>
                                        </div>
                                    )}

                                {/* Subscription Action Buttons */}
                                <div className="flex gap-3">
                                    {/* Create Subscription Button - Consolidated logic for all cases where subscription can be created */}
                                    {(subscriptionStatus.status === 'none' ||
                                        (!subscriptionStatus.hasActiveSubscription || subscriptionStatus.details?.isExpired) && subscriptionStatus.canCreateNew) && (
                                            <button
                                                onClick={createSubscription}
                                                disabled={isCreatingSubscription}
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                {isCreatingSubscription ? (
                                                    <InlineLoader
                                                        size="sm"
                                                        text="Creating Subscription..."
                                                        color="white"
                                                        className="w-full text-center"
                                                    />
                                                ) : (
                                                    <>
                                                        <i className="fas fa-plus mr-2"></i>
                                                        {subscriptionStatus.details?.isExpired ? 'Renew Subscription' : 'Create Subscription'}
                                                    </>
                                                )}
                                            </button>
                                        )}

                                    {/* Cancel Subscription Button - Show for all active/cancellable subscription states */}
                                    {(subscriptionStatus.hasActiveSubscription ||
                                        (subscriptionStatus.status && !SubscriptionHelpers.isTerminalState(subscriptionStatus.status) && subscriptionStatus.status !== 'none')) && (
                                            <button
                                                onClick={cancelSubscription}
                                                disabled={isCancellingSubscription}
                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                {isCancellingSubscription ? (
                                                    <InlineLoader
                                                        size="sm"
                                                        text="Cancelling Subscription..."
                                                        color="white"
                                                    />
                                                ) : (
                                                    <>
                                                        <i className="fas fa-times mr-2"></i>
                                                        Cancel Subscription
                                                    </>
                                                )}
                                            </button>
                                        )}

                                    {/* Action Button for Pending/Failed Payments */}
                                    {subscriptionStatus.details?.needsAction && (
                                        <button
                                            onClick={() => {
                                                // This could open a payment update modal or redirect to payment page
                                                toast.info("Please contact support to update your payment method.");
                                            }}
                                            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                                        >
                                            <i className="fas fa-credit-card mr-2"></i>
                                            Update Payment Method
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>{" "}
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

            {/* Surrender Locker Modal */}
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
        </div>
    );
};

export default LockerRentDetails;
