import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const VisitHistory = ({ visitHistory, customerData, historyLoading }) => {
    return (
        <div className="bg-white rounded-lg border border-blue-100 shadow-lg shadow-blue-100/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/40 hover:-translate-y-1">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faHistory} className="mr-2 w-4 h-4 text-blue-600" />
                    Recent Access History
                    {historyLoading && (
                        <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    )}
                </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {visitHistory.length > 0 ? (
                    visitHistory.map((access, index) => (
                        <div key={access.visit_id || index} className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium text-xs">
                                    {access.accessedBy.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-gray-900 truncate text-xs">{access.accessedBy}</h4>
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${access.customerType === 'PRIMARY'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {access.customerType}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${access.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {access.status === 'COMPLETED' ? 'Done' : 'Active'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-medium">{access.time}</span>
                                        <span>•</span>
                                        <span>{access.date}</span>
                                        <span>•</span>
                                        <span>{access.purpose}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        Duration: {access.duration} | Auth: {access.authenticated_by}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : customerData && !historyLoading ? (
                    <div className="p-4 text-center text-gray-500">
                        <FontAwesomeIcon icon={faHistory} className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm">No recent visits found</p>
                    </div>
                ) : !customerData ? (
                    <div className="p-4 text-center text-gray-500">
                        <FontAwesomeIcon icon={faInfoCircle} className="w-6 h-6 text-gray-300 mb-2" />
                        <p className="text-sm">Authenticate to view access history</p>
                    </div>
                ) : (
                    <div className="p-4 text-center">
                        <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitHistory;
