import React, { useState } from 'react';
import lockerLight from '../assets/icons/lockerLight.png';
import lockerDark from '../assets/icons/lockerDark.png';

const AssignLocker = ({ isOpen, onClose, onLockerAssign }) => {
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [selectedCabinet, setSelectedCabinet] = useState('Cabinet 1'); // Default cabinet

    // Example data for lockers in different cabinets
    const cabinetLockers = {
        'Cabinet 1': [
            ['L1', 'L2', 'L3'],
            ['L4', 'L5', 'L6'],
            ['L7', 'L8', 'L9'],
        ],
        'Cabinet 2': [
            ['L10', 'L11', 'L12'],
            ['L13', 'L14', 'L15'],
            ['L16', 'L17', 'L18'],
        ],
    };

    const handleLockerClick = (locker) => {
        setSelectedLocker(locker);
    };

    const handleAssign = () => {
        if (selectedLocker) {
            onLockerAssign(selectedLocker); // Pass the selected locker to the parent component
        }
    };

    const handleCabinetChange = (event) => {
        setSelectedCabinet(event.target.value);
        setSelectedLocker(null); // Reset selected locker when cabinet changes
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Assign Lockers</h3>
                <div className="assign-locker-container">
                    {/* Left Side: Form */}
                    <div className="assign-locker-form">
                        <div className="form-group">
                            <label>Room</label>
                            <select>
                                <option>Room 1</option>
                                <option>Room 2</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select>
                                <option>E</option>
                                <option>F</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Locker Type</label>
                            <select>
                                <option>Medium</option>
                                <option>Large</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Cabinet Number</label>
                            <select value={selectedCabinet} onChange={handleCabinetChange}>
                                <option>Cabinet 1</option>
                                <option>Cabinet 2</option>
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
                    </div>

                    {/* Right Side: Cabinet View */}
                    <div className="cabinet-view">
                        <h4>Cabinet View</h4>
                        <div className="locker-grid">
                            {cabinetLockers[selectedCabinet].map((row, rowIndex) => (
                                <div key={rowIndex} className="locker-row">
                                    {row.map((locker, colIndex) => (
                                        <button
                                            key={colIndex}
                                            className={`locker-item ${selectedLocker === locker ? 'selected' : ''
                                                }`}
                                            onClick={() => handleLockerClick(locker)}
                                            style={{
                                                backgroundImage: `url(${selectedLocker === locker
                                                    ? lockerDark
                                                    : lockerLight
                                                    })`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        >
                                            {locker}
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