import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faEye, faTrash, faTimes, faFilePdf, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import '../styles/Attachments.css';

const Attachments = ({ onUpdate, initialData, holderType }) => {
    const [selectedCategory, setSelectedCategory] = useState('identityProof');
    const [documents, setDocuments] = useState({
        identityProof: [],
        addressProof: [],
        contactDocument: [],
        otherDocument: [],
    });

    // Add useEffect to handle initial data
    useEffect(() => {
        if (initialData) {
            setDocuments(prevDocs => ({
                ...prevDocs,
                ...initialData
            }));
        }
    }, [initialData]);

    const documentCategories = [
        { key: 'identityProof', label: 'Identity Proof', allowMultiple: true },
        { key: 'addressProof', label: 'Address Proof', allowMultiple: true },
        { key: 'contactDocument', label: 'Contact Document', allowMultiple: false },
        { key: 'otherDocument', label: 'Other Document', allowMultiple: true },
    ];

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        const category = selectedCategory;
        const categoryConfig = documentCategories.find(c => c.key === category);

        if (!categoryConfig.allowMultiple && documents[category].length > 0) {
            toast.error(`Only one document allowed for ${categoryConfig.label}`);
            return;
        }

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 5MB)`);
                continue;
            }

            try {
                const base64 = await convertToBase64(file);
                const newDoc = {
                    id: Date.now(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                    category
                };

                const updatedDocs = {
                    ...documents,
                    [category]: [...documents[category], newDoc]
                };
                setDocuments(updatedDocs);
                onUpdate(updatedDocs);
                toast.success(`Document uploaded successfully`);
            } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
            }
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const removeDocument = (category, docId) => {
        const updatedDocs = {
            ...documents,
            [category]: documents[category].filter(doc => doc.id !== docId)
        };
        setDocuments(updatedDocs);
        onUpdate(updatedDocs);
    };

    const [previewDoc, setPreviewDoc] = useState(null);

    const renderPreview = (doc, isListItem = true) => {
        if (doc.type.startsWith('image/')) {
            return (
                <div className={isListItem ? "document-preview-container" : "modal-preview-container"}>
                    <img src={doc.data} alt={doc.name} className="document-preview-image" />
                </div>
            );
        }
        if (doc.type === 'application/pdf') {
            return <FontAwesomeIcon icon={faFilePdf} size="3x" color="#344767" />;
        }
        return <FontAwesomeIcon icon={faFileUpload} size="3x" />;
    };

    const handlePreview = (doc) => {
        setPreviewDoc(doc);
        if (doc.type === 'application/pdf') {
            window.open(URL.createObjectURL(dataURLtoBlob(doc.data)), '_blank');
        }
    };

    return (
        <div className="attachments-container">
            <div className="attachments-header">
                <div className="upload-section">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {documentCategories.map(({ key, label }) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <label className="upload-button">
                        <FontAwesomeIcon icon={faPlus} />
                        Add Document
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            multiple={documentCategories.find(c => c.key === selectedCategory)?.allowMultiple}
                        />
                    </label>
                </div>
            </div>

            <div className="documents-list">
                {documentCategories.map(({ key, label }) => (
                    documents[key].length > 0 && (
                        <div key={key} className="document-category">
                            <h4>{label}</h4>
                            <div className="document-items">
                                {documents[key].map((doc) => (
                                    <div key={doc.id} className="document-item">
                                        <div className="document-preview">
                                            {renderPreview(doc, true)}
                                        </div>
                                        <div className="document-info">
                                            <span className="document-name">{doc.name}</span>
                                            <span className="document-size">
                                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <div className="document-actions">
                                            <button onClick={() => handlePreview(doc)} title="Preview">
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button onClick={() => removeDocument(key, doc.id)} title="Remove">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {previewDoc && previewDoc.type.startsWith('image/') && (
                <div className="preview-modal" onClick={() => setPreviewDoc(null)}>
                    <div className="preview-content">
                        <button className="close-preview">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        {renderPreview(previewDoc, false)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attachments;