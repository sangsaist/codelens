
import { useState, useEffect } from 'react'

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold focus:outline-none">
                &times;
            </button>
        </div>
    );
};

export default Toast;
