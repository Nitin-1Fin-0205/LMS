import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLockerMaster, clearLockerData } from '../store/slices/lockerSlice';

import { API_URL } from '../assets/config';
import '../styles/AssignLocker.css';
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
        const selectedRoomData = lockerData?.rooms?.find(room => room.room_number === selectedRoom);

        return (
            <div className="assign-locker-form">
                <div className="form-group">
                    <label>Room<span className='required'>*</span></label>
                    <select
                        value={selectedRoom || ''}
                        onChange={handleRoomChange}
                    >
                        <option value="">Select Room</option>
                        {options.rooms.map((room) => (
                            <option key={room} value={room}>
                                Room {room}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Update cabinet selection to filter by selected room */}
                <div className="form-group">
                    <label>Cabinet Number<span className='required'>*</span></label>
                    <select
                        value={selectedCabinet || ''}
                        onChange={handleCabinetChange}
                        disabled={!selectedRoom}
                    >
                        <option value="">Select Cabinet</option>
                        {options.cabinets.map((cabinet) => (
                            <option key={cabinet} value={cabinet}>
                                Cabinet {cabinet}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Size<span className='required'>*</span></label>
                    <select
                        value={selectedSize || ''}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        disabled={!selectedRoom || !selectedCabinet}
                    >
                        <option value="">Select Size</option>
                        {options.sizes.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        className="save-button"
                        onClick={handleAssign}
                        disabled={!selectedLocker}
                    >
                        Assign Locker
                    </button>
                    <button className="close-button" onClick={onClose}>
                        Close
                    </button>
                </div>
                {selectedLocker && (
                    <div className="selected-locker-info" style={{ marginTop: '1rem' }}>
                        <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '0.95rem' }}>
                            Selected Locker: {selectedLocker.locker_number} ({selectedLocker.size})
                        </span>
                    </div>
                )}

                {/* Add Reserved Lockers Section */}
                {

                    lockerData?.mappedLockers?.length > 0 && (
                        <div className="reserved-lockers-section" style={{ marginTop: '1rem' }}>
                            <h4>Reserved Lockers</h4>
                            <div className="reserved-lockers-list">
                                {lockerData.mappedLockers.map((locker) => (
                                    <button
                                        key={locker.locker_id}
                                        className={`reserved-locker-button ${selectedLocker?.locker_id === locker.locker_id ? 'selected' : ''}`}
                                        onClick={() => handleReservedLockerClick(locker)}
                                    >
                                        {locker.locker_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
            </div>
        );
    };

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
                locker_id: locker.locker_id
            }));

        // Rest of the function remains the same
        const COLUMNS = 5;
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
                status: locker.status
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

    const handleRetry = () => {
        setLoading(true);
        setError({ message: null, code: null });
        setRetryCount(0);
        fetchLockerData();
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

    if (!isOpen) return null;
    if (loading) return (
        <div className="modal-overlay">
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading locker data...</p>
                {retryCount > 0 && (
                    <p className="retry-message">Retry attempt {retryCount}/3</p>
                )}
            </div>
        </div>
    );

    if (error) return (
        <div className="modal-overlay">
            <div className="error-container">
                <h4>Error Loading Lockers</h4>
                <p>{typeof error === 'object' ? error.message || 'Unknown error' : error}</p>
                <button
                    className="retry-button"
                    onClick={fetchLockerData}
                >
                    Retry
                </button>
                <button className="close-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );

    const cabinetView = getCabinetView(selectedCabinet);

    return (
        <div className="modal-overlay">
            <div className="assign-locker-modal-content">
                <h3>Assign Lockers</h3>
                <div className="assign-locker-container">
                    {renderForm()}
                    {/* Right Side: Cabinet View */}
                    <div className="cabinet-view">
                        <h4>Cabinet View</h4>
                        <div className="locker-grid">
                            {cabinetView.map((row, rowIndex) => (
                                <div key={rowIndex} className="locker-row">
                                    {row.map((locker, colIndex) => (
                                        <button
                                            key={colIndex}
                                            className={`locker-item ${selectedLocker?.locker_number === locker.locker_number ? 'selected' : ''
                                                } ${locker.status !== LOCKER_STATUS.AVAILABLE ? 'occupied' : ''}`}
                                            onClick={() => handleLockerClick(locker)}
                                            disabled={locker.status !== LOCKER_STATUS.AVAILABLE}
                                            {...(locker.status !== LOCKER_STATUS.AVAILABLE && {
                                                'data-status': getStatusText(locker.status)
                                            })}
                                        >
                                            <div dangerouslySetInnerHTML={{
                                                __html: getLockerSvg(locker,
                                                    selectedLocker?.locker_number === locker.locker_number)
                                            }} />
                                            <span className="locker-number">{locker.locker_number}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignLocker;