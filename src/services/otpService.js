import axios from 'axios';
import { API_URL } from '../assets/config';

export const otpService = {
    sendEmailOtp: async (email) => {
        try {
            //TODO: remove this line when the API is ready
            // MOCKED API RESPONse 
            return {
                success: true,
                message: 'OTP sent successfully'
            };

            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/auth/send-email-otp`,
                { email },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send email OTP');
        }
    },

    sendMobileOtp: async (mobile) => {
        try {
            //TODO: remove this line when the API is ready
            // MOCKED API RESPONse 
            return {
                success: true,
                message: 'OTP sent successfully'
            };


            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/customers/send-mobile-otp`,
                { mobileNumber: mobile },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'OTP sending failed');
            }
            return response.data;
        } catch (error) {
            console.error('OTP Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to send mobile OTP');
        }
    },

    verifyOtp: async (type, value, otp) => {
        try {
            //TODO: remove this line when the API is ready
            // MOCKED API RESPONse
            return {
                success: true,
                message: 'OTP verified successfully'
            };

            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/auth/verify-otp`,
                {
                    type,
                    value,
                    otp
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Invalid OTP');
        }
    }
};
