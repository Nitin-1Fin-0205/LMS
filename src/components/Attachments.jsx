import React, { useState } from 'react';

const Attachments = ({ holderType, onUpdate }) => {
    const [uploadedFiles, setUploadedFiles] = useState({
        identityProof: false,
        addressProof: false,
        contactDocument: false,
        otherDocument: false,
    });

    const handleFileUpload = (type, event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFiles(prev => ({ ...prev, [type]: true }));
            onUpdate({ ...uploadedFiles, [type]: file });
        }
    };

    // Render different attachments based on holder type
    const renderAttachments = () => {
        // For primary holder, show all attachments
        if (holderType === 'primaryHolder') {
            return (
                <>
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
                </>
            );
        }

        // For secondary and third holders, show only identity and address proof
        return (
            <>
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
            </>
        );
    };

    return (
        <div className="attachments-section">
            <h3>Attachments</h3>
            {renderAttachments()}
        </div>
    );
};

export default Attachments;