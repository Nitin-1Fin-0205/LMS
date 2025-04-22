import { useDispatch } from 'react-redux';
import { updateCustomerInfo, resetCustomerInfo } from '../store/slices/customerInfoSlice';
import { updateLockerInfo, resetLockerInfo } from '../store/slices/lockerInfoSlice';
import { updateRentDetails, resetRentDetails } from '../store/slices/rentDetailsSlice';

export const useFormActions = () => {
    const dispatch = useDispatch();

    return {
        updateCustomer: (holderType, data) =>
            dispatch(updateCustomerInfo({ holderType, data })),
        updateLocker: (data) =>
            dispatch(updateLockerInfo(data)),
        updateRent: (data) =>
            dispatch(updateRentDetails(data)),
        resetForms: (holderType) => {
            dispatch(resetCustomerInfo({ holderType }));
            dispatch(resetLockerInfo());
            dispatch(resetRentDetails());
        }
    };
};
