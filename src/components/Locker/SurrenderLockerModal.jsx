import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser } from "@fortawesome/free-solid-svg-icons";

const SurrenderLockerModal = ({
    show,
    onClose,
    lockerDetails,
    onConfirm,
    surrenderStep,
    otp,
    setOtp,
    otpError,
    handleOtpVerificationAndSurrender,
    resendOtp,
    resendTimer,
    responseMobile,
    surrenderConsent,
    handleConsentChange,
    disabled,
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-xl mx-auto shadow-2xl">
                <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {surrenderStep === "confirm" && "Surrender Locker"}
                            {surrenderStep === "otp" && "Verify OTP"}
                            {surrenderStep === "processing" && "Processing..."}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={surrenderStep === "processing"}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Content */}
                    {surrenderStep === "confirm" && (
                        <div>
                            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start">
                                    <svg
                                        className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-800 mb-1">
                                            Warning: This action cannot be undone
                                        </h4>
                                        <p className="text-sm text-yellow-700">
                                            You are about to surrender locker{" "}
                                            <strong>{lockerDetails.assignedLocker}</strong>. This
                                            will permanently remove customer access to this locker.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Consent Checkboxes */}
                            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <h4 className="text-sm font-semibold mb-2 text-gray-500 text-center">Please select the below consent before proceed!</h4>
                                <hr className="border-t border-gray-300 mb-4" />
                                <div className="space-y-2">
                                    <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={surrenderConsent.keysReceived}
                                            onChange={() => handleConsentChange('keysReceived')}
                                            className="mr-2"
                                        />
                                        Locker keys have been received by the concerned authority.
                                    </label>
                                    <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={surrenderConsent.paymentsCleared}
                                            onChange={() => handleConsentChange('paymentsCleared')}
                                            className="mr-2"
                                        />
                                        All payments are cleared and no dues are pending for the locker.
                                    </label>
                                    <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={surrenderConsent.lockerEmpty}
                                            onChange={() => handleConsentChange('lockerEmpty')}
                                            className="mr-2"
                                        />
                                        The locker is empty and in usable condition at the time of surrender.
                                    </label>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={disabled}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Surrender
                                </button>
                            </div>
                        </div>
                    )}

                    {surrenderStep === "otp" && (
                        <div>
                            <div className="mb-4 text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    We've sent a verification code to:
                                </p>
                                <p className="text-sm font-bold text-green-700">
                                    {responseMobile || ""}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter 6-digit OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="w-full px-3 py-2 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="000000"
                                    maxLength="6"
                                />
                                {otpError && (
                                    <p className="mt-1 text-sm text-red-600">{otpError}</p>
                                )}
                            </div>
                            <div className="mb-6 text-center">
                                <button
                                    onClick={resendOtp}
                                    disabled={resendTimer > 0}
                                    className={`text-sm transition-colors ${resendTimer > 0
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-blue-600 hover:text-blue-500"
                                        }`}
                                >
                                    {resendTimer > 0
                                        ? `Resend OTP (${resendTimer}s)`
                                        : "Didn't receive OTP? Resend"}
                                </button>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={handleOtpVerificationAndSurrender}
                                    disabled={otp.length !== 6}
                                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Verify & Surrender
                                </button>
                            </div>
                        </div>
                    )}

                    {surrenderStep === "processing" && (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span className="text-lg font-medium text-gray-900">
                                    {surrenderStep === "processing" && otp.length === 6
                                        ? "Verifying OTP..."
                                        : "Sending OTP..."}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Please wait</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurrenderLockerModal;
