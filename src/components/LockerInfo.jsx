import React, { useState } from 'react';
import AssignLocker from './AssignLocker';
import AddNominee from './AddNominee';

const LockerInfo = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
    const [assignedLocker, setAssignedLocker] = useState(''); // State to store the assigned locker
    const [nominees, setNominees] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({
        identityProof: false,
        addressProof: false,
        contactDocument: false,
        otherDocument: false,
    });

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleLockerAssign = (locker) => {
        setAssignedLocker(locker);
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
                        placeholder="Assign locker"
                        value={assignedLocker} // Display the assigned locker
                        readOnly
                    />
                    <button className="add-button" onClick={openModal}>
                        +
                    </button>
                </div>
            </div>
            <div className="form-group">
                <label>Smart Card Number</label>
                <input type="text" placeholder="Enter smart card number" />
            </div>
            <div className="form-group">
                <label>Group</label>
                <select>
                    <option>User Group 1</option>
                    <option>User Group 2</option>
                    <option>User Group 3</option>
                </select>
            </div>
            <div className="form-group">
                <label>Remarks</label>
                <textarea placeholder="Enter remarks"></textarea>
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