import React from 'react';

const Loader = ({
    size = 'md',
    text = 'Loading...',
    className = '',
    fullScreen = false,
    color = 'blue'
}) => {
    // Size variants
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    // Color variants
    const colorClasses = {
        blue: 'border-blue-600',
        gray: 'border-gray-600',
        green: 'border-green-600',
        red: 'border-red-600',
        purple: 'border-purple-600'
    };

    const spinnerClass = `inline-block animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`;

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className={spinnerClass}></div>
                    {text && (
                        <p className="text-gray-600 text-sm mt-4">{text}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="text-center">
                <div className={spinnerClass}></div>
                {text && (
                    <p className="text-gray-600 text-sm mt-2">{text}</p>
                )}
            </div>
        </div>
    );
};

// Inline loader for forms and buttons
export const InlineLoader = ({
    size = 'sm',
    text = '',
    className = '',
    color = 'blue'
}) => {
    const sizeClasses = {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        gray: 'border-gray-600',
        green: 'border-green-600',
        red: 'border-red-600',
        purple: 'border-purple-600',
        white: 'border-white'
    };

    const spinnerClass = `inline-block animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`;

    return (
        <div className={`flex items-center ${className}`}>
            <div className={spinnerClass}></div>
            {text && (
                <span className="ml-2 text-sm">{text}</span>
            )}
        </div>
    );
};

// Content loader for sections
export const ContentLoader = ({
    text = 'Loading...',
    className = '',
    minHeight = 'min-h-[200px]'
}) => {
    return (
        <div className={`flex items-center justify-center ${minHeight} ${className}`}>
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-gray-600 text-sm">{text}</p>
            </div>
        </div>
    );
};

export default Loader;
