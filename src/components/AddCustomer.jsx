import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import LockerInfo from './LockerInfo';
import RentDetails from './RentDetails';
import Attachments from './Attachments';
import '../styles/AddCustomer.css';
import { formDataStructure } from '../models/customerModel';

const AddCustomer = () => {
    const [activeTab, setActiveTab] = useState(0);
    const indicatorRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(formDataStructure);

    const updateFormData = (section, holderType, data) => {
        setFormData(prev => ({
            ...prev,
            [holderType]: {
                ...prev[holderType],
                [section]: data
            }
        }));

        console.log('Updated formData:', {
            ...formData,
            [holderType]: {
                ...formData[holderType],
                [section]: data
            }
        });
        console.log('Updated section:', section);

    };

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
        const holderType = ['primaryHolder', 'secondHolder', 'thirdHolder'][activeTab];

        switch (activeTab) {
            case 0:
                return (
                    <div className="form-sections animated-tab">
                        <CustomerInfo
                            onUpdate={(data) => updateFormData('customerInfo', holderType, data)}
                            initialData={formData[holderType]?.customerInfo}
                        />
                        <LockerInfo
                            onUpdate={(data) => updateFormData('lockerInfo', holderType, data)}
                            initialData={formData[holderType]?.lockerInfo}
                        />
                        <RentDetails
                            onUpdate={(data) => updateFormData('rentDetails', holderType, data)}
                            initialData={formData[holderType]?.rentDetails}
                        />
                    </div>
                );
            case 1:
                return (
                    <div className="form-sections animated-tab">
                        <CustomerInfo
                            onUpdate={(data) => updateFormData('customerInfo', holderType, data)}
                            initialData={formData[holderType]?.customerInfo}
                        />
                        <LockerInfo
                            onUpdate={(data) => updateFormData('lockerInfo', holderType, data)}
                            initialData={formData[holderType]?.lockerInfo}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="form-sections animated-tab">
                        <CustomerInfo
                            onUpdate={(data) => updateFormData('customerInfo', holderType, data)}
                            initialData={formData[holderType]?.customerInfo}
                        />
                        <LockerInfo
                            onUpdate={(data) => updateFormData('lockerInfo', holderType, data)}
                            initialData={formData[holderType]?.lockerInfo}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const apiUrl = "https://webhook.site/61874c8a-d344-4317-81d1-bfd4ffd6d5a9";

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const response = await axios.post(`${apiUrl}`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                toast.success('Customer added successfully!');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.response?.data?.message || 'Failed to add customer');
        } finally {
            setIsSubmitting(false);
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
            <div className="form-submit-container">
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding Customer...' : 'Add Customer'}
                </button>
            </div>
        </div>
    );
};

export default AddCustomer;