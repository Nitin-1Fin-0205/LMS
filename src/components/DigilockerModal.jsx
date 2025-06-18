import React, { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEnvelope, faSms } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../assets/config";

const DigilockerModal = ({ isOpen, onClose }) => {
    const [contactMethod, setContactMethod] = useState("mobile");
    const [contactValue, setContactValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            if (!contactValue.trim()) {
                toast.error(`Please enter ${contactMethod} number/address`);
                return;
            }

            // Validate input based on contact method
            if (contactMethod === "mobile") {
                if (!/^[6-9]\d{9}$/.test(contactValue)) {
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
            const response = await fetch(`${API_URL}/customers/send-digilocker-link`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "accept": "*/*",
                },
                body: JSON.stringify({
                    contact_method: contactMethod,
                    contact_value: contactValue,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(`Digilocker link sent successfully to ${contactValue}`);
                handleClose();
            } else {
                toast.error(data.message || "Failed to send Digilocker link");
            }
        } catch (error) {
            console.error("Error sending Digilocker link:", error);
            toast.error("Failed to send Digilocker link");
        } finally {
            setIsSubmitting(false);
        }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                    onClick={handleClose}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Send Digilocker Link
                </h3>

                <div className="space-y-4">
                    {/* Contact Method Selection */}
                    <div>
                        <label className="text-sm text-gray-600 font-medium mb-2 block">
                            Send via
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
                                <FontAwesomeIcon icon={faSms} className="mr-1" />
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
                                <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
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
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white border-none rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        disabled={isSubmitting || !contactValue.trim()}
                    >
                        {isSubmitting ? "Sending..." : "Send Link"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DigilockerModal;
