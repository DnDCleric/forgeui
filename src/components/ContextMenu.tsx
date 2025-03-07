import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "../store";

interface ContextMenuProps {
    x: number;
    y: number;
    elementId: string;
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, elementId, onClose }) => {
    const deleteElement = useUIStore((state) => state.deleteElement);
    const setSelectedElement = useUIStore((state) => state.setSelectedElement);
    const elements = useUIStore((state) => state.elements);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Ensure that clicking outside closes the menu
            const menu = document.getElementById("context-menu");
            if (menu && !menu.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [onClose]);

    const handleDelete = () => {
        const elementToDelete = elements.find((el) => el.id === elementId);
        if (!elementToDelete) return;

        // Prevent deleting everything if it's a frame
        if (elementToDelete.type === "Frame") {
            const hasChildren = elements.some((el) => el.parentId === elementId);
            if (hasChildren && !confirm("This will delete the frame and all its children. Continue?")) {
                onClose();
                return;
            }
        }

        deleteElement(elementId);
        onClose();
    };

    return (
        <motion.div
            id="context-menu"
            className="absolute bg-gray-900 text-white border border-gray-700 rounded shadow-md p-2 z-[100]"
            style={{
                top: Math.min(y, window.innerHeight - 110), // Prevent menu from going off-screen
                left: Math.min(x, window.innerWidth - 160),
                position: "fixed",
                width: "150px",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
        >
            <button
                className="bg-gray-700 w-full text-left px-4 py-2 hover:bg-gray-600"
                onClick={() => {
                    setSelectedElement(elementId);
                    onClose();
                }}
            >
                Edit
            </button>
            <button
                className="bg-red-600 w-full text-left px-4 py-2 hover:bg-red-700"
                onClick={handleDelete}
            >
                Delete
            </button>
        </motion.div>
    );
};

export default ContextMenu;
