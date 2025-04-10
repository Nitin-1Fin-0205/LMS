import React, { useState, useEffect, useRef } from 'react';
import CustomerInfo from './CustomerInfo';
import LockerInfo from './LockerInfo';
import RentDetails from './RentDetails';
import Attachments from './Attachments';
import '../styles/AddCustomer.css';

const AddCustomer = () => {
    const [activeTab, setActiveTab] = useState(0);
    const indicatorRef = useRef(null);

    useEffect(() => {
        const activeButton = document.querySelector(`.tabs button:nth-child(${activeTab + 1})`);
        const indicator = indicatorRef.current;

        if (activeButton && indicator) {
            const { offsetLeft, offsetWidth } = activeButton;
            indicator.style.width = `${offsetWidth}px`;
            indicator.style.transform = `translateX(${offsetLeft}px)`;
        }
    }, [activeTab]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <div className="form-sections animated-tab">
                        <CustomerInfo />
                        <LockerInfo />
                        <RentDetails />
                    </div>
                );
            case 1:
                return (
                    <div className="form-sections animated-tab">
                        <CustomerInfo />
                        <LockerInfo />
                    </div>
                );
            case 2:
                return (
                    <div className="form-sections animated-tab">
                        <CustomerInfo />
                        <LockerInfo />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="add-customer-container">
            <h6 className="add-customer-title">Add Customer</h6>
            <div className="tabs-container">
                <div className="tabs">
                    {['Add Primary Holder', 'Add Second Holder', 'Add Third Holder'].map((tab, index) => (
                        <button
                            key={index}
                            className={activeTab === index ? 'active' : ''}
                            onClick={() => setActiveTab(index)}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="tab-indicator" ref={indicatorRef}></div>
                </div>
            </div>
            <div className="tab-content-container">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AddCustomer;