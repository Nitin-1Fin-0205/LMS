import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RentDetails = ({ onUpdate, initialData }) => {
    const [rentData, setRentData] = useState(initialData || {
        lockerNo: "",
        deposit: "",
        rent: "",
        admissionFees: "",
        total: "",
        lockerKeyNo: "",
        contactNumber: "",
        moveInDate: "",
        anticipatedMoveOutDate: ""
    });

    const handleInputChange = (field, value) => {
        const updatedData = {
            ...rentData,
            [field]: value
        };
        setRentData(updatedData);
        onUpdate(updatedData);
    };

    const handleSaveLockerDetails = () => {
        console.log('Locker details saved!');
        toast.success('Locker details saved successfully!');
    };

    return (
        <div className="form-section">
            <h2>Rent Details</h2>
            <div className="form-group">
                <label>Locker No</label>
                <input type="text" placeholder="Enter locker no" value={rentData.lockerNo} onChange={(e) => handleInputChange('lockerNo', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Deposit</label>
                <input type="text" placeholder="Enter deposit" value={rentData.deposit} onChange={(e) => handleInputChange('deposit', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Rent</label>
                <input type="text" placeholder="Enter rent" value={rentData.rent} onChange={(e) => handleInputChange('rent', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Admission Fees</label>
                <input type="text" placeholder="Enter admission fees" value={rentData.admissionFees} onChange={(e) => handleInputChange('admissionFees', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Total</label>
                <input type="text" placeholder="Enter total" value={rentData.total} onChange={(e) => handleInputChange('total', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Locker Key No</label>
                <input type="text" placeholder="Enter locker key no" value={rentData.lockerKeyNo} onChange={(e) => handleInputChange('lockerKeyNo', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Contact Number</label>
                <input type="text" placeholder="Enter contact no" value={rentData.contactNumber} onChange={(e) => handleInputChange('contactNumber', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Move In Date</label>
                <input type="date" placeholder="dd-mm-yyyy" value={rentData.moveInDate} onChange={(e) => handleInputChange('moveInDate', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Anticipated Move Out Date</label>
                <input type="date" placeholder="dd-mm-yyyy" value={rentData.anticipatedMoveOutDate} onChange={(e) => handleInputChange('anticipatedMoveOutDate', e.target.value)} />
            </div>
            <div className="form-actions">
                <button className="save-button" onClick={handleSaveLockerDetails}>
                    Save Locker Details
                </button>
                <button className="view-button">View Detailed Rent</button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default RentDetails;
