import React from 'react';
import '../styles/AddCustomer.css';

const Tabs = ({ tabs, activeTab, onTabClick }) => {
    return (
        <div className="tabs">
            {tabs.map((tab, index) => (
                <button
                    key={index}
                    className={`tab ${activeTab === index ? 'active' : ''}`}
                    onClick={() => onTabClick(index)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default Tabs;