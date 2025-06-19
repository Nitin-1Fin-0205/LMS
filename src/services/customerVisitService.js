import axios from 'axios';
import { API_URL } from '../assets/config';

class CustomerVisitService {
    static async matchFingerprint(templateData) {
        try {
            const token = localStorage.getItem('authToken');

            const response = await axios.post(
                `${API_URL}/biometrics/identify`,
                {
                    template_data: templateData.templateData,
                    quality: templateData.quality,
                    match_threshold: 0.8
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 && response.data?.data) {
                const { customer_id, finger_name, match_index, locker_access } = response.data.data;

                return {
                    success: true,
                    customerId: customer_id,
                    fingerName: finger_name,
                    matchIndex: match_index,
                    lockerAccess: locker_access || [],
                    hasMultipleLockers: locker_access && locker_access.length > 1,
                    hasNoLockers: !locker_access || locker_access.length === 0
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'No matching fingerprint found'
                };
            }
        } catch (error) {
            console.error('Fingerprint matching error:', error);
            throw error;
        }
    }

    static async fetchCustomerDetails(customerId) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${API_URL}/customers/details-by-id?customer_id=${customerId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 && response.data?.data) {
                const customerInfo = response.data.data;
                return {
                    customerId: customerInfo.customer_id,
                    memberCode: customerInfo.member_id,
                    customerCode: customerInfo.customer_code,
                    firstName: customerInfo.first_name,
                    lastName: customerInfo.last_name,
                    middleName: customerInfo.middle_name,
                    name: customerInfo.name,
                    customerType: customerInfo.type?.toUpperCase(),
                    mobileNo: customerInfo.mobile_number,
                    email: customerInfo.email,
                    panNo: customerInfo.pan,
                    lockerNo: customerInfo.locker_number,
                    lockerId: customerInfo.locker_id,
                    lockerKey: customerInfo.locker_id,
                    address: `${customerInfo.permanent_address_line1 || ''} ${customerInfo.permanent_address_line2 || ''} ${customerInfo.permanent_address_line3 || ''}`.trim(),
                    city: customerInfo.permanent_city,
                    state: customerInfo.permanent_state,
                    photo: customerInfo.profile_img,
                    dob: customerInfo.dob,
                    gender: customerInfo.gender,
                    aadhar: customerInfo.aadhar,
                    guardian: customerInfo.guardian,
                    lockerCenterId: customerInfo.locker_center_id,
                    // ...existing code for other properties...
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching customer details:', error);
            throw error;
        }
    }

    static async fetchCustomerVisitHistory(customerId) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${API_URL}/customers/visits/${customerId}?page=1&limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 && response.data?.data?.visits) {
                return response.data.data.visits.map(visit => ({
                    visit_id: visit.visit_id,
                    accessedBy: visit.accessed_by,
                    customerType: visit.customer_type?.toUpperCase(),
                    time: new Date(visit.entry_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    }),
                    date: new Date(visit.visit_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    purpose: visit.locker_number ? `Locker ${visit.locker_number}` : 'Locker Access',
                    duration: visit.duration_minutes ? `${visit.duration_minutes} min` : visit.exit_time ? 'Completed' : 'In Progress',
                    status: visit.exit_time ? 'COMPLETED' : 'IN_PROGRESS',
                    authenticated_by: visit.authenticated_by
                }));
            }
            return [];
        } catch (error) {
            console.error('Error fetching visit history:', error);
            throw error;
        }
    }

    static async recordVisit(visitData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/customers/visits/record`,
                visitData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 || response.data?.status_code === 201) {
                return { success: true };
            } else {
                throw new Error(response.data?.message || 'Failed to record visit');
            }
        } catch (error) {
            console.error('Error recording visit:', error);
            throw error;
        }
    }

    static async identifyByContact(identifier, identifierType) {
        try {
            const token = localStorage.getItem('authToken');

            const response = await axios.post(
                `${API_URL}/customers/identify-by-contact`,
                {
                    identifier: identifier,
                    identifier_type: identifierType // 1 for mobile, 2 for email
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 && response.data?.data) {
                return {
                    success: true,
                    requestId: response.data.data.request_id,
                    customerId: response.data.data.customer_id,
                    identifierType: response.data.data.identifier_type,
                    maskedIdentifier: response.data.data.masked_identifier,
                    expiresIn: response.data.data.expires_in,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Customer not found with this contact information'
                };
            }
        } catch (error) {
            console.error('Customer identification error:', error);
            throw error;
        }
    }

    static async verifyIdentificationOtp(requestId, customerId, otp) {
        try {
            const token = localStorage.getItem('authToken');

            const response = await axios.post(
                `${API_URL}/customers/verify-identification-otp`,
                {
                    request_id: requestId,
                    customer_id: customerId,
                    otp: Number(otp)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data?.status_code === 200 && response.data?.data) {
                const { customer_id, locker_access } = response.data.data;

                return {
                    success: true,
                    customerId: customer_id,
                    lockerAccess: locker_access || [],
                    hasMultipleLockers: locker_access && locker_access.length > 1,
                    hasNoLockers: !locker_access || locker_access.length === 0,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data?.message || 'Invalid OTP'
                };
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    }
}

export default CustomerVisitService;
