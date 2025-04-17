const emptyCustomerInfo = {
    photo: null,
    customerId: "",
    customerName: "",
    fatherOrHusbandName: "",
    address: "",
    dateOfBirth: "",
    mobileNo: "",
    panNo: "",
    gender: "",
    emailId: "",
    documentNo: ""
};

const emptyLockerInfo = {
    lockerId: null,
    assignedLocker: "",
    center: "",
    remarks: "",
    lockerId: null,
    lockerSize: ""
};

const emptyRentDetails = {
    lockerNo: "",
    lockerId: null,
    deposit: "",
    rent: "",
    admissionFees: "",
    total: "",
    lockerKeyNo: "",
    contractNumber: "",
    selectedPlan: ""
};

const emptyAttachments = {
    identityProof: null,
    addressProof: null,
    contactDocument: null,
    otherDocument: null
};

export const formDataStructure = {
    primaryHolder: {
        customerInfo: { ...emptyCustomerInfo },
        lockerInfo: { ...emptyLockerInfo },
        rentDetails: { ...emptyRentDetails },
        attachments: { ...emptyAttachments }
    },
    secondHolder: {
        customerInfo: { ...emptyCustomerInfo },
        lockerInfo: { ...emptyLockerInfo },
        attachments: { ...emptyAttachments }
    },
    thirdHolder: {
        customerInfo: { ...emptyCustomerInfo },
        lockerInfo: { ...emptyLockerInfo },
        attachments: { ...emptyAttachments }
    }
};