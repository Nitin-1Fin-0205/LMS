import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import AssignLocker from './AssignLocker';
import AddNominee from './AddNominee';
import Attachments from './Attachments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const LockerInfo = ({ onUpdate, initialData, holderType, centers, isLoadingCenters }) => {
    const [lockerData, setLockerData] = useState(initialData || {
        assignedLocker: "",
        center: "",
        remarks: ""
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

    // Update the openModal function to check for center selection
    const openModal = () => {
        if (!lockerData.center) {
            toast.error('Please select a center first');
            return;
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleLockerAssign = (locker) => {
        handleInputChange('assignedLocker', locker?.locker_number || "");
        closeModal();
    };

    const openNomineeModal = () => {
        setIsNomineeModalOpen(true);
    };

    const closeNomineeModal = () => {
        setIsNomineeModalOpen(false);
    };

    const handleNomineeSave = (nomineeData) => {
        setNominees(nomineeData); // Save the nominee data
        closeNomineeModal();
    };

    const handleAttachmentsUpdate = (attachments) => {
        const updatedData = {
            ...lockerData,
            attachments
        };
        setLockerData(updatedData);
        onUpdate(updatedData);
    };

    return (
        <div className="form-section">
            <h2>Locker Information</h2>
            <div className="form-group">
                <label>Center<span className='required'>*</span></label>
                <select
                    value={lockerData.center}
                    onChange={(e) => handleInputChange('center', e.target.value)}
                    required
                    disabled={isLoadingCenters}
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

                {/* Update the input display to show the selected locker */}
                <div className="input-with-button">
                    <input
                        type="text"
                        className="locker-input"
                        placeholder="Select center first to assign locker"
                        value={lockerData.assignedLocker || ''}
                        readOnly
                    />
                    <button
                        className="add-center-button"
                        onClick={openModal}
                        disabled={!lockerData.center} // Disable button if no center selected
                    >
                        <FontAwesomeIcon icon={faPlus} className="add-icon" />
                    </button>
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
            <div className="nominee-button-container">
                <button className="nominee-button" onClick={openNomineeModal}>
                    Add Nominee Details
                </button>
            </div>

            {/* Render Nominee Cards */}
            <div className="nominee-cards">
                {nominees.map((nominee, index) => (
                    <div key={index} className="nominee-card">
                        <h4>Name: {nominee.name}</h4>
                        <p>Relation: {nominee.relation}</p>
                        <p>DOB: {nominee.dob}</p>
                    </div>
                ))}
            </div>

            {/* Attachments Section */}
            <Attachments
                holderType={holderType}
                onUpdate={handleAttachmentsUpdate}
            />

            {/* Assign Locker Modal */}
            <AssignLocker
                isOpen={isModalOpen}
                onLockerAssign={handleLockerAssign}
                onClose={closeModal}
                cabinetId={lockerData.center} // Pass the selected center ID
            />

            {/* Add Nominee Modal */}
            <AddNominee
                isOpen={isNomineeModalOpen}
                onClose={closeNomineeModal}
                onSave={handleNomineeSave}
            />
        </div>
    );
};

export default LockerInfo;