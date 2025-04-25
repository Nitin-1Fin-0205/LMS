export const LockerDetailsModel = {
    lockerId: '',
    center: '',
    assignedLocker: '',
    remarks: '',
    lockerSize: '',
    lockerKeyNo: '',
    isModalOpen: false,
    isNomineeModalOpen: false,
    nominees: []
};

export const RentDetailsModel = {
    deposit: '',
    rent: '',
    admissionFees: '',
    total: '',
    selectedPlan: '',
    contractNumber: '',
    moveInDate: '',
    anticipatedMoveOutDate: ''
};

export const LockerPlanModel = {
    planId: '',
    name: '',
    deposit: '',
    baseRent: '',
    admissionFees: '',
    grandTotalAmount: ''
};
