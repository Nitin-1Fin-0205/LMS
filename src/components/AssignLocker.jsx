import React, { useState, useEffect } from 'react';
import lockerLight from '../assets/icons/lockerLight.png';
import lockerDark from '../assets/icons/lockerDark.png';
import { API_URL } from '../assets/config';
import '../styles/AssignLocker.css';
import { LOCKER_STATUS, LOCKER_TYPES, LOCKER_SIZES } from '../constants/locker';
import { LockerSvgs } from '../assets/lockerSvg';

const AssignLocker = ({ isOpen, onClose, onLockerAssign }) => {
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [selectedCabinet, setSelectedCabinet] = useState(1);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [lockerData, setLockerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({ message: null, code: null });
    const [retryCount, setRetryCount] = useState(0);

    const fetchLockerData = async () => {
        try {
            if (!navigator.onLine) {
                throw new Error('No internet connection');
            }

            // Validate API URL
            if (!API_URL) {
                throw new Error('API URL is not configured');
            }

            // const response = await fetch(`${API_URL}`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         // Add any authentication headers if needed
            //         // 'Authorization': `Bearer ${token}`,
            //     },
            //     credentials: 'include', // Include credentials if needed
            //     mode: 'cors', // Enable CORS
            // });

            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }

            // const data = await response.json();
            // setLockerData(data);

            // // Set default selections from actual API data
            // if (data.metadata?.rooms?.length > 0) {
            //     setSelectedRoom(data.metadata.rooms[0]);
            // }
            // if (data.metadata?.types?.length > 0) {
            //     setSelectedType(data.metadata.types[0].code);
            //     setSelectedSize(data.metadata.types[0].name);
            // }

            const dummyData = {
                "cabinets": [
                    {
                        "cabinet_number": 1,
                        "location": "Floor 1",
                        "lockers": [
                            {
                                "locker_number": "101",
                                "room_number": "A101",
                                "row": 1,
                                "column": 1,
                                "type": "S",
                                "size": "Medium",
                                "status": "available"
                            },
                            null, // Missing locker
                            {
                                "locker_number": "103",
                                "room_number": "A101",
                                "row": 1,
                                "column": 3,
                                "type": "M",
                                "size": "Medium",
                                "status": "available"
                            },
                            // Regular lockers for remaining rows
                            ...Array(6).fill(null).map((_, index) => ({
                                "locker_number": `10${index + 4}`,
                                "room_number": "A101",
                                "row": Math.floor((index + 3) / 3) + 1,
                                "column": ((index + 3) % 3) + 1,
                                "type": "M",
                                "size": "Medium",
                                "status": "occupied"
                            }))
                        ]
                    },
                    {
                        "cabinet_number": 2,
                        "location": "Floor 1",
                        "lockers": Array(100).fill(null).map((_, index) => ({
                            "locker_number": `20${index + 1}`,
                            "room_number": "A102",
                            "row": Math.floor(index / 5) + 1,
                            "column": (index % 8) + 1,
                            "type": "L",
                            "size": "Large",
                            "status": index % 2 === 0 ? index % 3 === 0 ? 'maintenance' : 'occupied' : 'available'
                        }))
                    },
                    {
                        "cabinet_number": 3,
                        "location": "Floor 2",
                        "lockers": Array(9).fill(null).map((_, index) => ({
                            "locker_number": `30${index + 1}`,
                            "room_number": "B101",
                            "row": Math.floor(index / 3) + 1,
                            "column": (index % 3) + 1,
                            "type": "S",
                            "size": "Small",
                            "status": index % 2 === 0 ? 'occupied' : 'available'
                        }))
                    },
                    {
                        "cabinet_number": 4,
                        "location": "Floor 2",
                        "lockers": Array(9).fill(null).map((_, index) => ({
                            "locker_number": `40${index + 1}`,
                            "room_number": "B102",
                            "row": Math.floor(index / 3) + 1,
                            "column": (index % 3) + 1,
                            "type": "L",
                            "size": "Large",
                            "status": index % 2 === 0 ? index % 3 === 0 ? 'maintenance' : 'occupied' : 'available'
                        }))
                    }
                ],
                "metadata": {
                    "rooms": ["A101", "A102", "B101"],
                    "types": [
                        { "code": "S", "name": "Small" },
                        { "code": "M", "name": "Medium" },
                        { "code": "L", "name": "Large" }
                    ]
                }
            };

            setLockerData(dummyData);
            setSelectedRoom(dummyData.metadata.rooms[0]);
            setSelectedType(dummyData.metadata.types[0].code);
            setSelectedSize(dummyData.metadata.types[0].name);


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

            if (retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    fetchLockerData();
                }, 3000);
            }
        }
    };

    // Reset retry count when component mounts
    useEffect(() => {
        setRetryCount(0);
    }, []);

    // Get filtered options from the data
    const getFilteredOptions = () => {
        if (!lockerData) return {
            rooms: [],
            types: [],
            sizes: []
        };

        return {
            rooms: lockerData.metadata?.rooms || [],
            types: lockerData.metadata?.types?.map(t => t.code) || [],
            sizes: lockerData.metadata?.types?.map(t => t.name) || []
        };
    };

    // Update the form section to use the new structure
    const renderForm = () => {
        const options = getFilteredOptions();
        return (
            <div className="assign-locker-form">
                <div className="form-group">
                    <label>Room<span className='required'>*</span></label>
                    <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                        {options.rooms.map((room) => (
                            <option key={room} value={room}>
                                Room {room}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Type<span className='required'>*</span></label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        {options.types.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Size<span className='required'>*</span></label>
                    <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                    >
                        {options.sizes.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Cabinet Number<span className='required'>*</span></label>
                    <select value={selectedCabinet} onChange={handleCabinetChange}>
                        {lockerData.cabinets.map((cabinet) => (
                            <option key={cabinet.cabinet_number} value={cabinet.cabinet_number}>
                                Cabinet {cabinet.cabinet_number}
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
        fetchLockerData();
    }, []);

    const getCabinetView = (cabinetNumber) => {
        if (!lockerData) return [];

        const cabinet = lockerData.cabinets.find(c => c.cabinet_number === cabinetNumber);
        if (!cabinet) return [];

        // Group lockers by room and row to create grid view
        const lockerGrid = [];
        cabinet.lockers.forEach(locker => {
            // Skip if locker is null or doesn't match selected type and size
            if (locker && selectedType && selectedSize) {
                // Only add lockers that match the selected type and size
                if (locker.type === selectedType && locker.size === selectedSize) {
                    if (!lockerGrid[locker.row - 1]) {
                        lockerGrid[locker.row - 1] = [];
                    }
                    lockerGrid[locker.row - 1][locker.column - 1] = locker;
                } else {
                    // Add null for non-matching lockers to maintain grid structure
                    if (!lockerGrid[locker.row - 1]) {
                        lockerGrid[locker.row - 1] = [];
                    }
                    lockerGrid[locker.row - 1][locker.column - 1] = null;
                }
            } else {
                // Handle null lockers or when no filters are selected
                if (!lockerGrid[locker?.row - 1]) {
                    lockerGrid[locker?.row - 1] = [];
                }
                lockerGrid[locker?.row - 1][locker?.column - 1] = locker;
            }
        });

        // Remove empty rows
        return lockerGrid.filter(row => row && row.some(locker => locker !== undefined));
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

    const handleCabinetChange = (event) => {
        setSelectedCabinet(Number(event.target.value));
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
                {retryCount >= 3 && (
                    <button
                        className="retry-button"
                        onClick={handleRetry}
                    >
                        Try Again
                    </button>
                )}
                <button
                    className="close-button"
                    onClick={onClose}
                >
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
                                        locker ? (
                                            <button
                                                key={colIndex}
                                                className={`locker-item ${selectedLocker?.locker_number === locker.locker_number ? 'selected' : ''
                                                    } ${locker.status !== LOCKER_STATUS.AVAILABLE ? 'occupied' : ''}`}
                                                onClick={() => handleLockerClick(locker)}
                                                disabled={locker.status !== LOCKER_STATUS.AVAILABLE}
                                                {...(locker.status !== LOCKER_STATUS.AVAILABLE && { 'data-status': getStatusText(locker.status) })}
                                            >
                                                <div dangerouslySetInnerHTML={{
                                                    __html: getLockerSvg(locker, selectedLocker?.locker_number === locker.locker_number)
                                                }} />
                                                <span className="locker-number">{locker.locker_number}</span>
                                            </button>
                                        ) : (
                                            <div
                                                key={colIndex}
                                                className="locker-item missing"
                                                style={{
                                                    backgroundColor: '#f0f0f0',
                                                    cursor: 'not-allowed',
                                                }}
                                            >
                                                N/A
                                            </div>
                                        )
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