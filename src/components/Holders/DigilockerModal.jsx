import React, { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEnvelope, faSms, faExternalLinkAlt, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../../assets/config";

const DigilockerModal = ({ isOpen, onClose, onSuccess }) => {
    const [contactMethod, setContactMethod] = useState("mobile");
    const [contactValue, setContactValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDigilockerKyc = async (notifyCustomer) => {
        try {
            if (!contactValue.trim()) {
                toast.error(`Please enter ${contactMethod === 'mobile' ? 'mobile number' : 'email address'}`);
                return;
            }

            // Validate input based on contact method
            if (contactMethod === "mobile") {
                if (!/^[1-9]\d{9}$/.test(contactValue)) {
                    toast.error("Please enter a valid 10-digit mobile number");
                    return;
                }
            } else {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
                    toast.error("Please enter a valid email address");
                    return;
                }
            }

            setIsSubmitting(true);

            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_URL}/customers/digilocker-kyc`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "accept": "application/json",
                },
                body: JSON.stringify({
                    customer_identifier: contactValue,
                    notify_customer: notifyCustomer,
                }),
            });

            const data = await response.json();
            if (response.ok && data.status_code === 200) {
                if (notifyCustomer) {
                    // Send Link option
                    toast.success(`Digilocker link sent successfully to ${contactValue}`);
                    handleClose();
                } else {
                    // Open Here option
                    if (data.data?.digilocker_url) {
                        window.open(data.data.digilocker_url, '_blank');
                        toast.success("Digilocker opened in new tab");
                        handleClose();
                    } else {
                        toast.error("No Digilocker URL received");
                    }
                }

                // Call success callback if provided
                if (onSuccess) {
                    onSuccess(data.data);
                }
            } else {
                toast.error(data.message || "Failed to initiate Digilocker KYC");
            }
        } catch (error) {
            console.error("Error initiating Digilocker KYC:", error);
            toast.error("Failed to initiate Digilocker KYC");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendLink = () => {
        handleDigilockerKyc(true); // notify_customer: true
    };

    const handleOpenHere = () => {
        handleDigilockerKyc(false); // notify_customer: false
    };

    const handleClose = () => {
        setContactValue("");
        setContactMethod("mobile");
        onClose();
    };

    const handleContactValueChange = (e) => {
        const value = e.target.value;
        if (contactMethod === "mobile") {
            // Only allow numbers for mobile
            if (value === "" || /^[0-9]+$/.test(value)) {
                setContactValue(value.slice(0, 10));
            }
        } else {
            setContactValue(value);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 144.000000 144.000000"
                            fill="currentColor"
                            className="text-green-600"
                        >
                            <g transform="translate(0.000000,144.000000) scale(0.050000,-0.050000)">
                                <path d="M1143 2840 c-621 -13 -563 41 -563 -524 l0 -419 -111 -101 c-138 -126 -207 -242 -222 -374 -11 -87 -26 -115 -108 -197 -306 -306 -99 -823 331 -825 l120 0 -7 -129 c-6 -117 -1 -135 44 -180 l51 -51 1048 0 1047 0 44 46 c43 46 43 51 43 901 l0 855 -603 -3 -602 -3 4 500 c2 275 -4 503 -13 507 -9 4 -235 3 -503 -3z m337 -120 c38 -23 48 -799 12 -825 -15 -11 -10 -23 13 -36 45 -27 45 -54 0 -65 -27 -7 -25 -10 9 -12 79 -4 72 -42 -8 -42 -83 0 -160 40 -263 137 -37 34 -104 73 -150 86 -46 13 -92 30 -103 38 -11 7 -67 11 -124 8 -132 -6 -131 -9 -137 354 -6 395 -30 373 396 374 179 1 339 -7 355 -17z m-387 -916 c45 -23 119 -84 164 -135 l82 -93 100 26 c194 49 458 -102 494 -283 8 -38 32 -71 65 -88 277 -144 266 -576 -18 -717 -123 -62 -1583 -64 -1701 -3 -263 136 -295 501 -61 690 59 47 82 81 82 119 0 384 451 659 793 484z m1654 -134 c47 -122 4 -1531 -46 -1501 -10 6 -24 3 -31 -8 -22 -37 -1863 -25 -1900 12 -115 114 -25 163 284 154 152 -4 308 -7 346 -5 39 2 185 4 326 5 147 1 241 9 220 18 -23 10 -12 12 31 5 56 -8 65 -4 55 22 -9 24 -4 29 19 21 17 -7 35 0 42 17 6 16 18 26 26 20 17 -10 121 99 121 127 0 9 17 32 39 52 55 50 97 350 57 404 -10 13 -42 69 -72 125 -66 124 -334 443 -409 488 -112 66 -68 74 413 74 400 0 469 -4 479 -30z" />
                                <path d="M942 1232 c-48 -51 -45 -108 8 -152 19 -15 23 -37 12 -67 -9 -23 -26 -72 -37 -108 l-22 -65 99 0 c111 0 108 -5 68 129 -27 88 -27 101 0 116 42 23 38 122 -7 162 -48 44 -68 42 -121 -15z" />
                                <path d="M1793 2395 l4 -445 521 -5 c287 -3 522 0 522 7 0 7 -25 32 -55 55 -30 24 -263 221 -519 438 -255 217 -466 395 -470 395 -3 0 -4 -200 -3 -445z m221 90 c156 -144 245 -219 251 -213 4 4 37 -20 72 -53 36 -32 74 -59 84 -59 11 0 19 -13 19 -30 0 -16 9 -30 20 -30 11 0 20 -10 20 -22 0 -15 -80 -19 -261 -13 -326 12 -337 21 -290 260 4 19 1 31 -6 27 -11 -7 -16 163 -6 183 9 17 45 -2 97 -50z" />
                            </g>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Fetch Through Digilocker
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Get customer information directly from Digilocker
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Contact Method Selection */}
                    <div>
                        <label className="text-sm text-gray-600 font-medium mb-2 block">
                            Customer Contact Method
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="contactMethod"
                                    value="mobile"
                                    checked={contactMethod === "mobile"}
                                    onChange={(e) => setContactMethod(e.target.value)}
                                    className="mr-2"
                                />
                                <FontAwesomeIcon icon={faSms} className="mr-1 text-blue-600" />
                                Mobile
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="contactMethod"
                                    value="email"
                                    checked={contactMethod === "email"}
                                    onChange={(e) => setContactMethod(e.target.value)}
                                    className="mr-2"
                                />
                                <FontAwesomeIcon icon={faEnvelope} className="mr-1 text-blue-600" />
                                Email
                            </label>
                        </div>
                    </div>

                    {/* Contact Input */}
                    <div>
                        <label className="text-sm text-gray-600 font-medium mb-1 block">
                            {contactMethod === "mobile" ? "Mobile Number" : "Email Address"}
                        </label>
                        <input
                            type={contactMethod === "mobile" ? "tel" : "email"}
                            value={contactValue}
                            onChange={handleContactValueChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white transition-all duration-200 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(66,153,225,0.15)] focus:outline-none"
                            placeholder={
                                contactMethod === "mobile"
                                    ? "Enter 10-digit mobile number"
                                    : "Enter email address"
                            }
                            maxLength={contactMethod === "mobile" ? 10 : undefined}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendLink}
                        disabled={isSubmitting || !contactValue.trim()}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white border-none rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending...
                            </div>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={contactMethod === "mobile" ? faSms : faEnvelope} className="mr-2" />
                                Send Link
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleOpenHere}
                        disabled={isSubmitting || !contactValue.trim()}
                        className="flex-1 px-4 py-2 bg-green-600 text-white border-none rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Opening...
                            </div>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
                                Open Here
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DigilockerModal;
