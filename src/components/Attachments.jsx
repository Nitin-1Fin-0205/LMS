import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Attachments = ({ holderType, onUpdate, initialData }) => {
    const [attachments, setAttachments] = useState({
        identityProof: null,
        addressProof: null,
        contactDocument: null,
        otherDocument: null
    });

    const fileInputRefs = {
        identityProof: useRef(),
        addressProof: useRef(),
        contactDocument: useRef(),
        otherDocument: useRef()
    };

    useEffect(() => {
        if (initialData) {
            setAttachments(prevAttachments => ({
                ...prevAttachments,
                ...initialData
            }));
        }
    }, [initialData]);

    const handleFileUpload = (type, event) => {
        const file = event.target.files[0];
        if (file) {
            const newAttachments = {
                ...attachments,
                [type]: file
            };
            setAttachments(newAttachments);
            onUpdate(newAttachments);
            toast.success(`${type} uploaded successfully`);
        }
    };

    const renderAttachments = () => {
        if (holderType === 'primaryHolder') {
            return (
                <>
                    <div className="attachment-item">
                        <label>
                            Select Identity Proof
                            <input
                                type="file"
                                ref={fileInputRefs.identityProof}
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileUpload('identityProof', e)}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {attachments.identityProof && <span className="tick-icon">✔</span>}
                    </div>
                    <div className="attachment-item">
                        <label>
                            Select Address Proof
                            <input
                                type="file"
                                ref={fileInputRefs.addressProof}
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileUpload('addressProof', e)}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {attachments.addressProof && <span className="tick-icon">✔</span>}
                    </div>
                    <div className="attachment-item">
                        <label>
                            Select Contact Document
                            <input
                                type="file"
                                ref={fileInputRefs.contactDocument}
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileUpload('contactDocument', e)}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {attachments.contactDocument && <span className="tick-icon">✔</span>}
                    </div>
                    <div className="attachment-item">
                        <label>
                            Select Other Document
                            <input
                                type="file"
                                ref={fileInputRefs.otherDocument}
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileUpload('otherDocument', e)}
                                style={{ display: 'none' }}
                            />
                        </label>
                        {attachments.otherDocument && <span className="tick-icon">✔</span>}
                    </div>
                </>
            );
        }

        return (
            <>
                <div className="attachment-item">
                    <label>
                        Select Identity Proof
                        <input
                            type="file"
                            ref={fileInputRefs.identityProof}
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload('identityProof', e)}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {attachments.identityProof && <span className="tick-icon">✔</span>}
                </div>
                <div className="attachment-item">
                    <label>
                        Select Address Proof
                        <input
                            type="file"
                            ref={fileInputRefs.addressProof}
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileUpload('addressProof', e)}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {attachments.addressProof && <span className="tick-icon">✔</span>}
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