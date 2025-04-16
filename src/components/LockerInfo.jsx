import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AssignLocker from './AssignLocker';
import AddNominee from './AddNominee';
import Attachments from './Attachments';

const LockerInfo = ({ onUpdate, initialData, holderType, centers, isLoadingCenters }) => {
    const [lockerData, setLockerData] = useState(initialData || {
        assignedLocker: "",
        center: "",
        remarks: "",
        lockerId: null,
        lockerSize: ""
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
    const [nominees, setNominees] = useState([]);

    const handleInputChange = (field, value) => {
        const updatedData = {
            ...lockerData,
            [field]: value
        };
        setLockerData(updatedData);
        onUpdate(updatedData);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleLockerAssign = (locker) => {
        const updatedData = {
            ...lockerData,
            assignedLocker: locker?.locker_number || "",
            lockerId: locker?.locker_id || null,
            lockerSize: locker?.size || ""
        };
        setLockerData(updatedData);
        console.log("Locker assigned:", locker);
        onUpdate(updatedData);
        closeModal();
    };

    const handleAttachmentsUpdate = (attachments) => {
        const updatedData = {
            ...lockerData,
            attachments
        };
        setLockerData(updatedData);
        onUpdate(updatedData);
    };

    // Determine if this is a secondary holder (second or third)
    const isSecondaryHolder = holderType === 'secondHolder' || holderType === 'thirdHolder';

    return (
        <div className="form-section">
            <h2>Locker Information</h2>
            <div className="form-group">
                <label>Center<span className='required'>*</span></label>
                <select
                    value={lockerData.center}
                    onChange={(e) => handleInputChange('center', e.target.value)}
                    required
                    disabled={isLoadingCenters || isSecondaryHolder}
                >
                    <option value="">Select Center</option>
                    {centers.map((center) => (
                        <option key={center.id} value={center.id}>
                            {center.name}
                        </option>
                    ))}
                </select>
                {isLoadingCenters && <span className="loading-indicator">Loading centers...</span>}
            </div>

            <div className="form-group locker-group">
                <label>Assign Locker<span className='required'>*</span></label>
                <div className="input-with-button">
                    <input
                        type="text"
                        className="locker-input"
                        value={`${lockerData.assignedLocker}${lockerData.lockerSize ? ` (${lockerData.lockerSize})` : ''}`}
                        placeholder="Assign locker"
                        readOnly
                    />
                    {!isSecondaryHolder && (
                        <button
                            className="add-center-button"
                            onClick={openModal}
                            disabled={!lockerData.center} // Disable if no center selected
                        >
                            <FontAwesomeIcon icon={faPlus} className="add-icon" />
                        </button>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label>Remarks</label>
                <textarea
                    placeholder="Enter remarks"
                    value={lockerData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                ></textarea>
            </div>

            {/* Only show nominee section for primary holder */}
            {holderType === 'primaryHolder' && (
                <>
                    <div className="nominee-button-container">
                        <button className="nominee-button" onClick={() => setIsNomineeModalOpen(true)}>
                            Add Nominee Details
                        </button>
                    </div>

                    <div className="nominee-cards">
                        {nominees.map((nominee, index) => (
                            <div key={index} className="nominee-card">
                                <h4>Name: {nominee.name}</h4>
                                <p>Relation: {nominee.relation}</p>
                                <p>DOB: {nominee.dob}</p>
                            </div>
                        ))}
                    </div>

                    <AddNominee
                        isOpen={isNomineeModalOpen}
                        onClose={() => setIsNomineeModalOpen(false)}
                        onSave={setNominees}
                    />
                </>
            )}

            {/* Attachments Section */}
            <Attachments
                holderType={holderType}
                onUpdate={handleAttachmentsUpdate}
            />

            {/* Assign Locker Modal - Only for primary holder */}
            {!isSecondaryHolder && (
                <AssignLocker
                    isOpen={isModalOpen}
                    onLockerAssign={handleLockerAssign}
                    onClose={closeModal}
                    centerId={lockerData.center}
                />
            )}
        </div>
    );
};

export default LockerInfo;