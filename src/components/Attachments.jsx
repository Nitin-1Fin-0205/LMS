import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faEye, faTrash, faTimes, faFilePdf, faPlus, faFileImage, faFile, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';

const Attachments = ({ customerId, holderType, onSuccess, onBack }) => {
    const [selectedCategory, setSelectedCategory] = useState('identityProof');
    const [documents, setDocuments] = useState(() => ({}));
    const [documentCategories, setDocumentCategories] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                        allowMultiple: true,
                        limit: item.limit,
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
                        documentType: doc.document,
                        remark: doc.remark
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

    useEffect(() => {

        if (customerId && documentCategories.length > 0) {
            fetchExistingDocuments();
        }
    }, [customerId, documentCategories]);

    const uploadDocumentToServer = async (documentData) => {
        try {
            const token = localStorage.getItem('authToken');
            const payload = {
                customerId: Number(customerId),
                documentId: Number(documentData.category),
                documentName: documentData.name || documentData.data.split(',')[0].split('/')[1].split(';')[0],
                documentBase64: documentData.data.split(',')[1],
                remark: documentData.remark || '', // Add remarks if available
                // // Add remarks only for "Other Document" (id: 5)
                // ...(documentData.category === 5 && { remark: documentData.remark })
            };

            const response = await axios.post(
                `${API_URL}/customers/document-upload`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                fetchExistingDocuments(); // Refresh documents after upload
                return response.data;
            }
            throw new Error('Failed to upload document');
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(error.response?.data?.message || 'Failed to upload document');
        }
    }; const handleFileUpload = async (event) => {
        try {
            const files = Array.from(event.target.files || []);
            if (files.length === 0) return;

            const category = selectedCategory;
            if (!category || !documents[category]) {
                toast.error('Please select a valid document category');
                return;
            }

            // Get current document count and limit for this category
            const currentCount = documents[category]?.length || 0;
            const categoryConfig = documentCategories.find(c => Number(c.key) === Number(category));
            const uploadLimit = categoryConfig?.limit;

            if (!uploadLimit) {
                toast.error('Upload limit not available for this category');
                return;
            }

            // Validate remarks for "Other Document"
            if (Number(category) === 5 && !remarks?.trim()) {
                toast.error('Please enter remarks for Other Document');
                return;
            }

            // Filter out files that would exceed the limit
            const remainingSlots = uploadLimit - currentCount;
            const filesToUpload = files.slice(0, remainingSlots);

            if (filesToUpload.length === 0) {
                toast.error(`Maximum ${uploadLimit} documents allowed for ${categoryConfig.label}`);
                return;
            }

            if (filesToUpload.length < files.length) {
                toast.warning(`Only uploading ${filesToUpload.length} files due to category limit`);
            }

            // Process each file
            for (const file of filesToUpload) {
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
                        category,
                        remark: Number(category) === 5 ? remarks : undefined
                    };

                    await uploadDocumentToServer(newDoc);

                    const updatedDocs = {
                        ...documents,
                        [category]: [...documents[category], newDoc]
                    };

                    setDocuments(updatedDocs);
                    if (Number(category) === 5) {
                        setRemarks(''); // Clear remarks after successful upload for Other Document
                    }
                    toast.success(`${file.name} uploaded successfully`);
                } catch (error) {
                    toast.error(`Failed to upload ${file.name}: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('File upload error:', error);
            toast.error('An error occurred during file upload');
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

    const [previewDoc, setPreviewDoc] = useState(null); const renderPreview = (doc, isListItem = true) => {
        const isRemoteUrl = doc.data.startsWith('http');

        if (doc.type.startsWith('image/')) {
            if (isListItem) {
                // Show icon for list view
                return (
                    <div className="flex items-center justify-center w-full h-full">
                        <FontAwesomeIcon
                            icon={faFileImage}
                            className="text-blue-500 text-sm"
                        />
                    </div>
                );
            } else {
                // Show actual image for modal preview
                return (
                    <div className="max-w-[85vw] max-h-[70vh] flex items-center justify-center">
                        <img
                            src={isRemoteUrl ? doc.data : doc.data}
                            alt={doc.name}
                            className="max-w-full max-h-[70vh] object-contain rounded shadow-xl"
                        />
                    </div>
                );
            }
        }

        if (doc.type === 'application/pdf') {
            return (
                <div className="flex items-center justify-center w-full h-full">
                    <FontAwesomeIcon
                        icon={faFilePdf}
                        className={isListItem ? "text-red-500 text-sm" : "text-red-500 text-4xl"}
                    />
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center w-full h-full">
                <FontAwesomeIcon
                    icon={faFileUpload}
                    className={isListItem ? "text-gray-400 text-sm" : "text-gray-400 text-4xl"}
                />
            </div>
        );
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

    // Reset remarks when category changes
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        if (Number(e.target.value) !== 5) {
            setRemarks('');
        }
    };

    const isUploadDisabled = () => {
        if (!selectedCategory) return true;

        const currentCount = documents[selectedCategory]?.length || 0;
        const category = documentCategories.find(c => Number(c.key) === Number(selectedCategory));
        const limit = category?.limit;

        // Disabled if:
        // 1. Current count has reached the limit
        // 2. For "Other Document" (id: 5), remarks are required
        // 3. Category has no limit defined
        return !limit ||
            currentCount >= limit ||
            (Number(selectedCategory) === 5 && !remarks?.trim());
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Validate that required documents are uploaded
            const hasDocuments = Object.values(documents).some(categoryDocs => categoryDocs.length > 0);

            if (!hasDocuments) {
                toast.error('Please upload at least one document');
                return;
            }

            // Call success callback if provided
            if (onSuccess) {
                onSuccess();
            }

            toast.success('Documents uploaded successfully');

        } catch (error) {
            console.error('Attachment submission error:', error);
            toast.error('Failed to process attachments');
        } finally {
            setIsSubmitting(false);
        }
    }; return (
        <div className="bg-white rounded-xl shadow-lg p-4">
            {/* Header Section */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Document Attachments</h2>
            </div>            {/* Upload Form Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* Document Category */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Document Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="w-full h-9 px-3 border border-gray-300 rounded text-sm text-gray-700 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            disabled={documentCategories.length === 0}
                        >
                            {documentCategories.map(({ key, label }) => {
                                const currentCount = documents[key]?.length || 0;
                                const limit = documentCategories.find(c => c.key === key)?.limit;
                                return (
                                    <option key={key} value={key}>
                                        {`${label} (${currentCount}/${limit})`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Remarks Input (conditional) */}
                    {Number(selectedCategory) == 5 && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Document Remarks
                            </label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter document remarks"
                                className="w-full h-9 px-3 border border-gray-300 rounded text-sm text-gray-700 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}                    {/* Upload Button */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Upload Document
                        </label>
                        <label className={`
                            relative cursor-pointer 
                            ${isUploadDisabled()
                                ? 'bg-gray-100 border border-dashed border-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } 
                            h-9 px-4 rounded flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200
                        `}>
                            <FontAwesomeIcon
                                icon={faPlus}
                                className={`text-sm ${isUploadDisabled() ? 'text-gray-500' : 'text-white'}`}
                            />
                            <span className={isUploadDisabled() ? 'text-gray-500' : 'text-white'}>
                                {isUploadDisabled() ? 'Upload Disabled' : 'Choose Files'}
                            </span>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                multiple={true}
                                disabled={isUploadDisabled()}
                            />
                        </label>
                        {!isUploadDisabled() && (
                            <p className="text-xs text-gray-500 text-center">
                                Images & PDF up to 5MB
                            </p>
                        )}
                    </div>
                </div>
            </div>            {/* Documents List Section */}
            <div className="space-y-3">
                {documentCategories.map(({ key, label }) => (
                    documents[key]?.length > 0 && (
                        <div key={key} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            {/* Category Header */}
                            <div className="bg-gray-50 border-b border-gray-200 p-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-800">{label}</h3>
                                        </div>
                                    </div>
                                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        <span className="text-xs font-medium">
                                            {documents[key].length} file{documents[key].length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Grid */}
                            <div className="p-2">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                    {documents[key].map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors duration-200">
                                            {/* Document Preview */}
                                            <div className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                {renderPreview(doc, true)}
                                            </div>

                                            {/* Document Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-xs text-gray-800 truncate">
                                                    {doc.name}
                                                </h4>
                                                {/* <div className="flex items-center gap-1 mt-1">
                                                    <span className={`text-xs px-1 py-0.5 rounded ${doc.type === 'application/pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {doc.type === 'application/pdf' ? 'pdf' : 'Image'}
                                                    </span>
                                                    {doc.size && (
                                                        <span className="text-xs text-gray-500">
                                                            {(doc.size / (1024 * 1024)).toFixed(1)}MB
                                                        </span>
                                                    )}
                                                </div> */}
                                                {doc.remark && (
                                                    <div className="">
                                                        <span className="text-xs text-blue-800 bold">
                                                            {doc.remark}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handlePreview(doc)}
                                                    title="Preview Document"
                                                    className="w-6 h-6 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded flex items-center justify-center transition-colors duration-200 cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                </button>
                                                <button
                                                    onClick={() => removeDocument(key, doc.id)}
                                                    title="Remove Document"
                                                    className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center transition-colors duration-200 cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                {onBack && (
                    <button
                        type="button"
                        className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onBack}
                        disabled={isSubmitting}
                    >
                        Back
                    </button>
                )}                <div className="flex gap-3 ml-auto">
                    {onSuccess && (
                        <button
                            type="button"
                            className="px-6 py-2 bg-green-600 text-white border-none rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onSuccess}
                            disabled={isSubmitting}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>{/* Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-5" onClick={() => setPreviewDoc(null)}>
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-hidden relative">
                        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                    <FontAwesomeIcon icon={previewDoc.type === 'application/pdf' ? faFilePdf : faFileUpload} className="text-blue-600 text-sm" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">{previewDoc.name}</h3>
                                    <p className="text-gray-600 text-sm">
                                        {previewDoc.type === 'application/pdf' ? 'PDF Document' : 'Image File'}
                                        {previewDoc.size && ` • ${(previewDoc.size / (1024 * 1024)).toFixed(2)} MB`}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded flex items-center justify-center transition-colors duration-200"
                                onClick={() => setPreviewDoc(null)}
                                title="Close Preview"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        <div className="p-6">
                            {previewDoc.type.startsWith('image/') ? (
                                renderPreview(previewDoc, false)
                            ) : (
                                <div className="flex items-center justify-center py-16 text-gray-500">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FontAwesomeIcon icon={faFilePdf} className="text-red-500 text-2xl" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-700 mb-2">PDF Preview</p>
                                        <p className="text-gray-500">Click the file to open in a new tab</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attachments;