import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLock, faTimes, faKey, faUser, faCheck
} from '@fortawesome/free-solid-svg-icons';

const LockerSelectionModal = ({
    isOpen,
    onClose,
    lockerAccess,
    onLockerSelect,
    customerName
}) => {
    const [selectedLocker, setSelectedLocker] = useState(null);

    const handleLockerSelect = (locker) => {
        setSelectedLocker(locker);
    };

    const handleConfirmSelection = () => {
        if (selectedLocker) {
            onLockerSelect(selectedLocker);
            setSelectedLocker(null);
        }
    };

    const handleClose = () => {
        setSelectedLocker(null);
        onClose();
    };

    const getSizeColor = (size) => {
        switch (size?.toLowerCase()) {
            case 'small':
                return 'bg-green-100 text-green-700';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700';
            case 'large':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getAccessTypeColor = (accessType) => {
        return accessType === 'PRIMARY'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl transform transition-all duration-300 animate-scale-in max-h-[85vh] overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        {/* <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-blue-600" />
                        </div> */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Select Your Locker</h3>
                            <p className="text-gray-600 text-xs">Choose which locker you want to access</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-300"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-red-500 w-4 h-4" />
                    </button>
                </div>

                {customerName && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                <FontAwesomeIcon icon={faUser} className="text-green-600 w-3 h-3" />
                            </div>
                            <div>
                                <p className="text-green-900 font-medium text-sm">Customer: <span className='text-green-700 font-semibold'>{customerName}</span></p>
                                <p className="text-green-700 text-xs">You have access to {lockerAccess.length} locker{lockerAccess.length > 1 ? 's' : ''}. Please select one to continue.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
                    {lockerAccess.map((locker, index) => (
                        <div
                            key={locker.locker_id}
                            onClick={() => handleLockerSelect(locker)}
                            className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedLocker?.locker_id === locker.locker_id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Locker Icon */}
                                <div className="flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200 ${selectedLocker?.locker_id === locker.locker_id
                                        ? 'bg-blue-100'
                                        : 'bg-gray-100 group-hover:bg-blue-50'
                                        }`}>
                                        <FontAwesomeIcon
                                            icon={faLock}
                                            className={`w-6 h-6 transition-colors duration-200 ${selectedLocker?.locker_id === locker.locker_id
                                                ? 'text-blue-600'
                                                : 'text-gray-600 group-hover:text-blue-600'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Locker Information */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-lg font-bold text-gray-900">
                                            {locker.locker_number}
                                        </h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAccessTypeColor(locker.access_type)}`}>
                                            {locker.access_type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSizeColor(locker.size)}`}>
                                                {locker.size}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faKey} className="text-gray-500 w-3 h-3" />
                                            <span className="text-gray-700 font-medium">Key: {locker.locker_key}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                <div className="flex-shrink-0">
                                    {selectedLocker?.locker_id === locker.locker_id ? (
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faCheck} className="text-white w-3 h-3" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-400 transition-colors duration-200"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmSelection}
                        disabled={!selectedLocker}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white border-none rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {selectedLocker
                            ? `Access Locker ${selectedLocker.locker_number}`
                            : 'Select a Locker'
                        }
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }

                .flex-2 {
                    flex: 2;
                }
            `}</style>
        </div>
    );
};

export default LockerSelectionModal;
