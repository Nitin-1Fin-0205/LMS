import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLockerMaster, clearLockerData } from '../store/slices/lockerSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMapMarkerAlt,
    faBuilding,
    faRulerCombined,
    faKey,
    faTimes,
    faSpinner,
    faExclamationTriangle,
    faCheckCircle,
    faLock,
    faWrench
} from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../assets/config';
import { LOCKER_STATUS, LOCKER_TYPES, LOCKER_SIZES } from '../constants/locker';
import { LockerSvgs } from '../assets/lockerSvg';

const AssignLocker = ({ isOpen, onClose, onLockerAssign, centerId }) => {
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [selectedCabinet, setSelectedCabinet] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const dispatch = useDispatch();
    const { lockerData, loading, error } = useSelector(state => state.locker);

    const fetchLockerData = useCallback(async () => {
        console.log('Fetching locker data...');
        try {
            if (!navigator.onLine) {
                throw new Error('No internet connection');
            }

            if (!centerId) {
                throw new Error('Cabinet ID is required');
            }

            await dispatch(fetchLockerMaster(centerId)).unwrap();
        } catch (err) {
            console.error('Error in fetchLockerData:', err);
        }
    }, [centerId, dispatch]);

    useEffect(() => {
        if (isOpen && centerId) {
            fetchLockerData();
        }
        return () => {
            dispatch(clearLockerData());
        };
    }, [isOpen, centerId, dispatch, fetchLockerData]);

    // Reset retry count when component mounts
    useEffect(() => {
        setRetryCount(0);
    }, []);

    // Helper function to get unique rooms
    const getRoomsList = useCallback((data) => {
        if (!data?.master?.length) return [];
        return data.master[0]?.rooms.map(room => room.room_id.toString()) || [];
    }, []);

    // Helper function to get cabinets for selected room
    const getCabinetList = useCallback((data, roomId) => {
        if (!data?.master?.length || !roomId) return [];
        const room = data.master[0]?.rooms.find(r => r.room_id.toString() === roomId);
        // Get unique cabinet numbers from the room
        const cabinetNumbers = new Set(room?.cabinates?.map((_, index) => (index + 1).toString()) || []);
        return Array.from(cabinetNumbers).sort((a, b) => Number(a) - Number(b));
    }, []);

    // Helper function to get locker sizes
    const getSizesList = useCallback((data, roomId, cabinetNumber) => {
        if (!data?.master?.length || !roomId || !cabinetNumber) return [];
        const room = data.master[0]?.rooms.find(r => r.room_id.toString() === roomId);
        if (!room?.cabinates?.[Number(cabinetNumber) - 1]) return [];
        const sizes = room.cabinates[Number(cabinetNumber) - 1]?.size.map(s => s.size) || [];
        return [...new Set(sizes)];
    }, []);

    const getFilteredOptions = () => {
        if (!lockerData?.master?.length) return {
            rooms: [],
            cabinets: [],
            sizes: []
        };

        return {
            rooms: getRoomsList(lockerData),
            cabinets: getCabinetList(lockerData, selectedRoom),
            sizes: getSizesList(lockerData, selectedRoom, selectedCabinet)
        };
    };

    // Update handleRoomChange function
    const handleRoomChange = (e) => {
        const newRoom = e.target.value;
        setSelectedRoom(newRoom);
        setSelectedCabinet(null);
        setSelectedSize(null);
        setSelectedLocker(null);
    };

    // Update handleCabinetChange to handle string cabinet numbers
    const handleCabinetChange = (event) => {
        setSelectedCabinet(event.target.value);
        setSelectedSize(null);
        setSelectedLocker(null);
    };

    const handleReservedLockerClick = (locker) => {
        setSelectedLocker({
            locker_number: locker.locker_name,
            status: locker.status,
            locker_id: locker.locker_id,
            size: locker.size
        });
    };

    // Update the form section to use the new structure
    const renderForm = () => {
        const options = getFilteredOptions();

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full overflow-y-auto">
                <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <FontAwesomeIcon icon={faKey} className="text-blue-600 text-sm" />
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-gray-900">Locker Selection</h4>
                        <p className="text-xs text-gray-500">Choose room, cabinet, and size</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Room Selection */}
                    <div className="space-y-1">
                        <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-300 mr-1.5 text-xs" />
                            Room <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            value={selectedRoom || ''}
                            onChange={handleRoomChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 cursor-pointer"
                        >
                            <option value="">Select Room</option>
                            {options.rooms.map((room) => (
                                <option key={room} value={room}>
                                    Room {room}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cabinet Selection */}
                    <div className="space-y-1">
                        <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                            <FontAwesomeIcon icon={faBuilding} className="text-blue-300 mr-1.5 text-xs" />
                            Cabinet Number <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            value={selectedCabinet || ''}
                            onChange={handleCabinetChange}
                            disabled={!selectedRoom}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <option value="">Select Cabinet</option>
                            {options.cabinets.map((cabinet) => (
                                <option key={cabinet} value={cabinet}>
                                    Cabinet {cabinet}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Size Selection */}
                    <div className="space-y-1">
                        <label className="flex items-center text-xs font-medium text-gray-700 mb-1">
                            <FontAwesomeIcon icon={faRulerCombined} className="text-blue-300 mr-1.5 text-xs" />
                            Size <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            value={selectedSize || ''}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            disabled={!selectedRoom || !selectedCabinet}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <option value="">Select Size</option>
                            {options.sizes.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selected Locker Info */}
                    {selectedLocker && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2 text-sm" />
                                <span className="text-xs font-medium text-green-800">
                                    Selected: {selectedLocker.locker_number} ({selectedLocker.size})
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Reserved Lockers Section */}
                    {lockerData?.mappedLockers?.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                            <h5 className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faLock} className="text-orange-500 mr-1.5 text-xs" />
                                Reserved Lockers
                            </h5>
                            <div className="grid grid-cols-2 gap-1.5">
                                {lockerData.mappedLockers.map((locker) => (
                                    <button
                                        key={locker.locker_id}
                                        className={`px-2 py-1.5 text-xs font-medium rounded transition-all duration-200 cursor-pointer ${selectedLocker?.locker_id === locker.locker_id
                                            ? 'bg-orange-500 text-white border-orange-600'
                                            : 'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200'
                                            }`}
                                        onClick={() => handleReservedLockerClick(locker)}
                                    >
                                        {locker.locker_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-1.5" />
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedLocker}
                        className="px-4 py-2 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5" />
                        Assign Locker
                    </button>
                </div>
            </div>
        );
    };

    // Update loading state with Tailwind
    if (!isOpen) return null;

    if (loading) return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 shadow-2xl">
                <div className="flex justify-center mb-4">
                    <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Locker Data</h3>
                <p className="text-gray-600">Please wait while we fetch available lockers...</p>
                {retryCount > 0 && (
                    <p className="text-sm text-blue-600 mt-2">Retry attempt {retryCount}/3</p>
                )}
            </div>
        </div>
    );

    if (error) return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl">
                <div className="flex justify-center mb-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Lockers</h3>
                <p className="text-gray-600 mb-6">{typeof error === 'object' ? error.message || 'Unknown error' : error}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={fetchLockerData}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <FontAwesomeIcon icon={faSpinner} className="mr-2" />
                        Retry
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    // Update getCabinetView function
    const getCabinetView = (cabinetNumber) => {
        if (!lockerData?.master?.[0]?.rooms || !selectedRoom || !selectedSize) return [];

        const room = lockerData.master[0].rooms.find(r => r.room_id.toString() === selectedRoom);
        if (!room?.cabinates?.length) return [];

        const sizeData = room.cabinates[0].size.find(s => s.size === selectedSize);
        if (!sizeData?.lockers) return [];

        // Create a new array before sorting
        const filteredLockers = [...sizeData.lockers]
            .sort((a, b) => a.locker_name.localeCompare(b.locker_name))
            .map(locker => ({
                locker_number: locker.locker_name,
                status: locker.status,
                size: sizeData.size,
                locker_id: locker.locker_id,
                locker_key: locker.key_number
            }));

        // Fixed column count for medium lockers
        const COLUMNS = selectedSize === LOCKER_SIZES.SMALL ? 6 : selectedSize === LOCKER_SIZES.MEDIUM ? 3 : 2;
        const lockerGrid = [];
        let currentRow = [];

        filteredLockers.forEach((locker, index) => {
            currentRow.push({
                ...locker,
                row: Math.floor(index / COLUMNS) + 1,
                column: (index % COLUMNS) + 1
            });

            if (currentRow.length === COLUMNS || index === filteredLockers.length - 1) {
                lockerGrid.push(currentRow);
                currentRow = [];
            }
        });

        return lockerGrid;
    };

    const handleLockerClick = (locker) => {
        if (selectedLocker && selectedLocker.locker_number === locker.locker_number) {
            setSelectedLocker(null);
        }
        else if (locker.status === LOCKER_STATUS.AVAILABLE) {
            setSelectedLocker({
                locker_number: locker.locker_number,
                locker_id: locker.locker_id,
                size: locker.size,
                status: locker.status,
                locker_key: locker.locker_key
            });
        }
    };

    const handleAssign = () => {
        if (selectedLocker) {
            console.log('Assigning locker:', selectedLocker);
            onLockerAssign(selectedLocker);
            onClose();
        }
    };

    const getLockerSvg = (locker, isSelected) => {
        if (!locker) return null;
        if (isSelected) return LockerSvgs.selected;
        if (locker.status === LOCKER_STATUS.OCCUPIED) return LockerSvgs.occupied;
        if (locker.status === LOCKER_STATUS.MAINTENANCE) return LockerSvgs.maintenance;
        return LockerSvgs.available;
    };

    const getStatusText = (status) => {
        if (status === LOCKER_STATUS.AVAILABLE) return null;
        switch (status) {
            case LOCKER_STATUS.OCCUPIED: return 'Occupied';
            case LOCKER_STATUS.MAINTENANCE: return 'Under Maintenance';
            default: return 'Not Available';
        }
    };

    const cabinetView = getCabinetView(selectedCabinet);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Assign Locker</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-gray-600 text-sm" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 min-h-0">
                    {/* Left Side: Form */}
                    <div className="w-1/3 min-w-[300px] border-r border-gray-200">
                        {renderForm()}
                    </div>

                    {/* Right Side: Cabinet View */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-base mb-0 font-semibold text-gray-900 flex items-center">
                                <FontAwesomeIcon icon={faBuilding} className="text-blue-500 mr-2" />
                                Cabinet View
                            </h3>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {cabinetView.length > 0 ? (
                                <div className="space-y-4">
                                    {cabinetView.map((row, rowIndex) => (
                                        <div key={rowIndex} className="flex flex-wrap gap-3 justify-center">
                                            {row.map((locker, colIndex) => (
                                                <button
                                                    key={colIndex}
                                                    className={`relative group transition-all duration-200 transform hover:scale-105 ${locker.status === LOCKER_STATUS.AVAILABLE
                                                        ? 'cursor-pointer hover:shadow-lg'
                                                        : 'cursor-not-allowed opacity-60'
                                                        } ${getLockerSizeClass(locker.size)}`}
                                                    onClick={() => handleLockerClick(locker)}
                                                    disabled={locker.status !== LOCKER_STATUS.AVAILABLE}
                                                >
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: getLockerSvg(locker, selectedLocker?.locker_number === locker.locker_number)
                                                        }}
                                                        className="w-full h-full"
                                                    />
                                                    <span className={`absolute inset-0 flex items-center justify-center font-bold text-gray-800 pointer-events-none ${getLockerTextSizeClass(locker.size)}`}>
                                                        {locker.locker_number}
                                                    </span>

                                                    {/* Status tooltip */}
                                                    {locker.status !== LOCKER_STATUS.AVAILABLE && (
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                                                {getStatusText(locker.status)}
                                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <FontAwesomeIcon icon={faBuilding} className="text-5xl mb-3 opacity-50" />
                                    <p className="text-base font-medium">No Lockers Available</p>
                                    <p className="text-sm">Please select room, cabinet, and size to view lockers</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Helper function for locker size classes
    function getLockerSizeClass(size) {
        switch (size) {
            case LOCKER_SIZES.SMALL:
                return 'w-24 h-11';
            case LOCKER_SIZES.MEDIUM:
                return 'w-48 h-23';
            case LOCKER_SIZES.LARGE:
                return 'w-60 h-28';
            default:
                return 'w-48 h-23';
        }
    }

    // Helper function for locker text size classes
    function getLockerTextSizeClass(size) {
        switch (size) {
            case LOCKER_SIZES.SMALL:
                return 'text-xs';
            case LOCKER_SIZES.MEDIUM:
                return 'text-sm';
            case LOCKER_SIZES.LARGE:
                return 'text-base';
            default:
                return 'text-sm';
        }
    }
};

export default AssignLocker;