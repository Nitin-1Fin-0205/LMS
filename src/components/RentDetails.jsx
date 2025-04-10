import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RentDetails = () => {
    const handleSaveLockerDetails = () => {
        console.log('Locker details saved!');
        toast.success('Locker details saved successfully!');
    };

    return (
        <div className="form-section">
            <h2>Rent Details</h2>
            <div className="form-group">
                <label>Locker No</label>
                <input type="text" placeholder="Enter locker no" />
            </div>
            <div className="form-group">
                <label>Deposit</label>
                <input type="text" placeholder="Enter deposit" />
            </div>
            <div className="form-group">
                <label>Rent</label>
                <input type="text" placeholder="Enter rent" />
            </div>
            <div className="form-group">
                <label>Admission Fees</label>
                <input type="text" placeholder="Enter admission fees" />
            </div>
            <div className="form-group">
                <label>Total</label>
                <input type="text" placeholder="Enter total" />
            </div>
            <div className="form-group">
                <label>Locker Key No</label>
                <input type="text" placeholder="Enter locker key no" />
            </div>
            <div className="form-group">
                <label>Contact Number</label>
                <input type="text" placeholder="Enter contact no" />
            </div>
            <div className="form-group">
                <label>Move In Date</label>
                <input type="date" placeholder="dd-mm-yyyy" />
            </div>
            <div className="form-group">
                <label>Anticipated Move Out Date</label>
                <input type="date" placeholder="dd-mm-yyyy" />
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
