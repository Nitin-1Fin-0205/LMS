import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LockerRentDetails from "./Locker/LockerRentDetails";
import NomineeSection from "./Locker/NomineeSection";
import {
    fetchLockerDetails,
    fetchNominees,
    assignLocker,
} from "../store/slices/lockerSlice";
import { API_URL } from "../assets/config";

const LockerDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const lockerData = useSelector((state) => state.locker);
    const primaryHolder = useSelector(
        (state) => state.customer.form.primaryHolder
    );
    const [nominees, setNominees] = useState([]);
    const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
    const [showSurrenderButton, setShowSurrenderButton] = useState(false);
    // Locker data from child component
    const [currentLockerData, setCurrentLockerData] = useState(null);
    useEffect(() => {
        // Fetch nominees when component mounts
        const customerId = primaryHolder?.customerInfo?.customerId;
        if (customerId) {
            fetchNomineesData(customerId);
        }
    }, [primaryHolder?.customerInfo?.customerId]);

    const fetchNomineesData = async (customerId) => {
        try {
            const nomineesResponse = await dispatch(
                fetchNominees(customerId)
            ).unwrap();
            setNominees(
                nomineesResponse.data.nominees.map((nominee) => ({
                    ...nominee,
                    id: nominee.unique_id,
                }))
            );
        } catch (error) {
            console.error("Error fetching nominees:", error);
        }
    };

    // useEffect(() => {
    //     const fetchInitialData = async () => {
    //         try {
    //             if (primaryHolder?.customerInfo?.customerId) {
    //                 const response = await dispatch(
    //                     fetchLockerDetails(primaryHolder.customerInfo.customerId)
    //                 ).unwrap();
    //                 console.log("Fetched locker details:", response);
    //             } else {
    //                 // If no customerId, navigate back
    //                 navigate(-1);
    //             }
    //         } catch (error) {
    //             // toast.error('Failed to fetch locker details');
    //             console.log("Error fetching locker details:", error);
    //         }
    //     };
    //     fetchInitialData();
    // }, [dispatch, primaryHolder?.customerInfo?.customerId]);

    // Nominee handlers
    const handleUpdateNominees = (updatedNominees) => {
        setNominees(updatedNominees);
    };

    const handleOpenNomineeModal = () => {
        setIsNomineeModalOpen(true);
    };
    const handleCloseNomineeModal = () => {
        setIsNomineeModalOpen(false);
    };

    // Handler for receiving locker data from LockerRentDetails
    const handleLockerDataChange = (lockerData) => {
        setCurrentLockerData(lockerData);
    };
    const handleSaveLockerDetails = async () => {
        try {
            console.log("Current Locker Data:", currentLockerData);

            if (!currentLockerData?.upiId) {
                toast.error("UPI ID is required");
                return;
            }

            if (!currentLockerData?.lockerId || !currentLockerData?.selectedPlan) {
                toast.error("Please assign a locker and select a plan");
                return;
            }

            const lockerAssignmentData = {
                customerId: primaryHolder?.customerInfo?.customerId,
                lockerId: currentLockerData.lockerId,
                centerId: currentLockerData.center,
                planId: currentLockerData.selectedPlan,
                expiryDate: "2024-06-30",
                payFrequency: 1,
                upiId: currentLockerData.upiId,
            };

            const response = await dispatch(assignLocker(lockerAssignmentData)).unwrap();
            toast.success("Locker assigned successfully!");
            console.log("Locker assignment response:", response);
            if (response.status_code === 200 || response.status_code === 201) {
                setShowSurrenderButton(true);
            }
            // Additional success handling...
        } catch (error) {
            toast.error(error.message || "Failed to assign locker");
        }
    }; // const handleSubmit = () => {
    //     // Add API call for submitting locker and rent details
    //     navigate(-1);
    // };

    return (
        <div className=" bg-white p-8 my-6 rounded-lg shadow-md max-w-7xl mx-auto">
            <LockerRentDetails
                holderType="primaryHolder"
                onLockerDataChange={handleLockerDataChange}
                showSurrenderButton={showSurrenderButton}
                setShowSurrenderButton={setShowSurrenderButton}
            />
            {/* Nominees Section */}
            <NomineeSection
                nominees={nominees}
                onUpdateNominees={handleUpdateNominees}
                isNomineeModalOpen={isNomineeModalOpen}
                onOpenNomineeModal={handleOpenNomineeModal}
                onCloseNomineeModal={handleCloseNomineeModal}
            />{" "}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <button
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
                <button
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={handleSaveLockerDetails}
                    disabled={
                        !currentLockerData?.lockerId || !currentLockerData?.selectedPlan
                    }
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default LockerDetails;
