import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../../assets/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faUpload,
    faCheck,
    faMessage,
    faEnvelope,
    faSms,
} from "@fortawesome/free-solid-svg-icons";
import { ValidationService } from "../../services/ValidationService";
import { otpService } from "../../services/otpService";
import {
    submitCustomerInfo,
    fetchCustomerById,
    updateHolderSection,
} from "../../store/slices/customerSlice";
import { HOLDER_TYPES, HOLDER_SECTIONS } from "../../constants/holderConstants";
import DigilockerModal from "./DigilockerModal";

const CustomerInfo = ({ customerId, holderType, onSuccess, onBack }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const primaryHolder = useSelector(
        (state) => state.customer.form.primaryHolder
    );

    // Get customer data from Redux store based on holder type
    const holderData = useSelector((state) => {
        switch (holderType) {
            case HOLDER_TYPES.PRIMARY:
                return state.customer.form.primaryHolder.customerInfo;
            case HOLDER_TYPES.SECONDARY:
                return state.customer.form.secondaryHolder.customerInfo;
            case HOLDER_TYPES.THIRD:
                return state.customer.form.thirdHolder.customerInfo;
            default:
                return {};
        }
    });

    // Customer Data State
    const [customerData, setCustomerData] = useState({
        customerId: null,
        firstName: "",
        middleName: "",
        lastName: "",
        fatherOrHusbandName: "",
        permanentAddressLine1: "",
        permanentAddressLine2: "",
        permanentAddressLine3: "",
        permanentCity: "",
        permanentState: "",
        permanentStatecode: "",
        correspondenceAddressLine1: "",
        correspondenceAddressLine2: "",
        correspondenceAddressLine3: "",
        correspondenceCity: "",
        correspondenceState: "",
        correspondenceStatecode: "",
        dateOfBirth: "",
        mobileNo: "",
        panNo: "",
        gender: "",
        emailId: "",
        aadharNo: "",
    });
    const [stateList, setStateList] = useState([]);

    // Separate verification states
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // Add state for address checkbox
    const [isSameAddress, setIsSameAddress] = useState(false);

    const [otpVerification, setOtpVerification] = useState({
        emailOtp: "",
        mobileOtp: "",
        isEmailOtpSent: false,
        isMobileOtpSent: false,
    });
    const [isPanFetching, setIsPanFetching] = useState(false);
    const [isPanImageFetching, setIsPanImageFetching] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState(null);
    const [resendTimer, setResendTimer] = useState({ email: 0, mobile: 0 });
    const [request_id, setRequestId] = useState(null);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
    // Update field errors state to include new address fields
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        fatherOrHusbandName: "",
        permanentAddressLine1: "",
        permanentCity: "",
        permanentState: "",
        correspondenceAddressLine1: "",
        correspondenceCity: "",
        correspondenceState: "",
        dateOfBirth: "",
        mobileNo: "",
        panNo: "",
        gender: "",
        emailId: "",
        aadharNo: "",
    });
    const [isDigilockerModalOpen, setIsDigilockerModalOpen] = useState(false);

    // Fetch existing customer data if customerId exists
    useEffect(() => {
        const fetchCustomerDetails = async () => {
            try {
                if (customerId) {
                    setIsLoadingCustomer(true);
                    const userExists = await dispatch(
                        fetchCustomerById({
                            customerId: customerId,
                            holderType,
                        })
                    ).unwrap();

                    if (userExists?.mobile_number) {
                        setIsMobileVerified(true);
                    }
                    if (userExists?.email) {
                        setIsEmailVerified(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching customer details:", error);
                toast.error(`Failed to fetch ${holderType} details`);
            } finally {
                setIsLoadingCustomer(false);
            }
        };

        fetchCustomerDetails();
    }, [dispatch, holderType, customerId]);

    // Update local state when Redux store data changes
    useEffect(() => {
        if (holderData && Object.keys(holderData).length > 0) {
            setCustomerData({
                customerId: holderData.customerId || null,
                firstName: holderData.firstName || "",
                middleName: holderData.middleName || "",
                lastName: holderData.lastName || "",
                fatherOrHusbandName: holderData.fatherOrHusbandName || "",
                permanentAddressLine1: holderData.permanentAddressLine1 || "",
                permanentAddressLine2: holderData.permanentAddressLine2 || "",
                permanentAddressLine3: holderData.permanentAddressLine3 || "",
                permanentCity: holderData.permanentCity || "",
                permanentState: holderData.permanentState || "",
                permanentStatecode: holderData.permanentStatecode || "",
                correspondenceAddressLine1: holderData.correspondenceAddressLine1 || "",
                correspondenceAddressLine2: holderData.correspondenceAddressLine2 || "",
                correspondenceAddressLine3: holderData.correspondenceAddressLine3 || "",
                correspondenceCity: holderData.correspondenceCity || "",
                correspondenceState: holderData.correspondenceState || "",
                correspondenceStatecode: holderData.correspondenceStatecode || "",
                dateOfBirth: holderData.dateOfBirth || "",
                mobileNo: holderData.mobileNo || "",
                panNo: holderData.panNo || "",
                gender: holderData.gender || "",
                emailId: holderData.emailId || "",
                aadharNo: holderData.aadharNo || "",
            });

            // // Set verification states if data exists
            // if (holderData.mobileNo) {
            //     setIsMobileVerified(true);
            // }
            // if (holderData.emailId) {
            //     setIsEmailVerified(true);
            // }

            // Check if addresses are the same and set checkbox accordingly
            if (
                holderData.permanentAddressLine1 &&
                holderData.correspondenceAddressLine1 &&
                holderData.permanentAddressLine1 ===
                holderData.correspondenceAddressLine1 &&
                holderData.permanentCity === holderData.correspondenceCity &&
                holderData.permanentState === holderData.correspondenceState
            ) {
                setIsSameAddress(true);
            }
        }
    }, [holderData]);

    // Fetch state list from API
    const fetchStateList = async () => {
        setIsLoadingStates(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/customers/state-code-list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    accept: "*/*",
                },
            });
            const result = await response.json();
            if (result.status_code === 200) {
                setStateList(result.data);
            } else {
                throw new Error("Failed to fetch state list");
            }
        } catch (error) {
            console.error("Error fetching state list:", error);
            toast.error("Failed to load state list");
        } finally {
            setIsLoadingStates(false);
        }
    };

    useEffect(() => {
        fetchStateList();
    }, []); // Validation handler for single field
    const validateField = (name, value) => {
        let error = "";

        if (!value || value.trim() === "") {
            error = `${name
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())} is required`;
        } else {
            switch (name) {
                case "panNo":
                    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
                        error = "Invalid PAN format";
                    }
                    break;
                case "mobileNo":
                    if (!/^[1-9]\d{9}$/.test(value)) {
                        error = "Invalid mobile number";
                    }
                    break;
                case "emailId":
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        error = "Invalid email format";
                    }
                    break;
                case "aadharNo":
                    if (!/^\d{12}$/.test(value)) {
                        error = "Aadhaar number must be 12 digits";
                    }
                    break;
            }
        }

        setFieldErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
        return !error;
    };

    // Validate all fields at once
    const validateAllFields = () => {
        const requiredFields = [
            "firstName",
            "lastName",
            "fatherOrHusbandName",
            "permanentAddressLine1",
            "permanentCity",
            "permanentState",
            "dateOfBirth",
            "mobileNo",
            "panNo",
            "gender",
            "emailId",
            "aadharNo",
        ];

        // Add correspondence address to required fields if not same as permanent
        if (!isSameAddress) {
            requiredFields.push(
                "correspondenceAddressLine1",
                "correspondenceCity",
                "correspondenceState"
            );
        }

        const newErrors = {};
        let hasErrors = false;

        requiredFields.forEach((field) => {
            const value = customerData[field];
            let error = "";

            if (!value || value.trim() === "") {
                error = `${field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())} is required`;
            } else {
                switch (field) {
                    case "panNo":
                        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
                            error = "Invalid PAN format";
                        }
                        break;
                    case "mobileNo":
                        if (!/^[6-9]\d{9}$/.test(value)) {
                            error = "Invalid mobile number";
                        }
                        break;
                    case "emailId":
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            error = "Invalid email format";
                        }
                        break;
                    case "aadharNo":
                        if (!/^\d{12}$/.test(value)) {
                            error = "Aadhaar number must be 12 digits";
                        }
                        break;
                }
            }

            newErrors[field] = error;
            if (error) hasErrors = true;
        });

        setFieldErrors(newErrors);
        return !hasErrors;
    };

    // Add name validation helper
    const validateNameInput = (value) => {
        return value.replace(/[^a-zA-Z\s.']/g, ""); // Only allow letters, spaces, dots and apostrophes
    }; // Update handle input change
    const handleInputChange = (field, value) => {
        if (
            [
                "firstName",
                "middleName",
                "lastName",
                "fatherOrHusbandName",
                "city",
                "state",
            ].includes(field)
        ) {
            value = validateNameInput(value);
        }

        // Clear error when user starts typing
        setFieldErrors((prev) => ({
            ...prev,
            [field]: "",
        }));

        const updatedData = {
            ...customerData,
            [field]: value || "",
        };
        setCustomerData(updatedData);
        // handleCustomerInfoUpdate(updatedData);
    };
    // Simplified blur handler to validate single field
    const handleBlur = (field) => {
        validateField(field, customerData[field]);
    };

    // Add DOB validation handler
    const handleDobChange = (e) => {
        const value = e.target.value;

        if (value) {
            const year = value.split("-")[0];

            if (year.length > 4) {
                return;
            }

            // Additional validation: Ensure date is not in the future
            const selectedDate = new Date(value);
            const today = new Date();

            if (selectedDate > today) {
                toast.error("Date of birth cannot be in the future");
                return;
            }
        }

        handleInputChange("dateOfBirth", value);
    };

    const handlePanInput = (e) => {
        const pan = e.target.value.toUpperCase();
        handleInputChange("panNo", pan);
        // Validate only if PAN has full length
        // if (pan.length === 10) {
        //     const validation = ValidationService.isValidPAN(pan);
        //     if (!validation.isValid) {
        //         toast.error(validation.error);
        //     }
        // }
    };

    const formatAadhar = (value) => {
        // Remove any non-digits
        const cleaned = value?.replace(/\D/g, "");
        // Add spaces after every 4 digits instead of dashes
        const formatted = cleaned?.replace(/(\d{4})(?=\d)/g, "$1 ");
        return formatted;
    };

    const handleAadharInput = (e) => {
        const input = e.target.value;
        // Remove any non-digits for validation and storage
        const numbersOnly = input.replace(/\D/g, "");

        if (
            numbersOnly === "" ||
            (/^[0-9]+$/.test(numbersOnly) && numbersOnly.length <= 12)
        ) {
            handleInputChange("aadharNo", numbersOnly);

            // Format with spaces
            e.target.value = formatAadhar(numbersOnly);

            if (numbersOnly.length === 12) {
                const validation = ValidationService.validateField(
                    "aadhar",
                    numbersOnly
                );
                if (!validation.isValid) {
                    toast.error(validation.error);
                }
            }
        }
    };

    const handleFetchPan = async () => {
        try {
            if (!customerData.panNo) {
                toast.error("Please enter PAN No to fetch details");
                return;
            }

            setIsPanFetching(true);

            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/customers/fetch-existing-customer?pan=${customerData.panNo}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "accept": "*/*",
                },
            });

            const data = await response.json();
            if (response?.status === 200 && data?.data) {
                const customerInfo = data.data;
                setCustomerData((prev) => {
                    const updatedData = {
                        ...prev,
                        customerId: customerInfo?.customer_id || null,
                        firstName: customerInfo?.first_name || "",
                        middleName: customerInfo?.middle_name || "",
                        lastName: customerInfo?.last_name || "",
                        fatherOrHusbandName: customerInfo?.guardian || "",
                        dateOfBirth: customerInfo?.dob || "",
                        mobileNo: customerInfo?.mobile_number || "",
                        emailId: customerInfo?.email || "",
                        gender: customerInfo?.gender || "",
                        aadharNo: customerInfo?.aadhar || "",
                        permanentAddressLine1: customerInfo?.permanent_address_line1 || "",
                        permanentAddressLine2: customerInfo?.permanent_address_line2 || "",
                        permanentAddressLine3: customerInfo?.permanent_address_line3 || "",
                        permanentCity: customerInfo?.permanent_city || "",
                        permanentState: customerInfo?.permanent_state || "",
                        permanentStatecode: customerInfo?.permanent_state_code || "",
                        correspondenceAddressLine1: customerInfo?.correspondence_address_line1 || "",
                        correspondenceAddressLine2: customerInfo?.correspondence_address_line2 || "",
                        correspondenceAddressLine3: customerInfo?.correspondence_address_line3 || "",
                        correspondenceCity: customerInfo?.correspondence_city || "",
                        correspondenceState: customerInfo?.correspondence_state || "",
                        correspondenceStatecode: customerInfo?.correspondence_state_code || "",
                    };
                    handleCustomerInfoUpdate(updatedData);
                    return updatedData;
                });

                // Set verification states if data exists
                if (customerInfo?.mobile_number) {
                    setIsMobileVerified(true);
                }
                if (customerInfo?.email) {
                    setIsEmailVerified(true);
                }

                toast.success("Customer details fetched successfully");
            } else {
                toast.error("Customer not found with this PAN");
            }
        } catch (error) {
            console.error("Error fetching customer details:", error);
            toast.error("Failed to fetch customer details");
        } finally {
            setIsPanFetching(false);
        }
    };

    const handlePanImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setIsPanImageFetching(true);
            const formData = new FormData();
            formData.append("panImage", file);

            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/customers/pan-ocr`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setCustomerData((prev) => {
                    const updatedData = {
                        ...prev,
                        panNo: data?.panNo || "",
                        firstName: data?.name?.split(" ")[0] || "",
                        middleName: data?.name?.split(" ")[1] || "",
                        lastName: data?.name?.split(" ")[2] || "",
                        dateOfBirth: data?.dob || "",
                    };
                    handleCustomerInfoUpdate(updatedData);
                    return updatedData;
                });
                toast.success("PAN details extracted successfully");
            } else {
                toast.error("Failed to extract PAN details");
            }
        } catch (error) {
            console.error("Error uploading PAN image:", error);
            toast.error("Failed to process PAN image");
        } finally {
            setIsPanImageFetching(false);
        }
    };
    const handleMobileInput = (e) => {
        const value = e.target.value;
        // Only allow numbers
        if (value === "" || /^[0-9\b]+$/.test(value)) {
            // Limit to 10 digits
            if (value.length <= 10) {
                // If the number is changing and was previously verified, reset verification
                if (isMobileVerified && value !== customerData.mobileNo) {
                    setIsMobileVerified(false);
                    setOtpVerification((prev) => ({
                        ...prev,
                        mobileOtp: "",
                    }));
                }
                handleInputChange("mobileNo", value);
            }
        }
    };

    const handleEmailInput = (e) => {
        const value = e.target.value;

        // If the email is changing and was previously verified, reset verification
        if (isEmailVerified && value !== customerData.emailId) {
            setIsEmailVerified(false);
            setOtpVerification((prev) => ({
                ...prev,
                emailOtp: "",
            }));
        }
        handleInputChange("emailId", value);
    };

    const startResendTimer = (type) => {
        setResendTimer((prev) => ({ ...prev, [type]: 30 }));
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                const newTime = prev[type] - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                }
                return { ...prev, [type]: Math.max(0, newTime) };
            });
        }, 1000);
    };

    const handleVerifyOtp = async (type) => {
        try {
            const otp =
                type === "email" ? otpVerification.emailOtp : otpVerification.mobileOtp;

            if (!otp) {
                toast.error("Please enter OTP");
                return;
            }

            await otpService.verifyOtp(request_id, otp);

            // Update separate verification states
            if (type === "email") {
                setIsEmailVerified(true);
            } else {
                setIsMobileVerified(true);
            }

            toast.success(`${type} verified successfully`);
            setShowOtpModal(false);
        } catch (error) {
            toast.error("Invalid OTP");
        }
    };

    const handleOtpClick = async (type) => {
        try {
            setOtpType(type);
            const value =
                type === "email" ? customerData.emailId : customerData.mobileNo;

            // Validate mobile number
            if (type === "mobile") {
                if (!value || value.length !== 10) {
                    toast.error("Please enter valid 10-digit mobile number");
                    return;
                }
            }

            // Validate email
            if (type === "email") {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!value || !emailRegex.test(value)) {
                    toast.error("Please enter valid email address");
                    return;
                }
            }

            const response = await (type === "email"
                ? otpService.sendEmailOtp(value)
                : otpService.sendMobileOtp(value));

            console.log("OTP Response:", response);
            setRequestId(response?.request_id || null);
            if (!response?.request_id) {
                throw new Error("Failed to send OTP");
            }

            startResendTimer(type);
            setOtpVerification((prev) => ({
                ...prev,
                [`is${type === "email" ? "Email" : "Mobile"}OtpSent`]: true,
            }));
            setShowOtpModal(true);
            toast.success(`OTP sent to ${type === "email" ? "email" : "mobile"}`);
        } catch (error) {
            toast.error(error.message || `Failed to send ${type} OTP`);
            console.error(`${type} OTP Error:`, error);
        }
    };

    const OtpInput = React.memo(({ value, onChange, onEnter }) => {
        const inputRef = useRef(null);

        useEffect(() => {
            inputRef.current?.focus();
        }, []);

        const handleChange = (e) => {
            const sanitizedValue = e.target.value.replace(/\D/g, "").slice(0, 6);
            onChange(sanitizedValue);
        };

        const handleKeyPress = (e) => {
            if (e.key === "Enter") {
                onEnter();
            }
        };
        return (
            <input
                ref={inputRef}
                type="text"
                maxLength={6}
                placeholder="000000"
                value={value}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-lg text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 tracking-widest"
                autoComplete="off"
            />
        );
    });
    const OtpModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={() => setShowOtpModal(false)}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Verify {otpType === "email" ? "Email" : "Mobile"}
                </h3>
                <p className="text-gray-600 mb-4">
                    Enter OTP sent to{" "}
                    {otpType === "email" ? customerData.emailId : customerData.mobileNo}
                </p>
                <OtpInput
                    value={otpVerification[`${otpType}Otp`]}
                    onChange={(value) =>
                        setOtpVerification((prev) => ({
                            ...prev,
                            [`${otpType}Otp`]: value,
                        }))
                    }
                    onEnter={() => handleVerifyOtp(otpType)}
                />
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => handleVerifyOtp(otpType)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white border-none rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                        Verify OTP
                    </button>
                    <button
                        onClick={() => handleOtpClick(otpType)}
                        disabled={resendTimer[otpType] > 0}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {resendTimer[otpType] > 0
                            ? `Resend OTP (${resendTimer[otpType]}s)`
                            : "Resend OTP"}
                    </button>
                </div>
            </div>
        </div>
    );

    const handleStateSelect = (e) => {
        const selectedState = stateList.find(
            (state) => state.state_code === parseInt(e.target.value)
        );
        if (selectedState) {
            setCustomerData((prev) => ({
                ...prev,
                state: selectedState.state_name,
                statecode: selectedState.state_code.toString(),
            }));
            // Update parent component
            handleCustomerInfoUpdate({
                ...customerData,
                state: selectedState.state_name,
                statecode: selectedState.state_code.toString(),
            });
        }
    }; // Complete form submission handler
    const handleSubmit = async () => {
        try {
            toast.dismiss();
            setIsSubmitting(true);

            // Validate all fields before submission
            const isValid = validateAllFields();
            if (!isValid) {
                return;
            }

            if (!isMobileVerified) {
                toast.error("Please verify your mobile number");
                return;
            }

            if (!isEmailVerified) {
                toast.error("Please verify your email address");
                return;
            }

            // Prepare submission data
            const submitData = {
                customer_id: customerData.customerId || null,
                first_name: customerData.firstName,
                middle_name: customerData.middleName,
                last_name: customerData.lastName,
                pan: customerData.panNo,
                aadhar: customerData.aadharNo,
                gender: customerData.gender,
                permanent_address_line1: customerData.permanentAddressLine1,
                permanent_address_line2: customerData.permanentAddressLine2,
                permanent_address_line3: customerData.permanentAddressLine3,
                permanent_city: customerData.permanentCity,
                permanent_state: customerData.permanentState,
                permanent_state_code: customerData.permanentStatecode,
                correspondence_address_line1: customerData.correspondenceAddressLine1,
                correspondence_address_line2: customerData.correspondenceAddressLine2,
                correspondence_address_line3: customerData.correspondenceAddressLine3,
                correspondence_city: customerData.correspondenceCity,
                correspondence_state: customerData.correspondenceState,
                correspondence_state_code: customerData.correspondenceStatecode,
                guardian_name: customerData.fatherOrHusbandName,
                dob: customerData.dateOfBirth,
                mobile_number: customerData.mobileNo,
                email: customerData.emailId,
                locker_center_id: 1,
                holder_type: holderType === HOLDER_TYPES.PRIMARY ? 1 : holderType === HOLDER_TYPES.SECONDARY ? 2 : 3,
            };

            // Add parent customer ID for secondary and third holders
            if (holderType !== HOLDER_TYPES.PRIMARY) {
                submitData.parent_customer_id = primaryHolder?.customerInfo?.customerId;
            }

            // Submit using Redux action
            const result = await dispatch(
                submitCustomerInfo({
                    customerData: submitData,
                    holderType,
                })
            ).unwrap();

            if (!result.customerId) {
                throw new Error(`Failed to create ${holderType}`);
            }

            toast.success(`Holder info saved successfully!`);

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(result);
            }
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error(error.message || "Failed to save customer information");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleCustomerInfoUpdate = (data) => {
        dispatch(
            updateHolderSection({
                holder: holderType,
                section: HOLDER_SECTIONS.CUSTOMER_INFO,
                data,
            })
        );
    };

    // Handle address checkbox change
    const handleSameAddressChange = (e) => {
        const checked = e.target.checked;
        setIsSameAddress(checked);

        if (checked) {
            // Copy all permanent address fields to correspondence address
            const updatedData = {
                ...customerData,
                correspondenceAddressLine1: customerData.permanentAddressLine1,
                correspondenceAddressLine2: customerData.permanentAddressLine2,
                correspondenceAddressLine3: customerData.permanentAddressLine3,
                correspondenceCity: customerData.permanentCity,
                correspondenceState: customerData.permanentState,
                correspondenceStatecode: customerData.permanentStatecode,
            };
            setCustomerData(updatedData);
            handleCustomerInfoUpdate(updatedData);
        } else {
            // Clear correspondence address fields when unchecked
            const updatedData = {
                ...customerData,
                correspondenceAddressLine1: "",
                correspondenceAddressLine2: "",
                correspondenceAddressLine3: "",
                correspondenceCity: "",
                correspondenceState: "",
                correspondenceStatecode: "",
            };
            setCustomerData(updatedData);
            handleCustomerInfoUpdate(updatedData);
        }
    };

    // Handle permanent address field changes
    const handlePermanentAddressFieldChange = (field, value) => {
        let updatedData = {
            ...customerData,
            [field]: value,
        };

        // If same address is checked, also update corresponding correspondence field
        if (isSameAddress) {
            const correspondenceField = field.replace("permanent", "correspondence");
            updatedData[correspondenceField] = value;
        }

        setCustomerData(updatedData);
        handleCustomerInfoUpdate(updatedData);
    };

    // Handle permanent state selection
    const handlePermanentStateSelect = (e) => {
        const selectedState = stateList.find(
            (state) => state.state_code === parseInt(e.target.value)
        );
        if (selectedState) {
            let updatedData = {
                ...customerData,
                permanentState: selectedState.state_name,
                permanentStatecode: selectedState.state_code.toString(),
            };

            // If same address is checked, also update correspondence state
            if (isSameAddress) {
                updatedData.correspondenceState = selectedState.state_name;
                updatedData.correspondenceStatecode =
                    selectedState.state_code.toString();
            }

            setCustomerData(updatedData);
            handleCustomerInfoUpdate(updatedData);
        }
    };

    // Handle correspondence state selection
    const handleCorrespondenceStateSelect = (e) => {
        const selectedState = stateList.find(
            (state) => state.state_code === parseInt(e.target.value)
        );
        if (selectedState) {
            const updatedData = {
                ...customerData,
                correspondenceState: selectedState.state_name,
                correspondenceStatecode: selectedState.state_code.toString(),
            };
            setCustomerData(updatedData);
            handleCustomerInfoUpdate(updatedData);
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-lg p-4">
            {isLoadingCustomer ? (
                <div className="flex justify-center items-center min-h-48">
                    <p className="text-gray-600">Loading customer details...</p>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                        <h2 className="text-slate-700 text-xl font-semibold">
                            Customer Information
                        </h2>
                        <button
                            type="button"
                            className="px-4 py-2 bg-green-600 text-white border-none rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                            onClick={() => setIsDigilockerModalOpen(true)}
                        >
                            Fetch Through Digilocker
                        </button>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2 lg:gap-4 mt-4 p-4">
                        {" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                PAN No<span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 items-center w-full min-w-0">
                                <input
                                    type="text"
                                    value={customerData.panNo}
                                    onChange={handlePanInput}
                                    onBlur={() => handleBlur("panNo")}
                                    className={`flex-1 h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.panNo ? "border-red-400 border-[1px]" : ""
                                        }`}
                                    placeholder="Enter PAN no here"
                                    maxLength={10}
                                    required
                                />
                                <button
                                    type="button"
                                    className="px-3 py-2 bg-blue-600 text-white border-none rounded text-sm  cursor-pointer hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleFetchPan}
                                    disabled={isPanFetching || !customerData.panNo || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(customerData.panNo)}
                                >
                                    {isPanFetching ? 'Fetching...' : 'Fetch Details'}
                                </button>
                            </div>
                            {fieldErrors.panNo && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.panNo}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                D.O.B<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={customerData.dateOfBirth}
                                onChange={(e) => handleDobChange(e)}
                                onBlur={() => handleBlur("dateOfBirth")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.dateOfBirth ? "border-red-400 border-[1px]" : ""
                                    }`}
                                max={new Date().toISOString().split("T")[0]}
                                required
                            />
                            {fieldErrors.dateOfBirth && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.dateOfBirth}
                                </div>
                            )}
                        </div>{" "}
                        <div className="flex flex-col min-w-0 col-start-1">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                First Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.firstName ? "border-red-400 border-[1px]" : ""
                                    }`}
                                value={customerData.firstName || ""}
                                onChange={(e) => handleInputChange("firstName", e.target.value)}
                                onBlur={() => handleBlur("firstName")}
                                placeholder="Enter first name"
                                required
                            />
                            {fieldErrors.firstName && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.firstName}
                                </div>
                            )}
                        </div>{" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Middle Name
                            </label>
                            <input
                                type="text"
                                value={customerData.middleName}
                                onChange={(e) =>
                                    handleInputChange("middleName", e.target.value)
                                }
                                placeholder="Enter middle name"
                                className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none"
                            />
                        </div>{" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Last Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerData.lastName}
                                onChange={(e) => handleInputChange("lastName", e.target.value)}
                                onBlur={() => handleBlur("lastName")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.lastName ? "border-red-400 border-[1px]" : ""
                                    }`}
                                placeholder="Enter last name"
                                required
                            />
                            {fieldErrors.lastName && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.lastName}
                                </div>
                            )}
                        </div>{" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Father's / Husband's Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerData.fatherOrHusbandName}
                                onChange={(e) =>
                                    handleInputChange("fatherOrHusbandName", e.target.value)
                                }
                                onBlur={() => handleBlur("fatherOrHusbandName")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.fatherOrHusbandName
                                    ? "border-red-400 border-[1px]"
                                    : ""
                                    }`}
                                placeholder="Enter father/husband name"
                                required
                            />
                            {fieldErrors.fatherOrHusbandName && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.fatherOrHusbandName}
                                </div>
                            )}
                        </div>{" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Gender<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={customerData.gender}
                                onChange={(e) => handleInputChange("gender", e.target.value)}
                                onBlur={() => handleBlur("gender")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.gender ? "border-red-400 border-[1px]" : ""
                                    }`}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">MALE</option>
                                <option value="FEMALE">FEMALE</option>
                                <option value="OTHER">OTHER</option>
                            </select>
                            {fieldErrors.gender && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.gender}
                                </div>
                            )}
                        </div>{" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Aadhaar No<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formatAadhar(customerData?.aadharNo)}
                                onChange={handleAadharInput}
                                onBlur={() => handleBlur("aadharNo")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.aadharNo ? "border-red-400 border-[1px]" : ""
                                    }`}
                                placeholder="Enter Aadhaar (e.g., 1234 5678 9012)"
                                maxLength={14}
                                required
                            />
                            {fieldErrors.aadharNo && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.aadharNo}
                                </div>
                            )}
                        </div>{" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Mobile No<span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 w-full min-w-0">
                                <input
                                    type="tel"
                                    value={customerData.mobileNo}
                                    onChange={handleMobileInput}
                                    onBlur={() => handleBlur("mobileNo")}
                                    className={`flex-1 h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.mobileNo ? "border-red-400 border-[1px]" : ""
                                        }`}
                                    placeholder="Enter mobile number"
                                    required
                                />
                                {isMobileVerified ? (
                                    <span className="text-green-500 text-xs font-bold flex items-center gap-1 h-7 px-2">
                                        <FontAwesomeIcon
                                            className="pt-1"
                                            icon={faCheck}
                                            bounce={true}
                                        />{" "}
                                        Verified
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        className="px-2 bg-green-600 text-white border-none rounded cursor-pointer flex items-center gap-1.5 text-sm transition-all duration-300 h-7 hover:bg-green-700"
                                        onClick={() => handleOtpClick("mobile")}
                                    >
                                        <FontAwesomeIcon icon={faSms} /> Verify
                                    </button>
                                )}
                            </div>
                            {fieldErrors.mobileNo && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.mobileNo}
                                </div>
                            )}
                        </div>{" "}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Email ID<span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 w-full min-w-0">
                                <input
                                    type="email"
                                    value={customerData.emailId}
                                    onChange={handleEmailInput}
                                    onBlur={() => handleBlur("emailId")}
                                    className={`flex-1 h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.emailId ? "border-red-400 border-[1px]" : ""
                                        }`}
                                    placeholder="Enter email"
                                    required
                                />
                                {isEmailVerified ? (
                                    <span className="text-green-500 text-xs font-bold flex items-center gap-1 h-7 px-2">
                                        <FontAwesomeIcon
                                            className="pt-1"
                                            icon={faCheck}
                                            bounce={true}
                                        />{" "}
                                        Verified
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        className="px-2 bg-green-600 text-white border-none rounded cursor-pointer flex items-center gap-1.5 text-sm transition-all duration-300 h-7 hover:bg-green-700"
                                        onClick={() => handleOtpClick("email")}
                                    >
                                        <FontAwesomeIcon icon={faEnvelope} /> Verify
                                    </button>
                                )}
                            </div>
                            {fieldErrors.emailId && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.emailId}
                                </div>
                            )}
                        </div>
                        {/* Permanent Address Section */}{" "}
                        <div className="col-span-full mt-5 mb-2.5">
                            <h3 className="text-base font-semibold text-gray-700 m-0 pb-2 border-b-2 border-gray-200">
                                Permanent Address
                            </h3>
                        </div>{" "}
                        {/* Permanent Address Line 1 */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Address Line 1<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerData.permanentAddressLine1 || ""}
                                onChange={(e) => {
                                    handleInputChange("permanentAddressLine1", e.target.value);
                                    handlePermanentAddressFieldChange(
                                        "permanentAddressLine1",
                                        e.target.value
                                    );
                                }}
                                onBlur={() => handleBlur("permanentAddressLine1")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.permanentAddressLine1
                                    ? "border-red-400 border-[1px]"
                                    : ""
                                    }`}
                                placeholder="Enter address line 1"
                                required
                            />
                            {fieldErrors.permanentAddressLine1 && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.permanentAddressLine1}
                                </div>
                            )}
                        </div>
                        {/* Permanent Address Line 2 */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                value={customerData.permanentAddressLine2 || ""}
                                onChange={(e) => {
                                    handleInputChange("permanentAddressLine2", e.target.value);
                                    handlePermanentAddressFieldChange(
                                        "permanentAddressLine2",
                                        e.target.value
                                    );
                                }}
                                className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none"
                                placeholder="Enter address line 2"
                            />
                        </div>
                        {/* Permanent Address Line 3 */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Address Line 3
                            </label>
                            <input
                                type="text"
                                value={customerData.permanentAddressLine3 || ""}
                                onChange={(e) => {
                                    handleInputChange("permanentAddressLine3", e.target.value);
                                    handlePermanentAddressFieldChange(
                                        "permanentAddressLine3",
                                        e.target.value
                                    );
                                }}
                                className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none"
                                placeholder="Enter address line 3"
                            />
                        </div>
                        {/* Permanent City */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                City<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerData.permanentCity || ""}
                                onChange={(e) => {
                                    handleInputChange("permanentCity", e.target.value);
                                    handlePermanentAddressFieldChange(
                                        "permanentCity",
                                        e.target.value
                                    );
                                }}
                                onBlur={() => handleBlur("permanentCity")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.permanentCity ? "border-red-400 border-[1px]" : ""
                                    }`}
                                placeholder="Enter city"
                                required
                            />
                            {fieldErrors.permanentCity && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.permanentCity}
                                </div>
                            )}
                        </div>
                        {/* Permanent State */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                State<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={customerData.permanentStatecode || ""}
                                onChange={handlePermanentStateSelect}
                                onBlur={() => handleBlur("permanentState")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.permanentState
                                    ? "border-red-400 border-[1px]"
                                    : ""
                                    }`}
                                disabled={isLoadingStates}
                                required
                            >
                                <option value="">Select State</option>
                                {stateList.map((state) => (
                                    <option key={state.state_code} value={state.state_code}>
                                        {state.state_name}
                                    </option>
                                ))}
                            </select>
                            {isLoadingStates && (
                                <span className="text-gray-500 text-sm">Loading states...</span>
                            )}
                            {fieldErrors.permanentState && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.permanentState}
                                </div>
                            )}
                        </div>{" "}
                        {/* Same Address Checkbox */}
                        <div className="col-span-full flex items-center space-x-2 mt-4">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isSameAddress}
                                    onChange={handleSameAddressChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                            </div>
                            <label className="text-sm text-gray-700 cursor-pointer">
                                Correspondence address is same as permanent address
                            </label>
                        </div>{" "}
                        {/* Correspondence Address Section */}
                        <div className="col-span-full mt-5 mb-2.5">
                            <h3 className="text-base font-semibold text-gray-700 m-0 pb-2 border-b-2 border-gray-200">
                                Correspondence Address
                            </h3>
                        </div>{" "}
                        {/* Correspondence Address Line 1 */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Address Line 1<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerData.correspondenceAddressLine1 || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "correspondenceAddressLine1",
                                        e.target.value
                                    )
                                }
                                onBlur={() => handleBlur("correspondenceAddressLine1")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.correspondenceAddressLine1
                                    ? "border-red-400 border-[1px]"
                                    : ""
                                    } ${isSameAddress ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                    }`}
                                placeholder="Enter address line 1"
                                required={!isSameAddress}
                                disabled={isSameAddress}
                            />
                            {fieldErrors.correspondenceAddressLine1 && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.correspondenceAddressLine1}
                                </div>
                            )}
                        </div>
                        {/* Correspondence Address Line 2 */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                value={customerData.correspondenceAddressLine2 || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "correspondenceAddressLine2",
                                        e.target.value
                                    )
                                }
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${isSameAddress ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                    }`}
                                placeholder="Enter address line 2"
                                disabled={isSameAddress}
                            />
                        </div>
                        {/* Correspondence Address Line 3 */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                Address Line 3
                            </label>
                            <input
                                type="text"
                                value={customerData.correspondenceAddressLine3 || ""}
                                onChange={(e) =>
                                    handleInputChange(
                                        "correspondenceAddressLine3",
                                        e.target.value
                                    )
                                }
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${isSameAddress ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                    }`}
                                placeholder="Enter address line 3"
                                disabled={isSameAddress}
                            />
                        </div>
                        {/* Correspondence City */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                City<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerData.correspondenceCity || ""}
                                onChange={(e) =>
                                    handleInputChange("correspondenceCity", e.target.value)
                                }
                                onBlur={() => handleBlur("correspondenceCity")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.correspondenceCity
                                    ? "border-red-400 border-[1px]"
                                    : ""
                                    } ${isSameAddress ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                    }`}
                                placeholder="Enter city"
                                required={!isSameAddress}
                                disabled={isSameAddress}
                            />
                            {fieldErrors.correspondenceCity && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.correspondenceCity}
                                </div>
                            )}
                        </div>
                        {/* Correspondence State */}
                        <div className="flex flex-col min-w-0">
                            <label className="text-sm text-gray-600 font-medium mb-1">
                                State<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={customerData.correspondenceStatecode || ""}
                                onChange={handleCorrespondenceStateSelect}
                                onBlur={() => handleBlur("correspondenceState")}
                                className={`w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-700 transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none ${fieldErrors.correspondenceState
                                    ? "border-red-400 border-[1px]"
                                    : ""
                                    } ${isSameAddress ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                                    }`}
                                disabled={isLoadingStates || isSameAddress}
                                required={!isSameAddress}
                            >
                                <option value="">Select State</option>
                                {stateList.map((state) => (
                                    <option key={state.state_code} value={state.state_code}>
                                        {state.state_name}
                                    </option>
                                ))}
                            </select>
                            {isLoadingStates && (
                                <span className="text-gray-500 text-sm">Loading states...</span>
                            )}
                            {fieldErrors.correspondenceState && (
                                <div className="text-red-500 text-xs mt-1">
                                    {fieldErrors.correspondenceState}
                                </div>
                            )}
                        </div>
                    </div>{" "}
                    {/* Form Actions */}
                    <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                        {onBack && (
                            <button
                                type="button"
                                className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={onBack}
                                disabled={isSubmitting || isLoadingCustomer}
                            >
                                Back
                            </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button
                                type="button"
                                className="px-6 py-2 bg-blue-600 text-white border-none rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSubmit}
                                disabled={isSubmitting || isLoadingCustomer}
                            >
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                            {onSuccess && (
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-green-600 text-white border-none rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={onSuccess}
                                    disabled={!customerData.customerId || isLoadingCustomer}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                    {showOtpModal && <OtpModal />}
                    <DigilockerModal
                        isOpen={isDigilockerModalOpen}
                        onClose={() => setIsDigilockerModalOpen(false)}
                    />
                </>
            )}
        </div>
    );
};

export default CustomerInfo;
