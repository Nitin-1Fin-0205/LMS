import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEraser } from "@fortawesome/free-solid-svg-icons";
import { InlineLoader } from "../ui";

const LockerAssignmentSection = ({
    lockerDetails,
    centers,
    isLoadingCenters,
    onInputChange,
    onUpdateLockerDetails,
    onSurrenderClick,
}) => {
    return (
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
                            onChange={(e) => onInputChange("center", e.target.value)}
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
                            onClick={() => onUpdateLockerDetails({ isModalOpen: true })}
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
                        onChange={(e) => onInputChange("lockerKey", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none cursor-not-allowed"
                        readOnly
                    />
                </div>

                {/* Surrender Locker Button - Only show when backend allows surrender */}
                {lockerDetails.assignedLocker && lockerDetails.allowSurrenderLocker && (
                    <div>
                        <button
                            onClick={onSurrenderClick}
                            className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-102 shadow-sm hover:shadow-md flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faEraser} className="mr-2" />
                            Surrender Locker
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LockerAssignmentSection;
