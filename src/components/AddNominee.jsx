import { faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { updateNominees, fetchNominees, deleteNominee, updateNominee, addNominee } from '../store/slices/lockerSlice';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/AddNominee.css';

const AddNominee = ({ isOpen, onClose, onSave }) => {
    const dispatch = useDispatch();
    const existingNominees = useSelector(state => state.locker.lockerDetails.nominees || []);
    const customerId = useSelector(state => state.customer.form.primaryHolder.customerInfo.customerId);
    const [nominees, setNominees] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [proofFiles, setProofFiles] = useState({}); // Store nominee proof files

    useEffect(() => {
        const fetchNomineesData = async () => {
            if (customerId) {
                try {
                    await dispatch(fetchNominees(customerId)).unwrap();
                } catch (error) {
                    toast.error('Failed to fetch nominees');
                }
            }
        };

        if (isOpen) {
            fetchNomineesData();
        }
    }, [dispatch, customerId, isOpen]);

    useEffect(() => {
        // Initialize nominees from existing data or create default
        const initialNominees = existingNominees.length > 0
            ? existingNominees.map(nominee => ({
                unique_id: nominee.unique_id,
                name: nominee.name,
                relation: nominee.relation,
                dob: nominee.dob,
                percentage: nominee.ownership_percentage || 0,
                proofId: nominee.proofId || '',
                proofFileUrl: nominee.proofFileUrl || ''
            }))
            : [{ name: '', relation: '', dob: '', percentage: 100, proofId: '', proofFileUrl: '' }];

        setNominees(initialNominees);
        setFormErrors({});
    }, [existingNominees, isOpen]);

    // Calculate age from date of birth
    const calculateAge = (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Validates all nominees' data and returns true if valid
    const validateForm = () => {
        const errors = {};

        // Check for empty required fields
        nominees.forEach((nominee, index) => {
            if (!nominee.name?.trim()) {
                errors[`name-${index}`] = 'Name is required';
            }
            if (!nominee.relation?.trim()) {
                errors[`relation-${index}`] = 'Relation is required';
            }
            if (!nominee.dob) {
                errors[`dob-${index}`] = 'Date of Birth is required';
            }

            // Validate percentage as a number between 0-100
            const percentage = parseFloat(nominee.percentage);
            if (isNaN(percentage) || percentage < 0) {
                errors[`percentage-${index}`] = 'Percentage must be a positive number';
            }
            if (percentage > 100) {
                errors[`percentage-${index}`] = 'Percentage cannot exceed 100%';
            }

            // Validate proof requirement for minors
            const age = calculateAge(nominee.dob);
            if (age < 18) {
                if (!nominee.proofId?.trim()) {
                    errors[`proofId-${index}`] = 'Proof ID is required for minors';
                }
                if (!proofFiles[index]) {
                    errors[`proofFile-${index}`] = 'Proof document is required for minors';
                }
            }
        });

        // Validate total percentage is exactly 100%
        const totalPercentage = nominees.reduce((sum, nominee) =>
            sum + (parseFloat(nominee.percentage) || 0), 0);

        if (Math.abs(totalPercentage - 100) > 0.01) {
            errors.total = `Total percentage must be 100% (currently ${totalPercentage.toFixed(2)}%)`;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (index, field, value) => {
        const updatedNominees = [...nominees];

        if (field === 'percentage') {
            // Handle percentage changes
            const newPercentage = parseFloat(value) || 0;

            // Only update if valid input
            if (newPercentage >= 0 && newPercentage <= 100) {
                updatedNominees[index].percentage = newPercentage;

                // Auto-adjust other nominee's percentage if we have exactly 2
                if (updatedNominees.length === 2) {
                    const otherIndex = index === 0 ? 1 : 0;
                    updatedNominees[otherIndex].percentage = Math.max(0, Math.min(100, 100 - newPercentage));
                }
            }
        } else {
            updatedNominees[index][field] = value;
        }

        setNominees(updatedNominees);

        if (formErrors[`${field}-${index}`]) {
            const newErrors = { ...formErrors };
            delete newErrors[`${field}-${index}`];
            delete newErrors.total;
            setFormErrors(newErrors);
        }
    };

    const handleFileUpload = (index, file) => {
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Proof file size must be less than 2MB');
            return;
        }

        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only PDF, JPEG, and PNG files are allowed');
            return;
        }

        // Store file in state
        const newProofFiles = { ...proofFiles };
        newProofFiles[index] = file;
        setProofFiles(newProofFiles);

        // Clear any related error
        if (formErrors[`proofFile-${index}`]) {
            const newErrors = { ...formErrors };
            delete newErrors[`proofFile-${index}`];
            setFormErrors(newErrors);
        }
    };

    const handleAddNominee = () => {
        if (nominees.length >= 2) {
            toast.error('You can only add up to 2 nominees.');
            return;
        }

        // When adding second nominee, split the percentage 50-50
        const updatedNominees = [...nominees];

        // Update existing nominee to 50%
        updatedNominees[0].percentage = 50;

        // Add new nominee with 50%
        updatedNominees.push({ name: '', relation: '', dob: '', percentage: 50 });

        setNominees(updatedNominees);
    };

    const handleDeleteNominee = async (nominee, index) => {
        // If we're deleting and only have one nominee, just clear the form
        if (nominees.length === 1) {
            setNominees([{ name: '', relation: '', dob: '', percentage: 100 }]);
            return;
        }

        try {
            // Delete from database if it exists
            if (nominee.unique_id) {
                await dispatch(deleteNominee({
                    customerId,
                    nomineeId: nominee.unique_id
                })).unwrap();
            }

            // Remove from state
            const updatedNominees = nominees.filter((_, i) => i !== index);

            // If now only one nominee, set percentage to 100%
            if (updatedNominees.length === 1) {
                updatedNominees[0].percentage = 100;
            }

            setNominees(updatedNominees);
            toast.success('Nominee removed');
        } catch (error) {
            toast.error('Failed to delete nominee');
        }
    };

    const handleSaveAll = async () => {
        if (!validateForm()) {
            toast.error('Please correct the errors before saving');
            return;
        }

        setIsSubmitting(true);

        try {
            // Process each nominee (add new or update existing)
            for (let i = 0; i < nominees.length; i++) {
                const nominee = nominees[i];
                const nomineeData = { ...nominee };

                // Include proof ID if available
                if (nominee.proofId) {
                    nomineeData.proofId = nominee.proofId;
                }

                // Handle file upload if we have one
                if (proofFiles[i]) {
                    const formData = new FormData();
                    formData.append('proofFile', proofFiles[i]);
                    formData.append('nomineeId', nominee.unique_id || 'new');
                    formData.append('customerId', customerId);

                    // You would need to implement a file upload API endpoint
                    // This is just a placeholder for the logic
                    try {
                        const token = localStorage.getItem('authToken');
                        const response = await fetch(`${API_URL}/customers/nominee-proof-upload`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                            body: formData
                        });

                        if (!response.ok) {
                            throw new Error('Failed to upload proof document');
                        }

                        const data = await response.json();
                        nomineeData.proofFileUrl = data.fileUrl;
                    } catch (error) {
                        console.error('Error uploading proof file:', error);
                        throw new Error('Failed to upload proof document');
                    }
                }

                if (nominee.unique_id) {
                    // Update existing nominee
                    await dispatch(updateNominee({
                        customerId,
                        nomineeData
                    })).unwrap();
                } else {
                    // Add new nominee
                    await dispatch(addNominee({
                        customerId,
                        nomineeData
                    })).unwrap();
                }
            }

            // Format nominees for display in the main form
            const formattedNominees = nominees.map((nominee, index) => ({
                unique_id: nominee.unique_id,
                name: nominee.name,
                relation: nominee.relation,
                dob: nominee.dob,
                ownership_percentage: nominee.percentage,
                proofId: nominee.proofId,
                proofFileUrl: nominee.proofFileUrl
            }));

            // Update parent component state
            if (onSave) {
                onSave(formattedNominees);
            }

            toast.success('Nominees saved successfully!');
            onClose(); // Close the modal after successful save
        } catch (error) {
            console.error('Error saving nominees:', error);
            toast.error('Failed to save nominees');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="nominee-modal-content">
                <div className="nominee-modal-header">
                    <h3>Nominee Details</h3>
                    <button className="modal-close-button" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {formErrors.total && (
                    <div className="percentage-error-banner">
                        {formErrors.total}
                    </div>
                )}

                <div className="nominee-form-container">
                    {nominees.map((nominee, index) => {
                        const isMinor = calculateAge(nominee.dob) < 18;
                        return (
                            <div key={index} className="nominee-form-section">
                                <div className="nominee-form-header">
                                    <h4>Nominee {index + 1}</h4>
                                    {nominees.length > 1 && (
                                        <button
                                            className="delete-nominee-button"
                                            onClick={() => handleDeleteNominee(nominee, index)}
                                            title="Remove nominee"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    )}
                                </div>

                                <div className="nominee-fields-grid">
                                    <div className="form-group">
                                        <label>Name<span className="required">*</span></label>
                                        <input
                                            type="text"
                                            value={nominee.name || ''}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            placeholder="Enter nominee name"
                                            className={formErrors[`name-${index}`] ? 'input-error' : ''}
                                        />
                                        {formErrors[`name-${index}`] && (
                                            <span className="error-message">{formErrors[`name-${index}`]}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Relation<span className="required">*</span></label>
                                        <input
                                            type="text"
                                            value={nominee.relation || ''}
                                            onChange={(e) => handleInputChange(index, 'relation', e.target.value)}
                                            placeholder="Enter relation"
                                            className={formErrors[`relation-${index}`] ? 'input-error' : ''}
                                        />
                                        {formErrors[`relation-${index}`] && (
                                            <span className="error-message">{formErrors[`relation-${index}`]}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Date of Birth<span className="required">*</span></label>
                                        <input
                                            type="date"
                                            value={nominee.dob || ''}
                                            onChange={(e) => handleInputChange(index, 'dob', e.target.value)}
                                            max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                            className={formErrors[`dob-${index}`] ? 'input-error' : ''}
                                        />
                                        {formErrors[`dob-${index}`] && (
                                            <span className="error-message">{formErrors[`dob-${index}`]}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Percentage<span className="required">*</span></label>
                                        <div className="percentage-input-container">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={nominee.percentage || 0}
                                                onChange={(e) => handleInputChange(index, 'percentage', e.target.value)}
                                                className={formErrors[`percentage-${index}`] ? 'input-error' : ''}
                                            />
                                            <span className="percentage-symbol">%</span>
                                        </div>
                                        {formErrors[`percentage-${index}`] && (
                                            <span className="error-message">{formErrors[`percentage-${index}`]}</span>
                                        )}
                                        {nominees.length === 2 && (
                                            <small className="helper-text">Adjusting this will update the other nominee's percentage</small>
                                        )}
                                    </div>

                                    {/* Modified proof ID field */}
                                    <div className="form-group">
                                        <label>Proof ID {isMinor && <span className="required">*</span>}</label>
                                        <input
                                            type="text"
                                            value={nominee.proofId || ''}
                                            onChange={(e) => handleInputChange(index, 'proofId', e.target.value)}
                                            placeholder="Enter proof ID (Aadhar, etc.)"
                                            className={formErrors[`proofId-${index}`] ? 'input-error' : ''}
                                        />
                                        {formErrors[`proofId-${index}`] ? (
                                            <span className="error-message">{formErrors[`proofId-${index}`]}</span>
                                        ) : (
                                            isMinor && <small className="helper-text important">Required for minors under 18</small>
                                        )}
                                    </div>

                                    {/* Modified proof file upload */}
                                    <div className="form-group">
                                        <label>Proof Document {isMinor && <span className="required">*</span>}</label>
                                        <div className="file-upload-container">
                                            <label className={`file-upload-label ${formErrors[`proofFile-${index}`] ? 'input-error' : ''}`}>
                                                {proofFiles[index] ? proofFiles[index].name : 'Choose file'}
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileUpload(index, e.target.files[0])}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            {proofFiles[index] && (
                                                <button
                                                    className="remove-file-button"
                                                    onClick={() => {
                                                        const newProofFiles = { ...proofFiles };
                                                        delete newProofFiles[index];
                                                        setProofFiles(newProofFiles);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            )}
                                        </div>
                                        {formErrors[`proofFile-${index}`] ? (
                                            <span className="error-message">{formErrors[`proofFile-${index}`]}</span>
                                        ) : (
                                            isMinor && <small className="helper-text important">Required for minors under 18</small>
                                        )}
                                        <small className="helper-text">Accepts PDF, JPG, PNG (Max 2MB)</small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="nominee-modal-footer">
                    <div className="button-group">
                        <button
                            className="add-nominee-button"
                            onClick={handleAddNominee}
                            disabled={nominees.length >= 2 || isSubmitting}
                        >
                            Add Another Nominee
                        </button>

                        <button
                            className="save-nominees-button"
                            onClick={handleSaveAll}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Nominees'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNominee;