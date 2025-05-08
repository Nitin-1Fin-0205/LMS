import axios from 'axios';
import { API_URL } from '../assets/config';

export const otpService = {
    sendEmailOtp: async (email) => {
        try {
            // //TODO: remove this line when the API is ready
            // // MOCKED API RESPONse 
            // return {
            //     success: true,
            //     message: 'OTP sent successfully'
            // };

            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/customers/genarate-otp`,
                {
                    key: 2,
                    value: `${email}`,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.status === 200 || !response.status === 201) {
                throw new Error(response.data.message || 'OTP sending failed');
            }
            return response.data?.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send email OTP');
        }
    },

    sendMobileOtp: async (mobile) => {
        try {
            // //TODO: remove this line when the API is ready
            // // MOCKED API RESPONse 
            // return {
            //     success: true,
            //     message: 'OTP sent successfully'
            // };


            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/customers/genarate-otp`,
                {
                    key: 1,
                    value: `${mobile}`,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.status === 200 || !response.status === 201) {
                throw new Error(response.data.message || 'OTP sending failed');
            }
            return response.data?.data;
        } catch (error) {
            console.error('OTP Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to send mobile OTP');
        }
    },

    verifyOtp: async (request_id, otp) => {
        try {
            // //TODO: remove this line when the API is ready
            // // MOCKED API RESPONse
            // return {
            //     success: true,
            //     message: 'OTP verified successfully'
            // };

            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/customers/otp-verification`,
                {
                    request_id: request_id,
                    otp: otp
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (!response.status === 200 || !response.status === 201) {
                throw new Error(response.data.message || 'OTP verification failed');
            }
            console.log('OTP Verification Response:', response.data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Invalid OTP');
        }
    }
};
