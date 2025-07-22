import React from "react";
import { InlineLoader } from "../ui";
import { SUBSCRIPTION_STATUS, SubscriptionHelpers } from "../../constants/subscriptionStatus";

const PaymentDetailsSection = ({
    lockerDetails,
    lockerPlans,
    isLoadingPlans,
    subscriptionStatus,
    isCreatingSubscription,
    isCancellingSubscription,
    isImmediateSubscription,
    isSaving,
    primaryHolder,
    customerId,
    onPlanSelect,
    onSaveLockerDetails,
    onCreateSubscription,
    onCancelSubscription,
    onSetIsImmediateSubscription,
    isLockerProperlySaved,
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center mb-4">
                <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center mr-2">
                    <svg
                        className="w-3 h-3 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2H6z" />
                    </svg>
                </div>
                <h2 className="text-base font-medium text-gray-900">
                    Payment Details
                </h2>
            </div>

            <div className="space-y-3">
                {/* Select Plan */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Select Plan <span className="text-red-500">*</span>
                    </label>
                    {isLoadingPlans ? (
                        <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 flex items-center">
                            <InlineLoader
                                size="sm"
                                text="Loading plans..."
                                color="blue"
                            />
                        </div>
                    ) : (
                        <select
                            value={lockerDetails.selectedPlan || ""}
                            onChange={(e) => onPlanSelect(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a plan</option>
                            {lockerPlans.map((plan) => (
                                <option key={plan.planId} value={plan.planId}>
                                    {plan.name} - ₹{plan.grandTotalAmount}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Assign Locker Button - Only show if no locker is assigned yet */}
            {!isLockerProperlySaved && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        className="w-full px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        onClick={onSaveLockerDetails}
                        disabled={
                            !lockerDetails?.lockerId ||
                            !lockerDetails?.selectedPlan ||
                            isSaving
                        }
                    >
                        {isSaving ? 'Assigning Locker...' : 'Assign Locker'}
                    </button>
                </div>
            )}

            {/* Subscription Management Section */}
            {isLockerProperlySaved && customerId && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="space-y-4">
                        {/* Subscription Status */}
                        {subscriptionStatus && (
                            <div className="space-y-3">
                                {/* Status Display */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            Payment Subscription Status:
                                        </span>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${SubscriptionHelpers.getStatusClasses(subscriptionStatus.status || subscriptionStatus)}`}>
                                            {SubscriptionHelpers.getDisplayText(subscriptionStatus.status || subscriptionStatus)}
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Details */}
                                {subscriptionStatus.details && (
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Subscription ID:</span>
                                                <p className="font-medium text-gray-900 text-xs">
                                                    {subscriptionStatus.details.subscriptionId}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Amount per Cycle:</span>
                                                <p className="font-medium text-green-600">
                                                    ₹{subscriptionStatus.details.amountPerCycle}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Paid Cycles:</span>
                                                <p className="font-medium text-gray-900">
                                                    {subscriptionStatus.details.paidCycles} / {subscriptionStatus.details.totalCycles}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Total Cycles:</span>
                                                <p className="font-medium text-blue-600">
                                                    {subscriptionStatus.details.totalCycles}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Link - Show if available */}
                                        {subscriptionStatus.details.paymentUrl && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <span className="text-gray-600 text-sm">Payment Link:</span>
                                                <div className="mt-1">
                                                    <a
                                                        href={subscriptionStatus.details.paymentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        Complete Payment
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {/* Subscription Start Date */}
                                        {subscriptionStatus.details.startAt && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <span className="text-gray-600 text-sm">Subscription Starts:</span>
                                                <p className="font-medium text-green-600">
                                                    {new Date(subscriptionStatus.details.startAt * 1000).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {/* Subscription End Date */}
                                        {subscriptionStatus.details.endAt && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <span className="text-gray-600 text-sm">Subscription Ends:</span>
                                                <p className="font-medium text-red-600">
                                                    {new Date(subscriptionStatus.details.endAt * 1000).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {/* Next Charge Date */}
                                        {subscriptionStatus.details.nextChargeAt && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <span className="text-gray-600 text-sm">Next Charge Date:</span>
                                                <p className="font-medium text-orange-600">
                                                    {new Date(subscriptionStatus.details.nextChargeAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {/* Current Period End */}
                                        {subscriptionStatus.details.currentEnd && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <span className="text-gray-600 text-sm">Current Period Ends:</span>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(subscriptionStatus.details.currentEnd).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {/* Created Date */}
                                        <div className="pt-2 border-t border-gray-200">
                                            <span className="text-gray-600 text-sm">Created On:</span>
                                            <p className="font-medium text-gray-900">
                                                {new Date(subscriptionStatus.details.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Status Alerts */}
                                {subscriptionStatus.details?.needsAction && (
                                    <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        Action required: Please update your payment method or contact support.
                                    </div>
                                )}

                                {subscriptionStatus.details?.isPending && (
                                    <div className="text-sm text-orange-700 bg-orange-50 p-2 rounded border border-orange-200">
                                        <i className="fas fa-clock mr-2"></i>
                                        Payment is pending. We'll retry automatically.
                                    </div>
                                )}

                                {subscriptionStatus.details?.isExpired && (
                                    <div className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                                        <i className="fas fa-times-circle mr-2"></i>
                                        This subscription has expired. Please create a new subscription.
                                    </div>
                                )}

                                {SubscriptionHelpers.isTerminalState(subscriptionStatus.status) && subscriptionStatus.status !== 'none' && (
                                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        This subscription has ended and cannot be reactivated. You can create a new subscription if needed.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Immediate Subscription Checkbox */}
                        {(subscriptionStatus.status === 'none' ||
                            (!subscriptionStatus.hasActiveSubscription || subscriptionStatus.details?.isExpired) && subscriptionStatus.canCreateNew) && (
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="immediateSubscription"
                                            checked={isImmediateSubscription}
                                            onChange={(e) => onSetIsImmediateSubscription(e.target.checked)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="immediateSubscription" className="text-sm font-medium text-blue-900 cursor-pointer">
                                            Start subscription immediately
                                        </label>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-1 ml-6">
                                        {isImmediateSubscription
                                            ? "Subscription will start immediately upon creation"
                                            : "Subscription will start according to the plan schedule"
                                        }
                                    </p>
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {/* Create Subscription Button */}
                            {(subscriptionStatus.status === 'none' ||
                                (!subscriptionStatus.hasActiveSubscription || subscriptionStatus.details?.isExpired) && subscriptionStatus.canCreateNew) && (
                                    <button
                                        onClick={onCreateSubscription}
                                        disabled={isCreatingSubscription}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                    >
                                        {isCreatingSubscription ? (
                                            <InlineLoader
                                                size="sm"
                                                text="Creating Subscription..."
                                                color="white"
                                                className="w-full text-center"
                                            />
                                        ) : (
                                            <>
                                                <i className="fas fa-plus mr-2"></i>
                                                {subscriptionStatus.details?.isExpired ? 'Renew Subscription' : 'Create Subscription'}
                                            </>
                                        )}
                                    </button>
                                )}

                            {/* Cancel Subscription Button */}
                            {(subscriptionStatus.hasActiveSubscription ||
                                (subscriptionStatus.status && !SubscriptionHelpers.isTerminalState(subscriptionStatus.status) && subscriptionStatus.status !== 'none')) && (
                                    <button
                                        onClick={onCancelSubscription}
                                        disabled={isCancellingSubscription}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                    >
                                        {isCancellingSubscription ? (
                                            <InlineLoader
                                                size="sm"
                                                text="Cancelling Subscription..."
                                                color="white"
                                            />
                                        ) : (
                                            <>
                                                <i className="fas fa-times mr-2"></i>
                                                Cancel Subscription
                                            </>
                                        )}
                                    </button>
                                )}

                            {/* Update Payment Method Button */}
                            {subscriptionStatus.details?.needsAction && (
                                <button
                                    onClick={() => {
                                        // Handle payment method update
                                        console.log("Update payment method clicked");
                                    }}
                                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                                >
                                    <i className="fas fa-credit-card mr-2"></i>
                                    Update Payment Method
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentDetailsSection;
