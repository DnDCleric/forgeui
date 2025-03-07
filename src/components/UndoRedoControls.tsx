import React from "react";
import { useUIStore } from "../store";
import { FaUndo, FaRedo } from "react-icons/fa";

const UndoRedoControls: React.FC = () => {
    const { undo, redo } = useUIStore();

    return (
        <>
            <button
                onClick={undo}
                className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
                title="Undo"
            >
                <FaUndo size={14} />
            </button>
            <button
                onClick={redo}
                className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
                title="Redo"
            >
                <FaRedo size={14} />
            </button>
        </>
    );
};

export default UndoRedoControls;
