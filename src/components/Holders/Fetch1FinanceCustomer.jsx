import React, { useState } from "react";
import { toast } from "react-toastify";
import { otpService } from "../../services/otpService";
import { API_URL } from "../../assets/config";

const Fetch1FinanceCustomer = ({ onFetchSuccess }) => {
    const [showModal, setShowModal] = useState(false);
    const [mobileInput, setMobileInput] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [otp, setOtp] = useState("");
    const [requestId, setRequestId] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const openModal = () => {
        setShowModal(true);
        setMobileInput("");
        setMobileError("");
        setOtp("");
        setRequestId(null);
        setResendTimer(0);
        setIsOtpSent(false);
        setIsVerifying(false);
        setIsFetching(false);
    };

    const closeModal = () => {
        setShowModal(false);
    };

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

    const handleSendOtp = async () => {
        if (!mobileInput || mobileInput.length !== 10 || !/^[6-9]\d{9}$/.test(mobileInput)) {
            setMobileError("Please enter a valid 10-digit mobile number");
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }
        setMobileError("");
        try {
            const response = await otpService.sendMobileOtp(mobileInput);
            setRequestId(response?.request_id || null);
            if (!response?.request_id) throw new Error("Failed to send OTP");
            setIsOtpSent(true);
            setOtp("");
            startResendTimer();
            toast.success("OTP sent to mobile");
        } catch (error) {
            toast.error(error.message || "Failed to send OTP");
        }
    };

    const handleVerifyOtpAndFetch = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        if (!requestId) {
            toast.error("OTP session expired. Please resend OTP.");
            return;
        }
        setIsVerifying(true);
        try {
            await otpService.verifyOtp(requestId, otp);
            toast.success("Mobile verified. Fetching customer...");
            setIsFetching(true);
            // Fetch customer by mobile
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/customers/fetch-1finance-customer?mobileNo=${mobileInput}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "accept": "*/*",
                },
            });
            const data = await response.json();
            if (response.status === 200 && data?.data) {
                toast.success("Customer details fetched successfully");
                onFetchSuccess && onFetchSuccess(data.data);
                closeModal();
            } else {
                toast.error("Customer not found with this mobile");
            }
        } catch (error) {
            toast.error(error.message || "Failed to verify OTP or fetch customer");
        } finally {
            setIsVerifying(false);
            setIsFetching(false);
        }
    };

    const handleResendOtp = () => {
        if (resendTimer > 0) return;
        handleSendOtp();
    };

    return (
        <>
            <button
                type="button"
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
                onClick={openModal}
                disabled={isFetching}
            >

                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="14.044" height="15.999" viewBox="0 0 14.044 15.999">
                    <path d="m9.478 0.623 0.355 0.116c0.43 0.141 0.859 0.284 1.289 0.428L14.044 2.133v9.777c-0.98 -0.218 -1.835 -0.413 -2.763 -0.74l-0.623 -0.215q-0.639 -0.223 -1.276 -0.449l-0.622 -0.214 -0.559 -0.196c-1.183 -0.3 -2.114 -0.097 -3.232 0.287l-0.399 0.132c-0.417 0.138 -0.832 0.278 -1.248 0.418q-0.628 0.21 -1.257 0.418 -0.39 0.129 -0.779 0.261C0.395 11.911 0.395 11.911 0 11.911V2.133l3.1 -1.078 0.968 -0.343a400.343 400.343 0 0 1 0.775 -0.264l0.394 -0.142C6.737 -0.194 8.019 0.13 9.478 0.623M7.289 0.533v8.711c1.453 0.585 1.453 0.585 2.923 1.092l0.533 0.17 0.654 0.205L13.511 11.377V2.489L10.6 1.511l-0.918 -0.309 -0.719 -0.241 -0.378 -0.128C7.95 0.61 7.95 0.61 7.289 0.533" fill="#FFFFFF" />
                    <path d="m10.489 3.555 0.711 0.178v4.622l-0.711 -0.178V4.8l-1.244 0.533c-0.067 -0.4 -0.067 -0.4 0 -0.889 0.522 -0.4 0.522 -0.4 1.067 -0.711z" fill="#FFFFFF" />
                    <path d="M12.888 13.822C13.511 13.866 13.511 13.866 13.866 14.222c0.022 0.467 0.022 0.467 0 0.889l-1.422 0.178c0.543 0.174 0.879 0.174 1.422 0l-0.356 0.711c-0.6 0.022 -0.6 0.022 -1.244 0 -0.356 -0.356 -0.356 -0.356 -0.403 -0.689L11.866 14.933l-0.003 -0.378c0.095 -0.668 0.397 -0.689 1.025 -0.733M12.622 14.222l-0.178 0.356h0.889l-0.178 -0.356z" fill="#FFFFFF" />
                    <path d="M5.511 13.866h1.244c0.462 0.693 0.382 1.329 0.356 2.133H5.333l-0.178 -0.889c0.844 -0.511 0.844 -0.511 1.244 -0.711l-1.067 0.178zm0.356 1.244 -0.178 0.533c0.351 -0.062 0.351 -0.062 0.711 -0.178l0.178 -0.356z" fill="#FFFFFF" />
                    <path d="M0 12.977h1.955v0.533H0.356v0.711h1.244l0.178 0.533H0.356v1.244H0z" fill="#FFFFFF" />
                    <path d="M7.466 13.866h1.6c0.224 0.449 0.195 0.767 0.189 1.267l-0.005 0.49L9.244 15.999h-0.533V14.222l-0.533 0.178 -0.178 1.6h-0.533z" fill="#FFFFFF" />
                    <path d="M3.022 13.866c1.233 -0.017 1.233 -0.017 1.6 0 0.178 0.178 0.178 0.178 0.195 0.623l-0.006 0.544 -0.005 0.545L4.8 15.999h-0.356l-0.178 -1.778 -0.533 0.178 -0.178 1.6h-0.533z" fill="#FFFFFF" />
                    <path d="M10.6 13.844 11.2 13.866l0.356 0.711 -1.244 -0.178c-0.18 0.542 -0.18 0.542 0 1.067l1.244 -0.178 -0.356 0.711c-0.6 0.022 -0.6 0.022 -1.244 0 -0.356 -0.356 -0.356 -0.356 -0.403 -0.689L9.555 14.933l-0.003 -0.378c0.097 -0.686 0.404 -0.689 1.047 -0.711" fill="#FFFFFF" />
                    <path d="M2.133 13.866h0.533v2.133h-0.533z" fill="#FFFFFF" />
                    <path d="M2.133 12.977h0.533l-0.178 0.711h-0.356z" fill="#FFFFFF" />
                </svg>


                {isFetching ? "Fetching..." : "Fetch 1 Finance"}
            </button>
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                            onClick={closeModal}
                        >
                            ×
                        </button>
                        <h3 className="text-lg font-semibold text-gray-600 mb-4">
                            Fetch <span className="text-blue-600" >1 Finance</span> Customer Details
                        </h3>
                        {!isOtpSent ? (
                            <>
                                <label className="text-sm text-gray-600 font-medium mb-1 block">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    value={mobileInput}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setMobileInput(val);
                                        setMobileError("");
                                    }}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:outline-none"
                                    maxLength={10}
                                    disabled={isFetching}
                                />
                                {mobileError && <div className="text-red-500 text-xs mt-1">{mobileError}</div>}
                                <button
                                    onClick={handleSendOtp}
                                    disabled={isFetching}
                                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white border-none rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Send OTP
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600">
                                        OTP sent to {mobileInput.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')}
                                    </p>
                                </div>
                                <label className="text-sm text-gray-600 font-medium mb-1 block">
                                    Enter 6-digit OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:outline-none text-center text-lg tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={handleVerifyOtpAndFetch}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white border-none rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                                        disabled={isVerifying}
                                    >
                                        {isVerifying ? "Verifying..." : "Verify & Fetch"}
                                    </button>
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={resendTimer > 0}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
                                    </button>
                                </div>
                                <button
                                    onClick={() => { setIsOtpSent(false); setOtp(""); setRequestId(null); setResendTimer(0); }}
                                    className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
                                >
                                    Change Mobile Number
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Fetch1FinanceCustomer;
