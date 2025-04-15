import React, { useState, useEffect, useCallback } from 'react';
import lockerLight from '../assets/icons/lockerLight.png';
import lockerDark from '../assets/icons/lockerDark.png';
import { API_URL } from '../assets/config';
import '../styles/AssignLocker.css';
import { LOCKER_STATUS, LOCKER_TYPES, LOCKER_SIZES } from '../constants/locker';
import { LockerSvgs } from '../assets/lockerSvg';

const AssignLocker = ({ isOpen, onClose, onLockerAssign, cabinetId }) => {
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [selectedCabinet, setSelectedCabinet] = useState(1);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [lockerData, setLockerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ message: null, code: null });
    const [retryCount, setRetryCount] = useState(0);

    // Update fetchLockerData function
    const fetchLockerData = useCallback(async () => {
        try {
            if (!navigator.onLine) {
                throw new Error('No internet connection');
            }

            if (!cabinetId) {
                throw new Error('Cabinet ID is required');
            }

            setLoading(true);

            // Validate API URL
            if (!API_URL) {
                throw new Error('API URL is not configured');
            }

            const response = await fetch(`${API_URL}/lockers/locker-master/${cabinetId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any authentication headers if needed
                    // 'Authorization': `Bearer ${token}`,
                },
                include: '*',
                mode: 'cors', // Enable CORS
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Store the full data structure
            setLockerData(data);
            console.log('Locker data fetched successfully:', data);

            // Set initial room selection
            if (data.metadata?.rooms?.length > 0) {
                setSelectedRoom(data.metadata.rooms[0]);
            }
            // Set initial size selection
            if (data.metadata?.types?.length > 0) {
                setSelectedSize(data.metadata.types[0]);
            }

            setError({ message: null, code: null });
            setLoading(false);
        } catch (err) {
            console.error('Error in fetchLockerData:', err);
            const errorMessage = err.message || 'Failed to fetch locker data';
            const errorCode = err.response?.status || 'NETWORK_ERROR';

            setError({
                message: errorMessage,
                code: errorCode
            });
            setLoading(false);
        }
    }, [cabinetId]);

    // Reset retry count when component mounts
    useEffect(() => {
        setRetryCount(0);
    }, []);

    // Update getFilteredOptions function
    const getFilteredOptions = () => {
        if (!lockerData) return {
            rooms: [],
            sizes: []
        };

        return {
            rooms: lockerData.metadata?.rooms || [],
            sizes: lockerData.metadata?.types || []
        };
    };

    // Update handleRoomChange function
    const handleRoomChange = (e) => {
        const newRoom = e.target.value;
        setSelectedRoom(newRoom);
        setSelectedLocker(null);

        // Find the room data
        const selectedRoomData = lockerData.rooms.find(room => room.room_number === newRoom);

        // Find first cabinet in the selected room
        if (selectedRoomData?.cabinets?.length > 0) {
            setSelectedCabinet(selectedRoomData.cabinets[0].cabinet_number);
        } else {
            setSelectedCabinet('');
        }
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
                    >
                        <option value="">Select Cabinet</option>
                        {selectedRoomData?.cabinets
                            ?.sort((a, b) => Number(a.cabinet_number) - Number(b.cabinet_number))
                            .map((cabinet) => (
                                <option key={cabinet.cabinet_number} value={cabinet.cabinet_number}>
                                    Cabinet {cabinet.cabinet_number}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Size<span className='required'>*</span></label>
                    <select
                        value={selectedSize || ''}
                        onChange={(e) => setSelectedSize(e.target.value)}
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
                        Assign Cabinet
                    </button>
                    <button className="close-button" onClick={onClose}>
                        Close
                    </button>
                </div>
                {selectedLocker && (
                    <div className="selected-locker-info" style={{ marginTop: '1rem' }}>
                        <span style={{ color: 'red', fontWeight: 'bold' }}>
                            Selected Locker: {selectedLocker.locker_number} ({selectedLocker.size})
                        </span>
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        if (isOpen && cabinetId) {
            fetchLockerData();
        }
        return () => {
            // Cleanup when modal closes
            setLockerData(null);
            setSelectedLocker(null);
            setError({ message: null, code: null });
            setRetryCount(0);
        };
    }, [isOpen, cabinetId]); // Only re-run if modal opens or cabinetId changes

    // Update getCabinetView function
    const getCabinetView = (cabinetNumber) => {
        if (!lockerData || !selectedRoom) return [];

        // Find the room data
        const selectedRoomData = lockerData.rooms.find(room => room.room_number === selectedRoom);
        if (!selectedRoomData) return [];

        // Find cabinet with matching number
        const cabinet = selectedRoomData.cabinets.find(c => c.cabinet_number === cabinetNumber.toString());
        if (!cabinet) return [];

        // Filter lockers based on size
        const filteredLockers = cabinet.lockers.filter(locker =>
            locker && (!selectedSize || locker.size === selectedSize)
        );

        // Create grid with 5 columns, but only include actual lockers
        const COLUMNS = 5;
        const lockerGrid = [];
        let currentRow = [];

        filteredLockers.forEach((locker, index) => {
            if (locker) { // Only add if locker exists
                currentRow.push({
                    ...locker,
                    row: Math.floor(index / COLUMNS) + 1,
                    column: (index % COLUMNS) + 1
                });

                if (currentRow.length === COLUMNS) {
                    lockerGrid.push(currentRow);
                    currentRow = [];
                }
            }
        });

        // Push the last row if it has any lockers
        if (currentRow.length > 0) {
            lockerGrid.push(currentRow);
        }

        return lockerGrid;
    };

    const handleLockerClick = (locker) => {
        // Check if the locker is selected  and toggle selection
        if (selectedLocker && selectedLocker.locker_number === locker.locker_number) {
            setSelectedLocker(null);
        }
        else if (locker.status === LOCKER_STATUS.AVAILABLE) {
            setSelectedLocker(locker);
        }
    };

    const handleAssign = () => {
        if (selectedLocker) {
            console.log('Assigning locker:', selectedLocker);
            onLockerAssign(selectedLocker);
        }
    };

    // Update handleCabinetChange to handle string cabinet numbers
    const handleCabinetChange = (event) => {
        setSelectedCabinet(event.target.value);
        setSelectedLocker(null);
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
        if (locker.status === 'occupied') return LockerSvgs.occupied;
        if (locker.status === 'maintenance') return LockerSvgs.maintenance;
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

    if (error.message) return (
        <div className="modal-overlay">
            <div className="error-container">
                <h4>Error Loading Lockers</h4>
                <p>{error.message}</p>
                <button
                    className="retry-button"
                    onClick={() => {
                        setError({ message: null, code: null });
                        fetchLockerData();
                    }}
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