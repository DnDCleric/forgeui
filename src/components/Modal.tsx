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
    preventCancel?: boolean
    allowOutsideClickClose?: boolean; // ✅ New Prop to Allow Closing on Click Outside
    children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
                                         title,
                                         message,
                                         onClose,
                                         onConfirm,
                                         confirmText = "Confirm",
                                         cancelText = "Cancel",
                                         confirmColor = "bg-red-600 hover:bg-red-700",
                                         allowOutsideClickClose = false, // Default: Don't close on outside click
                                         preventCancel = false,
                                         children,
                                     }) => {
    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-250"
            onClick={allowOutsideClickClose ? onClose : undefined} // ✅ Click outside closes if enabled
        >
            <div
                className="bg-gray-900 p-6 rounded-md border border-gray-700 text-white shadow-lg w-96"
                onClick={(e) => e.stopPropagation()} // ✅ Prevent modal from closing when clicking inside
            >
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-sm text-gray-400">{message}</p>

                {children && <div className="mt-4">{children}</div>}

                <div className="flex justify-end gap-2 mt-4">
                    {!preventCancel && (
                        <button 
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md" 
                            onClick={onClose}
                            type="button"
                        >
                            {cancelText}
                        </button>
                    )}
                    {onConfirm && (
                        <button 
                            className={`px-4 py-2 ${confirmColor} rounded-md`} 
                            onClick={onConfirm}
                            type="button"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
