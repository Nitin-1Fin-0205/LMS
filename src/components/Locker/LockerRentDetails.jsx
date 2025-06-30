import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { API_URL } from "../../assets/config";
import {
    surrenderLocker,
    initiateSurrenderLocker,
} from "../../store/slices/lockerSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faKey,
    faMinus,
    faRemove,
    faEraser,
} from "@fortawesome/free-solid-svg-icons";
import AssignLocker from "./AssignLocker";
import { otpService } from "../../services/otpService";
import axios from "axios";
import SurrenderLockerModal from "./SurrenderLockerModal";

const LockerRentDetails = ({ holderType, onLockerDataChange, showSurrenderButton, setShowSurrenderButton }) => {
    const dispatch = useDispatch();

    // Centers state management
    const [centers, setCenters] = useState([]);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);
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
    const [isLoadingPlans, setIsLoadingPlans] = useState(false); // Surrender locker states
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
            const response = await axios.post(
                `${API_URL}/lockers/lockers/rent?lockerId=${lockerId}`,
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

    return (
        <div className="max-w-7xl mx-auto  space-y-4  ">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center text-blue-600 mb-2">
                    {/* <FontAwesomeIcon icon={faKey} className="w-5 h-5 mr-2" /> */}
                    <h1 className="text-xl font-semibold">Locker & Rent Details</h1>
                </div>
                {/* <p className="text-gray-600 text-sm">Manage customer locker assignment and payment details</p> */}
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
                            <select
                                value={lockerDetails.center}
                                onChange={(e) => handleInputChange("center", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={isLoadingCenters}
                            >
                                <option value="">Select Center</option>
                                {centers.map((center) => (
                                    <option key={center.id} value={center.id}>
                                        {center.name}
                                    </option>
                                ))}
                            </select>
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
                                    className="px-3 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-r hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
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
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Locker Actions
                                </label>
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
                            <select
                                value={lockerDetails.selectedPlan || ""}
                                onChange={(e) => handlePlanSelect(e.target.value)}
                                disabled={isLoadingPlans}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select a plan</option>
                                {lockerPlans.map((plan) => (
                                    <option key={plan.planId} value={plan.planId}>
                                        {plan.name} - ₹{plan.grandTotalAmount}
                                    </option>
                                ))}
                            </select>
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
