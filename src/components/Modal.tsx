import React from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    children?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
                                         title,
                                         message,
                                         onClose,
                                         onConfirm,
                                         confirmText = "Confirm",
                                         cancelText = "Cancel",
                                         confirmColor = "bg-red-600 hover:bg-red-700",
                                     }) => {
    return createPortal(
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-6 rounded-md border border-gray-700 text-white shadow-lg z-50 w-96">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-gray-400">{message}</p>
            <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md" onClick={onClose}>
                    {cancelText}
                </button>
                {onConfirm && (
                    <button className={`px-4 py-2 ${confirmColor} rounded-md`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                )}
            </div>
        </div>,
        document.body // ✅ Ensures the modal renders at the root level
    );
};

export default Modal;
