export const selectCustomerInfo = (state, holderType) => state.customerInfo[holderType];
export const selectLockerInfo = (state) => state.lockerInfo.data;
export const selectRentDetails = (state) => state.rentDetails.data;
