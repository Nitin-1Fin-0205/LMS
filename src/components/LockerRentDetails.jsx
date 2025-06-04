import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import { updateLockerDetails, updateRentDetails, fetchNominees } from '../store/slices/lockerSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faKey } from '@fortawesome/free-solid-svg-icons';
import AssignLocker from './AssignLocker';
import AddNominee from './AddNominee';
import axios from 'axios';

const LockerRentDetails = ({ centers, isLoadingCenters, holderType }) => {
    const dispatch = useDispatch();
    const { lockerDetails } = useSelector(state => state.locker);
    const [lockerPlans, setLockerPlans] = useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);

    const primaryHolder = useSelector(state => state.customer.form.primaryHolder);

    const handleInputChange = (field, value) => {
        dispatch(updateLockerDetails({ [field]: value }));
    };

    const fetchPlansForLocker = async (lockerId) => {
        console.log("Fetching plans for locker ID:", lockerId);
        try {
            setIsLoadingPlans(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/lockers/lockers/rent?lockerId=${lockerId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                setLockerPlans(response.data.plans || []);
                // toast.success('Plans fetched successfully');
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to fetch plans');
        } finally {
            setIsLoadingPlans(false);
        }
    };

    useEffect(() => {
        if (lockerDetails?.lockerId) {
            fetchPlansForLocker(lockerDetails.lockerId);
        }
    }, [lockerDetails.lockerId]);

    useEffect(() => {
        const fetchPlanAndUpdateRent = async () => {
            if (lockerDetails?.selectedPlan && lockerPlans.length > 0) {
                const selectedPlan = lockerPlans.find(plan =>
                    Number(plan.planId) === Number(lockerDetails.selectedPlan)
                );
                if (selectedPlan) {
                    dispatch(updateLockerDetails({
                        rentDetails: {
                            deposit: selectedPlan.deposit,
                            rent: selectedPlan.baseRent,
                            admissionFees: selectedPlan.admissionFees,
                            total: selectedPlan.grandTotalAmount
                        }
                    }));
                }
            }
        };

        fetchPlanAndUpdateRent();
    }, [lockerDetails.selectedPlan, lockerPlans, dispatch]);

    // Fetch nominees on component mount and when primary holder changes
    useEffect(() => {
        const fetchNomineesOnLoad = async () => {
            const customerId = primaryHolder?.customerInfo?.customerId;
            if (customerId) {
                try {
                    await dispatch(fetchNominees(customerId)).unwrap();
                } catch (error) {
                    console.error('Error fetching nominees:', error);
                }
            }
        };

        fetchNomineesOnLoad();
    }, [dispatch, primaryHolder?.customerInfo?.customerId]);

    const handleLockerAssign = async (locker) => {
        dispatch(updateLockerDetails({
            assignedLocker: locker?.locker_number || "",
            lockerId: locker?.locker_id || null,
            lockerSize: locker?.size || "",
            lockerKey: locker?.locker_key || "",
            isModalOpen: false
        }));
        console.log("Locker assigned:", locker);

        // if (locker?.locker_id) {
        //     try {
        //         await dispatch(fetchLockerDetails(locker.locker_id)).unwrap();
        //     } catch (error) {
        //         console.error('Error fetching locker details:', error);
        //     }
        // }
    };

    const handlePlanSelect = (planId) => {
        const selectedPlan = lockerPlans.find(plan => plan.planId === planId);
        if (selectedPlan) {
            console.log("Selected plan:", selectedPlan);
            // Update lockerDetails with plan information
            dispatch(updateLockerDetails({
                selectedPlan: planId,
                rentDetails: {
                    deposit: selectedPlan.deposit,
                    rent: selectedPlan.baseRent,
                    admissionFees: selectedPlan.admissionFees,
                    total: selectedPlan.grandTotalAmount
                }
            }));
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center text-blue-600 mb-2">
                    {/* <FontAwesomeIcon icon={faKey} className="w-5 h-5 mr-2" /> */}
                    <h1 className="text-xl font-semibold">Locker & Rent Details</h1>
                </div>
                {/* <p className="text-gray-600 text-sm">Manage customer locker assignment and payment details</p> */}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Locker Assignment Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-4">
                        <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-base font-medium text-gray-900">Locker Assignment</h2>
                    </div>

                    <div className="space-y-3">
                        {/* Center Selection */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Center <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={lockerDetails.center}
                                onChange={(e) => handleInputChange('center', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={isLoadingCenters}
                            >
                                <option value="">Select Center</option>
                                {centers.map((center) => (
                                    <option key={center.id} value={center.id}>{center.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Assign Locker */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Assign Locker <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={`${lockerDetails.assignedLocker}${lockerDetails.lockerSize ? ` (${lockerDetails.lockerSize})` : ''}`}
                                    placeholder="Select locker"
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    readOnly
                                />
                                <button
                                    onClick={() => dispatch(updateLockerDetails({ isModalOpen: true }))}
                                    disabled={!lockerDetails.center}
                                    className="px-3 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-r hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="text-xm" />
                                </button>
                            </div>
                        </div>

                        {/* Locker Key No */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Locker Key No <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Auto-filled on locker assignment"
                                value={lockerDetails.lockerKey || ''}
                                onChange={(e) => handleInputChange('lockerKey', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Details Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center mb-4">
                        <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2H6z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-medium text-gray-900">Payment Details</h2>
                    </div>

                    <div className="space-y-3">
                        {/* Select Plan */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Plan <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={lockerDetails.selectedPlan || ''}
                                onChange={(e) => handlePlanSelect(e.target.value)}
                                disabled={isLoadingPlans}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select a plan</option>
                                {lockerPlans.map(plan => (
                                    <option key={plan.planId} value={plan.planId}>
                                        {plan.name} - ₹{plan.grandTotalAmount}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Deposit <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-500 text-xm">₹</span>
                                    <input
                                        type="text"
                                        value={lockerDetails.rentDetails?.deposit || ''}
                                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Rent <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-500 text-xm">₹</span>
                                    <input
                                        type="text"
                                        value={lockerDetails.rentDetails?.rent || ''}
                                        className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Admission Fees */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Admission Fees <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-gray-500 text-xm">₹</span>
                                <input
                                    type="text"
                                    value={lockerDetails.rentDetails?.admissionFees || ''}
                                    className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Total */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Total <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-blue-600 text-xm font-medium">₹</span>
                                <input
                                    type="text"
                                    value={lockerDetails.rentDetails?.total || ''}
                                    className="w-full pl-6 pr-2 py-2 text-sm border border-blue-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium text-blue-900"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* UPI ID */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={lockerDetails.upiId || ''}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, '');
                                    handleInputChange('upiId', value);
                                }}
                                placeholder="Enter UPI ID"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nominees Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4 shadow-md">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 11-4 0 2 2 0 014 0zM19 8a2 2 0 11-4 0 2 2 0 014 0zM13 14a4 4 0 00-8 0v3h8v-3zM9 13h2v4H9v-4zM13 16v1a1 1 0 001 1h3v-2h-4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Nominee's</h3>
                            <p className="text-xs text-gray-500">Manage beneficiaries for customer's locker</p>
                        </div>
                    </div>
                    <button
                        onClick={() => dispatch(updateLockerDetails({ isNomineeModalOpen: true }))}
                        className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs font-medium rounded-md hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md cursor-pointer"
                    >
                        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        {lockerDetails.nominees?.length > 0 ? 'Update Nominees' : 'Add Nominees'}
                    </button>
                </div>

                {/* Nominees Display */}
                {lockerDetails.nominees?.length > 0 ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">{lockerDetails.nominees.length}</span> nominee{lockerDetails.nominees.length !== 1 ? 's' : ''} added
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {lockerDetails.nominees.map((nominee, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-gradient-to-br from-white to-green-50 rounded-lg p-3 border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5"
                                >
                                    {/* Header - Simplified */}
                                    <div className="flex items-center space-x-2 mb-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                                                {nominee?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"></div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-green-700 transition-colors">
                                                {nominee.name}
                                            </h4>
                                            <p className="text-xs text-gray-600 flex items-center">
                                                <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">{nominee.relation}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar - Compact */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-600">Ownership Share</span>
                                            <span className="text-xs font-bold text-green-600">{nominee.ownership_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${nominee.ownership_percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Personal Details - Compact */}
                                    <div className="bg-white rounded-md p-2 shadow-sm border border-gray-100 mb-3">
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium flex items-center">
                                                    <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    DOB
                                                </span>
                                                <span className="text-gray-900 font-semibold">{nominee.dob}</span>
                                            </div>
                                            {(nominee.proofId || nominee.remark) && (
                                                <div className="flex justify-between items-start pt-1 border-t border-gray-100">
                                                    <span className="text-gray-600 font-medium flex items-center">
                                                        <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                        Proof ID
                                                        {nominee.remark && <span className="text-green-700 ml-1">({nominee.remark})</span>}
                                                    </span>
                                                    <div className="text-right max-w-[50%]">
                                                        {nominee.proofId && (
                                                            <div className="text-gray-900 font-semibold truncate">{nominee.proofId}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button - Compact */}
                                    <div className="flex items-center justify-center">
                                        {nominee.proofFile ? (
                                            <a
                                                href={nominee.proofFile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-md transition-all duration-200 group shadow-sm hover:shadow-md transform hover:scale-105 cursor-pointer"
                                            >
                                                <svg className="w-3 h-3 mr-1.5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                                View Document
                                            </a>
                                        ) : (
                                            <div className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md border border-gray-200">
                                                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                No Document
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-1">No Nominees Added</h3>
                        <p className="text-gray-500 text-xs mb-4 max-w-xs mx-auto">
                            Add nominees to protect your locker assets and ensure proper transfer.
                        </p>
                        <button
                            onClick={() => dispatch(updateLockerDetails({ isNomineeModalOpen: true }))}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs font-medium rounded-md hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add First Nominee
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {lockerDetails.isModalOpen && (
                <AssignLocker
                    isOpen={lockerDetails.isModalOpen}
                    onLockerAssign={handleLockerAssign}
                    onClose={() => dispatch(updateLockerDetails({ isModalOpen: false }))}
                    centerId={lockerDetails.center}
                />
            )}
            {lockerDetails.isNomineeModalOpen && (
                <AddNominee
                    isOpen={lockerDetails.isNomineeModalOpen}
                    onClose={() => dispatch(updateLockerDetails({ isNomineeModalOpen: false }))}
                    onSave={() => dispatch(fetchNominees(primaryHolder?.customerInfo?.customerId)).unwrap()}
                />
            )}
        </div>
    );
};

export default LockerRentDetails;
