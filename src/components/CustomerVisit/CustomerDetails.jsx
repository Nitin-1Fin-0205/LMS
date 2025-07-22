import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faCheck, faLock, faInfoCircle, faIdCard,
    faPhone, faEnvelope, faMapMarkerAlt, faKey, faHashtag,
    faCity
} from '@fortawesome/free-solid-svg-icons';

const CustomerDetails = ({ customerData, onAccessVault, loading, selectedLocker }) => {
    if (!customerData) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center max-w-md">
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faUser} className="text-xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Customer Authenticated</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Please use the biometric scanner to authenticate and view customer details.
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center justify-center text-blue-700">
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-2 w-4 h-4" />
                            <span className="text-sm font-medium">Secure authentication required</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Success Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-3">
                    <FontAwesomeIcon icon={faCheck} className="text-green-600 w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Authentication Successful</h2>
                <p className="text-green-600 font-medium text-sm">Customer verified and authorized for vault access</p>
            </div>

            {/* Customer Profile */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200 shadow-md shadow-blue-100/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        {customerData.photo ? (
                            <img
                                src={customerData.photo}
                                alt="Customer"
                                className="w-40 h-40 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className="w-14 h-14 rounded-lg bg-gray-300 flex items-center justify-center border border-gray-200" style={{ display: customerData.photo ? 'none' : 'flex' }}>
                            <FontAwesomeIcon icon={faUser} className="text-lg text-gray-500" />
                        </div>
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {customerData.name || `${customerData.firstName} ${customerData.lastName}`}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${customerData.customerType === 'PRIMARY'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-300 text-gray-700'
                                }`}>
                                {customerData.customerType}
                            </span>
                            {selectedLocker && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${selectedLocker.size === 'Small'
                                    ? 'bg-green-100 text-green-700'
                                    : selectedLocker.size === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {selectedLocker.size} Locker
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium text-gray-400">Customer ID:</span> {customerData.customerId}</p>
                            <p><span className="font-medium text-gray-400">PAN:</span> {customerData.panNo}</p>
                            <p><span className="font-medium text-gray-400">DOB:</span>{customerData.dob ? new Date(customerData.dob).toLocaleDateString('en-GB') : 'N/A'}</p>
                            {/* Access Button */}
                            <div className="mt-4">
                                <button
                                    onClick={onAccessVault}
                                    disabled={loading}
                                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                                >
                                    <FontAwesomeIcon icon={faLock} className="mr-2 w-4 h-4" />
                                    {loading ? 'Processing...' : 'Access Vault'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-blue-200 shadow-xl shadow-blue-100/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/60 hover:-translate-y-1">
                <div className="space-y-6">
                    {/* Locker Information */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                                <FontAwesomeIcon icon={faLock} className="text-white w-3 h-3" />
                            </div>
                            <h4 className="text-base font-semibold text-gray-900">Locker Details</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center py-2 border-b border-green-200 bg-green-50 px-3 rounded">
                                <FontAwesomeIcon icon={faHashtag} className="text-green-600 w-3 h-3 mr-3" />
                                <span className="text-sm font-medium text-green-600 flex-1">Number</span>
                                <span className="font-bold text-green-700 text-base px-2 py-1 bg-green-100 rounded">{customerData.lockerNo}</span>
                            </div>
                            <div className="flex items-center py-2 border-b border-green-200 bg-green-50 px-3 rounded">
                                <FontAwesomeIcon icon={faKey} className="text-green-600 w-3 h-3 mr-3" />
                                <span className="text-sm font-medium text-green-600 flex-1">Key</span>
                                <span className="font-bold text-green-700 text-base px-2 py-1 bg-green-100 rounded">{customerData.lockerKey}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact and Address Information Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                    <FontAwesomeIcon icon={faPhone} className="text-white w-3 h-3" />
                                </div>
                                <h4 className="text-base font-semibold text-gray-900">Contact Details</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center py-2 border-b border-gray-100">
                                    <FontAwesomeIcon icon={faPhone} className="text-blue-600 w-3 h-3 mr-3" />
                                    <span className="text-sm font-medium text-gray-600 flex-1">Mobile</span>
                                    <span className="font-semibold text-gray-900 text-sm">{customerData.mobile_number || customerData.mobileNo}</span>
                                </div>
                                <div className="flex items-center py-2 border-b border-gray-100">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 w-3 h-3 mr-3" />
                                    <span className="text-sm font-medium text-gray-600 flex-1">Email</span>
                                    <span className="font-semibold text-gray-900 text-sm break-all">{customerData.email}</span>
                                </div>
                                <div className="flex items-center py-2">
                                    <FontAwesomeIcon icon={faIdCard} className="text-blue-600 w-3 h-3 mr-3" />
                                    <span className="text-sm font-medium text-gray-600 flex-1">Aadhar</span>
                                    <span className="font-semibold text-gray-900 text-sm">{customerData.aadhar}</span>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div>
                            <div className="flex items-center mb-4">
                                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white w-3 h-3" />
                                </div>
                                <h4 className="text-base font-semibold text-gray-900">Address</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center py-2 border-b border-gray-100">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 w-3 h-3 mr-3" />
                                    <span className="text-sm font-medium text-gray-600 flex-1">Address</span>
                                    <span className="font-semibold text-gray-900 text-sm">{customerData.address || '-'}</span>
                                </div>
                                <div className="flex items-center py-2 border-b border-gray-100">
                                    <FontAwesomeIcon icon={faCity} className="text-blue-600 w-3 h-3 mr-3" />
                                    <span className="text-sm font-medium text-gray-600 flex-1">City</span>
                                    <span className="font-semibold text-gray-900 text-sm">{customerData.city || customerData.permanent_city}</span>
                                </div>
                                <div className="flex items-center py-2">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 w-3 h-3 mr-3" />
                                    <span className="text-sm font-medium text-gray-600 flex-1">State</span>
                                    <span className="font-semibold text-gray-900 text-sm">{customerData.state || customerData.permanent_state}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default CustomerDetails;
