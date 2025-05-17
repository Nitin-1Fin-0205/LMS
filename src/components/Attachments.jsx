import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faEye, faTrash, faTimes, faFilePdf, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/Attachments.css';

const Attachments = ({ customerId }) => {
    const [selectedCategory, setSelectedCategory] = useState('identityProof');
    const [documents, setDocuments] = useState(() => ({}));
    const [documentCategories, setDocumentCategories] = useState([]);

    useEffect(() => {
        const fetchDocumentCategories = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_URL}/masters/document-types`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    const documentCategoryList = response.data.data.document_master.map((item) => ({
                        key: item.id,
                        label: item.title,
                        allowMultiple: true
                    }));

                    const initialDocuments = {};
                    documentCategoryList.forEach(category => {
                        initialDocuments[category.key] = [];
                    });
                    setDocuments(initialDocuments);

                    setDocumentCategories(documentCategoryList);
                    if (documentCategoryList.length > 0) {
                        setSelectedCategory(documentCategoryList[0].key);
                    }
                }
            } catch (error) {
                toast.error('Failed to fetch document categories');
            }
        };

        fetchDocumentCategories();
    }, []);

    useEffect(() => {
        const fetchExistingDocuments = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_URL}/customers/documents?customer_id=${customerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200 && response.data.data.documents) {
                    const docs = response.data.data.documents;
                    const organizedDocs = {};

                    // Initialize categories
                    documentCategories.forEach(category => {
                        organizedDocs[category.key] = [];
                    });

                    // Organize documents by category
                    docs.forEach(doc => {
                        const categoryKey = doc.document_type_id;
                        if (!organizedDocs[categoryKey]) {
                            organizedDocs[categoryKey] = [];
                        }

                        organizedDocs[categoryKey].push({
                            id: doc.unique_id,
                            name: doc.title,
                            type: doc.link.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/*',
                            data: doc.link,
                            category: doc.document_type_id,
                            canEdit: doc.can_edit,
                            documentType: doc.document
                        });
                    });

                    setDocuments(prevDocs => ({
                        ...prevDocs,
                        ...organizedDocs
                    }));
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
                toast.error('Failed to fetch existing documents');
            }
        };

        if (customerId && documentCategories.length > 0) {
            fetchExistingDocuments();
        }
    }, [customerId, documentCategories]);

    const uploadDocumentToServer = async (documentData) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/customers/document-upload`,
                {
                    customerId: Number(customerId),
                    documentId: Number(documentData.category),
                    documentName: documentData.name || documentData.data.split(',')[0].split('/')[1].split(';')[0],
                    documentBase64: documentData.data.split(',')[1]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                return response.data;
            }
            throw new Error('Failed to upload document');
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(error.response?.data?.message || 'Failed to upload document');
        }
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        const category = selectedCategory;

        // Safety check for category and documents
        if (!category || !documents[category]) {
            toast.error('Please select a valid document category');
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

                await uploadDocumentToServer(newDoc);
                console.log('Document uploaded successfully:', newDoc);

                const updatedDocs = {
                    ...documents,
                    [category]: [...documents[category], newDoc]
                };

                setDocuments(updatedDocs);
                // onUpdate(updatedDocs);
                toast.success(`Document uploaded successfully`);
            } catch (error) {
                toast.error(`Failed to upload ${file.name}: ${error.message}`);
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
        // Handle both remote URLs and base64 data URLs
        if (dataURL.startsWith('http')) {
            return dataURL;
        }

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

    const removeDocument = async (category, docId) => {
        const doc = documents[category].find(d => d.id === docId);
        if (!doc?.canEdit) {
            toast.error('This document cannot be deleted');
            return;
        }

        try {
            // Call the API to delete the document from the server
            const token = localStorage.getItem('authToken');
            await axios.post(
                `${API_URL}/customers/unmap-document`,
                {
                    customer_id: Number(customerId),
                    document_id: doc.id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state after successful API call
            const updatedDocs = {
                ...documents,
                [category]: documents[category].filter(document => document.id !== docId)
            };
            setDocuments(updatedDocs);
            toast.success('Document removed successfully');
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error(error.response?.data?.message || 'Failed to remove document');
        }
    };

    const [previewDoc, setPreviewDoc] = useState(null);

    const renderPreview = (doc, isListItem = true) => {
        const isRemoteUrl = doc.data.startsWith('http');

        if (doc.type.startsWith('image/')) {
            return (
                <div className={isListItem ? "document-preview-container" : "modal-preview-container"}>
                    <img
                        src={isRemoteUrl ? doc.data : doc.data}
                        alt={doc.name}
                        className="document-preview-image"
                    />
                </div>
            );
        }

        if (doc.type === 'application/pdf') {
            return <FontAwesomeIcon icon={faFilePdf} size="2x" color="#344767" />;
        }

        return <FontAwesomeIcon icon={faFileUpload} size="3x" />;
    };

    const handlePreview = (doc) => {
        if (doc.type === 'application/pdf') {
            try {
                // If it's a remote URL, open it directly
                if (doc.data.startsWith('http')) {
                    window.open(doc.data, '_blank');
                } else {
                    // For base64 data, convert to blob URL
                    const blob = dataURLtoBlob(doc.data);
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                }
                // Don't set previewDoc for PDFs since we're opening them in a new tab
            } catch (error) {
                console.error('Error previewing PDF:', error);
                toast.error('Failed to preview PDF');
            }
        } else {
            // Only set preview for non-PDF documents
            setPreviewDoc(doc);
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
                        disabled={documentCategories.length === 0}
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
                    documents[key]?.length > 0 && (
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

            {previewDoc && (
                <div className="preview-modal" onClick={() => setPreviewDoc(null)}>
                    <div className="preview-content">
                        <button className="close-preview">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        {previewDoc.type.startsWith('image/') ? (
                            renderPreview(previewDoc, false)
                        ) : (
                            <div>Unsupported file type</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attachments;