import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import LockerRentDetails from "./Locker/LockerRentDetails";
import NomineeSection from "./Locker/NomineeSection";
import {
    fetchLockerDetails,
    fetchNominees,
    assignLocker,
} from "../store/slices/lockerSlice";
import { fetchCustomerById } from "../store/slices/customerSlice";
import { API_URL } from "../assets/config";
import { ROUTES } from "../constants/routes";

const LockerDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const lockerData = useSelector((state) => state.locker);
    const primaryHolder = useSelector(
        (state) => state.customer.form.primaryHolder
    );

    // Extract customer_id from query parameters
    const urlParams = new URLSearchParams(location.search);
    const customerIdFromUrl = urlParams.get('customer_id');
    const panFromUrl = urlParams.get('pan');

    // Use only customerIdFromUrl - no Redux dependency
    const customerId = customerIdFromUrl;

    const [nominees, setNominees] = useState([]);
    const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);

    useEffect(() => {
        // If we have customer_id in URL, fetch customer data to populate Redux
        if (customerIdFromUrl) {
            dispatch(fetchCustomerById({
                customerId: customerIdFromUrl,
                holderType: 'PRIMARY'
            }));
        }
        
        // If no customer_id in URL, redirect to customer page (locker details needs existing customer)
        if (!customerIdFromUrl) {
            navigate(ROUTES.CUSTOMER);
            return;
        }

        // Fetch nominees when we have customer ID
        if (customerId) {
            fetchNomineesData(customerId);
        }
    }, [customerIdFromUrl, dispatch, navigate, customerId]);

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
    // const handleLockerDataChange = (lockerData) => {
    //     setCurrentLockerData(lockerData);
    // };




    return (
        <div className=" bg-white p-8 my-6 rounded-lg shadow-md max-w-7xl mx-auto">
            <LockerRentDetails
                holderType="primaryHolder"
                customerId={customerId}
            />
            {/* Nominees Section */}
            <NomineeSection
                nominees={nominees}
                onUpdateNominees={handleUpdateNominees}
                isNomineeModalOpen={isNomineeModalOpen}
                onOpenNomineeModal={handleOpenNomineeModal}
                onCloseNomineeModal={handleCloseNomineeModal}
            />{" "}
            <div className="flex justify-start items-center mt-6 pt-6 border-t border-gray-200">
                <button
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
            </div>
        </div>
    );
};

export default LockerDetails;
