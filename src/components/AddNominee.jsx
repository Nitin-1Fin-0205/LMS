import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddNominee = ({ isOpen, onClose, onSave }) => {
    const [nominees, setNominees] = useState([
        { name: '', relation: '', dob: '' },
    ]);
    const [shakeFields, setShakeFields] = useState([]); // Track which fields need to shake

    const handleInputChange = (index, field, value) => {
        const updatedNominees = [...nominees];
        updatedNominees[index][field] = value;
        setNominees(updatedNominees);

        // Remove shake effect when the field is corrected
        setShakeFields((prev) =>
            prev.filter((item) => !(item.index === index && item.field === field))
        );
    };

    const handleAddNominee = () => {
        if (nominees.length < 2) {
            setNominees([...nominees, { name: '', relation: '', dob: '' }]);
            toast.success('Nominee added successfully!');
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

        // Validate nominee fields and track missing fields
        nominees.forEach((nominee, index) => {
            if (!nominee.name.trim()) missingFields.push({ index, field: 'name' });
            if (!nominee.relation.trim()) missingFields.push({ index, field: 'relation' });
            if (!nominee.dob.trim()) missingFields.push({ index, field: 'dob' });
        });

        if (missingFields.length > 0) {
            setShakeFields(missingFields); // Trigger shake effect for missing fields
            toast.error('All nominee fields are required!');
            return;
        }

        onSave(nominees); // Pass the nominees data to the parent component
        toast.success('Nominees saved successfully!');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Nominee Details</h3>
                <div className="nominee-form">
                    {nominees.map((nominee, index) => (
                        <div key={index} className="nominee-item">
                            <div
                                className={`form-group ${shakeFields.some(
                                    (item) => item.index === index && item.field === 'name'
                                )
                                    ? 'shake'
                                    : ''
                                    }`}
                            >
                                <label>
                                    Nominee Name {index + 1} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={nominee.name}
                                    onChange={(e) =>
                                        handleInputChange(index, 'name', e.target.value)
                                    }
                                    placeholder="Enter nominee name"
                                />
                            </div>
                            <div
                                className={`form-group ${shakeFields.some(
                                    (item) => item.index === index && item.field === 'relation'
                                )
                                    ? 'shake'
                                    : ''
                                    }`}
                            >
                                <label>
                                    Relation with Nominee {index + 1}{' '}
                                    <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={nominee.relation}
                                    onChange={(e) =>
                                        handleInputChange(index, 'relation', e.target.value)
                                    }
                                    placeholder="Enter relation"
                                />
                            </div>
                            <div
                                className={`form-group ${shakeFields.some(
                                    (item) => item.index === index && item.field === 'dob'
                                )
                                    ? 'shake'
                                    : ''
                                    }`}
                            >
                                <label>
                                    DOB {index + 1} <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={nominee.dob}
                                    onChange={(e) =>
                                        handleInputChange(index, 'dob', e.target.value)
                                    }
                                />
                            </div>
                            <button
                                className="delete-button"
                                onClick={() => handleDeleteNominee(index)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
                <div className="form-actions">
                    <button
                        className="add-button"
                        onClick={handleAddNominee}
                    >
                        Add Nominee
                    </button>
                    <button className="save-button" onClick={handleSave}>
                        Save
                    </button>
                    <button className="close-button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
};

export default AddNominee;