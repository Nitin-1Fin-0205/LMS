// Razorpay Subscription Status Constants
// Based on Razorpay Payment Subscription States Documentation

export const SUBSCRIPTION_STATUS = {
    // Initial States
    CREATED: 'created',
    AUTHENTICATED: 'authenticated',

    // Active States
    ACTIVE: 'active',
    PENDING: 'pending',

    // Inactive States
    HALTED: 'halted',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    COMPLETED: 'completed'
};

// Helper functions for subscription status checks
export const SubscriptionHelpers = {
    // Check if subscription is in an active state
    isActive: (status) => {
        return status === SUBSCRIPTION_STATUS.ACTIVE ||
            status === SUBSCRIPTION_STATUS.AUTHENTICATED;
    },

    // Check if subscription can accept payments
    canAcceptPayments: (status) => {
        return status === SUBSCRIPTION_STATUS.ACTIVE ||
            status === SUBSCRIPTION_STATUS.AUTHENTICATED ||
            status === SUBSCRIPTION_STATUS.PENDING;
    },

    // Check if subscription is in a failed/error state
    isFailedState: (status) => {
        return status === SUBSCRIPTION_STATUS.HALTED ||
            status === SUBSCRIPTION_STATUS.EXPIRED;
    },

    // Check if subscription is manually stopped
    isManuallyStopped: (status) => {
        return status === SUBSCRIPTION_STATUS.CANCELLED ||
            status === SUBSCRIPTION_STATUS.PAUSED;
    },

    // Check if subscription is in a terminal state (cannot be reactivated)
    isTerminalState: (status) => {
        return status === SUBSCRIPTION_STATUS.CANCELLED ||
            status === SUBSCRIPTION_STATUS.EXPIRED ||
            status === SUBSCRIPTION_STATUS.COMPLETED;
    },

    // Check if subscription needs user action
    needsUserAction: (status) => {
        return status === SUBSCRIPTION_STATUS.PENDING ||
            status === SUBSCRIPTION_STATUS.HALTED;
    },

    // Get display text for status
    getDisplayText: (status) => {
        const statusMap = {
            [SUBSCRIPTION_STATUS.CREATED]: 'Created',
            [SUBSCRIPTION_STATUS.AUTHENTICATED]: 'Authenticated',
            [SUBSCRIPTION_STATUS.ACTIVE]: 'Active',
            [SUBSCRIPTION_STATUS.PENDING]: 'Payment Pending',
            [SUBSCRIPTION_STATUS.HALTED]: 'Payment Failed',
            [SUBSCRIPTION_STATUS.PAUSED]: 'Paused',
            [SUBSCRIPTION_STATUS.CANCELLED]: 'Cancelled',
            [SUBSCRIPTION_STATUS.EXPIRED]: 'Expired',
            [SUBSCRIPTION_STATUS.COMPLETED]: 'Completed'
        };
        return statusMap[status] || status;
    },

    // Get CSS classes for status display
    getStatusClasses: (status) => {
        const classMap = {
            [SUBSCRIPTION_STATUS.CREATED]: 'bg-blue-100 text-blue-800',
            [SUBSCRIPTION_STATUS.AUTHENTICATED]: 'bg-blue-100 text-blue-800',
            [SUBSCRIPTION_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
            [SUBSCRIPTION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
            [SUBSCRIPTION_STATUS.HALTED]: 'bg-red-100 text-red-800',
            [SUBSCRIPTION_STATUS.PAUSED]: 'bg-gray-100 text-gray-800',
            [SUBSCRIPTION_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
            [SUBSCRIPTION_STATUS.EXPIRED]: 'bg-red-100 text-red-800',
            [SUBSCRIPTION_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800'
        };
        return classMap[status] || 'bg-gray-100 text-gray-800';
    }
};

// Status groups for easier filtering
export const SUBSCRIPTION_STATUS_GROUPS = {
    ACTIVE_STATES: [
        SUBSCRIPTION_STATUS.CREATED,
        SUBSCRIPTION_STATUS.AUTHENTICATED,
        SUBSCRIPTION_STATUS.ACTIVE
    ],
    INACTIVE_STATES: [
        SUBSCRIPTION_STATUS.PENDING,
        SUBSCRIPTION_STATUS.HALTED,
        SUBSCRIPTION_STATUS.PAUSED,
        SUBSCRIPTION_STATUS.CANCELLED,
        SUBSCRIPTION_STATUS.EXPIRED,
        SUBSCRIPTION_STATUS.COMPLETED
    ],
    PAYMENT_ISSUE_STATES: [
        SUBSCRIPTION_STATUS.PENDING,
        SUBSCRIPTION_STATUS.HALTED
    ],
    TERMINAL_STATES: [
        SUBSCRIPTION_STATUS.CANCELLED,
        SUBSCRIPTION_STATUS.EXPIRED,
        SUBSCRIPTION_STATUS.COMPLETED
    ]
};
