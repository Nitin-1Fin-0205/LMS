import { faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons'; // Add faTimes import
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { updateNominees, fetchNominees, deleteNominee, updateNominee, addNominee } from '../store/slices/lockerSlice';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/AddNominee.css';

const AddNominee = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const existingNominees = useSelector(state => state.locker.lockerDetails.nominees || []);
    const customerId = useSelector(state => state.customer.form.primaryHolder.customerInfo.customerId);
    const [nominees, setNominees] = useState([]);

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
        const initialNominees = existingNominees.length > 0
            ? existingNominees.map(nominee => ({
                unique_id: nominee.unique_id,
                name: nominee.name,
                relation: nominee.relation,
                dob: nominee.dob,
                percentage: nominee.percentage || 100 // Default to 100 for single nominee
            }))
            : [{ name: '', relation: '', dob: '', percentage: 100 }]; // Default first nominee to 100%

        setNominees(initialNominees);
    }, [existingNominees]);

    const validateNomineesPercentage = (updatedNominees) => {
        const totalPercentage = updatedNominees.reduce((sum, nominee) =>
            sum + Number(nominee.percentage || 0), 0);
        return totalPercentage <= 100;
    };

    const handleInputChange = (index, field, value) => {
        const updatedNominees = nominees.map((nominee, i) => {
            if (i === index) {
                const updatedNominee = { ...nominee, [field]: value };
                if (field === 'percentage' && nominees.length === 2) {
                    // For two nominees, automatically update the other nominee's percentage
                    const otherIndex = index === 0 ? 1 : 0;
                    const newPercentage = Number(value) || 0;
                    if (newPercentage <= 100) {
                        // Update other nominee's percentage automatically
                        nominees[otherIndex].percentage = 100 - newPercentage;
                    }
                }
                return updatedNominee;
            }
            return nominee;
        });
        setNominees(updatedNominees);
    };

    const handleAddNominee = () => {
        const missingFields = [];
        nominees.forEach((nominee, index) => {
            if (!nominee.name.trim()) missingFields.push(`Name for Nominee ${index + 1}`);
            if (!nominee.relation.trim()) missingFields.push(`Relation for Nominee ${index + 1}`);
            if (!nominee.dob) missingFields.push(`Date of Birth for Nominee ${index + 1}`);
            if (nominee.percentage === undefined || nominee.percentage === null) missingFields.push(`Percentage for Nominee ${index + 1}`);
        });

        if (missingFields.length > 0) {
            toast.error(`Please fill all required fields: ${missingFields.join(', ')}`);
            return;
        }
        if (nominees.length < 2) {
            // When adding second nominee, split percentage 50-50
            const updatedNominees = [...nominees];
            updatedNominees[0].percentage = 50;
            setNominees([
                ...updatedNominees,
                { name: '', relation: '', dob: '', percentage: 50 }
            ]);
        } else {
            toast.error('You can only add up to 2 nominees.');
        }
    };

    const handleSaveNominee = async (nominee, index) => {
        if (!nominee.name.trim() || !nominee.relation.trim() || !nominee.dob || nominee.percentage === undefined) {
            toast.error('Please fill all required fields for the nominee');
            return;
        }

        try {
            if (nominee.unique_id) {
                await dispatch(updateNominee({
                    customerId,
                    nomineeId: nominee.unique_id,
                    nomineeData: nominee
                })).unwrap();
                toast.success('Nominee updated successfully!');
            } else {
                await dispatch(addNominee({
                    customerId,
                    nomineeData: nominee
                })).unwrap();
                toast.success('Nominee added successfully!');
            }
        } catch (error) {
            toast.error('Failed to save nominee');
        }
    };

    const handleDeleteNominee = async (nominee, index) => {
        try {
            if (nominee.unique_id) {
                await dispatch(deleteNominee({
                    customerId,
                    nomineeId: nominee.unique_id
                })).unwrap();
                toast.success('Nominee deleted successfully');
            }
            const updatedNominees = nominees.filter((_, i) => i !== index);
            setNominees(updatedNominees);
        } catch (error) {
            toast.error('Failed to delete nominee');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="nominee-modal-content">
                <div className="nominee-modal-header">
                    <h3>Add Nominee Details</h3>
                    <button className="modal-close-button" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="nominee-form-container">
                    {nominees.map((nominee, index) => (
                        <div key={index} className="nominee-form-section">
                            <div className="nominee-form-header">
                                <h4>Nominee {index + 1}</h4>
                            </div>

                            <div className="nominee-fields-grid">
                                <div className="form-group">
                                    <label>Name<span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={nominee.name}
                                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                        placeholder="Enter nominee name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Relation<span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={nominee.relation}
                                        onChange={(e) => handleInputChange(index, 'relation', e.target.value)}
                                        placeholder="Enter relation"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date of Birth<span className="required">*</span></label>
                                    <input
                                        type="date"
                                        value={nominee.dob}
                                        onChange={(e) => handleInputChange(index, 'dob', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Percentage<span className="required">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={nominee.percentage || 0}
                                        onChange={(e) => handleInputChange(index, 'percentage', e.target.value)}
                                        placeholder="Enter percentage"
                                    />
                                </div>
                            </div>

                            <div className="nominee-actions">
                                <button
                                    className="save-nominee-button"
                                    onClick={() => handleSaveNominee(nominee, index)}
                                >
                                    {nominee.unique_id ? 'Update' : 'Save'} Nominee
                                </button>
                                <button
                                    className="delete-nominee-button"
                                    onClick={() => handleDeleteNominee(nominee, index)}
                                    title="Delete nominee"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="nominee-modal-footer">
                    <button
                        className="add-nominee-button"
                        onClick={handleAddNominee}
                        disabled={nominees.length >= 2}
                    >
                        Add Another Nominee
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddNominee;