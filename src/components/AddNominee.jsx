import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { updateNominees } from '../store/slices/lockerSlice';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/AddNominee.css';

const AddNominee = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const existingNominees = useSelector(state => state.locker.lockerDetails.nominees || []);
    const [nominees, setNominees] = useState([]);

    useEffect(() => {
        // Create new objects for each nominee to avoid read-only issues
        const initialNominees = existingNominees.length > 0
            ? existingNominees.map(nominee => ({
                name: nominee.name || '',
                relation: nominee.relation || '',
                dob: nominee.dob || ''
            }))
            : [{ name: '', relation: '', dob: '' }];

        setNominees(initialNominees);
    }, [existingNominees]);

    const handleInputChange = (index, field, value) => {
        const updatedNominees = nominees.map((nominee, i) =>
            i === index ? { ...nominee, [field]: value } : nominee
        );
        setNominees(updatedNominees);
    };

    const handleAddNominee = () => {
        if (nominees.length < 2) {
            setNominees([...nominees, { name: '', relation: '', dob: '' }]);
        } else {
            toast.error('You can only add up to 2 nominees.');
        }
    };

    const handleDeleteNominee = (index) => {
        const updatedNominees = nominees.filter((_, i) => i !== index);
        setNominees(updatedNominees);
        toast.info('Nominee deleted successfully.');
    };

    const handleSave = () => {
        const missingFields = [];
        nominees.forEach((nominee, index) => {
            if (!nominee.name.trim()) missingFields.push(`Name for Nominee ${index + 1}`);
            if (!nominee.relation.trim()) missingFields.push(`Relation for Nominee ${index + 1}`);
            if (!nominee.dob) missingFields.push(`Date of Birth for Nominee ${index + 1}`);
        });

        if (missingFields.length > 0) {
            toast.error(`Please fill all required fields: ${missingFields.join(', ')}`);
            return;
        }

        dispatch(updateNominees(nominees));
        toast.success('Nominees saved successfully!');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="nominee-modal-content">
                <div className="nominee-modal-header">
                    <h3>Add Nominee Details</h3>
                </div>

                <div className="nominee-form-container">
                    {nominees.map((nominee, index) => (
                        <div key={index} className="nominee-form-section">
                            <div className="nominee-form-header">
                                <h4>Nominee {index + 1}</h4>
                                <button
                                    className="delete-nominee-button"
                                    onClick={() => handleDeleteNominee(index)}
                                    title="Delete nominee"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
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
                    <div className="modal-actions">
                        <button className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="save-button" onClick={handleSave}>
                            Save Nominees
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNominee;