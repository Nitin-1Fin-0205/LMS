import React, { useState } from 'react';
import AssignLocker from './AssignLocker';
import AddNominee from './AddNominee';

const LockerInfo = ({ onUpdate, initialData }) => {
    const [lockerData, setLockerData] = useState(initialData || {
        assignedLocker: "",
        smartCardNumber: "",
        userGroup: "",
        remarks: ""
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
    const [nominees, setNominees] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({
        identityProof: false,
        addressProof: false,
        contactDocument: false,
        otherDocument: false,
    });

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
        handleInputChange('assignedLocker', locker);
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

    const handleFileUpload = (type, event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFiles((prev) => ({ ...prev, [type]: true }));
        }
    };

    return (
        <div className="form-section">
            <h2>Locker Information</h2>
            <div className="form-group locker-group">
                <label>Assign Locker</label>
                <div className="input-with-button">
                    <input
                        type="text"
                        className="locker-input"
                        placeholder="Assign locker"
                        value={lockerData.assignedLocker} // Display the assigned locker
                        readOnly
                    />
                    <button className="add-button" onClick={openModal}>
                        +
                    </button>
                </div>
            </div>
            <div className="form-group">
                <label>Smart Card Number</label>
                <input
                    type="text"
                    placeholder="Enter smart card number"
                    value={lockerData.smartCardNumber}
                    onChange={(e) => handleInputChange('smartCardNumber', e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Group</label>
                <select
                    value={lockerData.userGroup}
                    onChange={(e) => handleInputChange('userGroup', e.target.value)}
                >
                    <option value="">Select Group</option>
                    <option value="User Group 1">User Group 1</option>
                    <option value="User Group 2">User Group 2</option>
                    <option value="User Group 3">User Group 3</option>
                </select>
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
            <div className="attachments-section">
                <h3>Attachments</h3>
                <div className="attachment-item">
                    <label>
                        Select Identity Proof
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload('identityProof', e)}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {uploadedFiles.identityProof && <span className="tick-icon">✔</span>}
                </div>
                <div className="attachment-item">
                    <label>
                        Select Address Proof
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload('addressProof', e)}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {uploadedFiles.addressProof && <span className="tick-icon">✔</span>}
                </div>
                <div className="attachment-item">
                    <label>
                        Select Contact Document
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload('contactDocument', e)}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {uploadedFiles.contactDocument && <span className="tick-icon">✔</span>}
                </div>
                <div className="attachment-item">
                    <label>
                        Select Other Document
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload('otherDocument', e)}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {uploadedFiles.otherDocument && <span className="tick-icon">✔</span>}
                </div>
            </div>

            {/* Assign Locker Modal */}
            <AssignLocker isOpen={isModalOpen} onLockerAssign={handleLockerAssign} onClose={closeModal} />

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