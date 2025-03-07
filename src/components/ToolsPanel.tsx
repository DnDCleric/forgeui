import React from "react";
import { useUIStore } from "../store";
import { FaUndo, FaRedo, FaTrash } from "react-icons/fa";
import UndoRedoControls from "./UndoRedoControls";

const ToolsPanel: React.FC = () => {
    const { selectedElementId, deleteElement } = useUIStore();
    const resetView = useUIStore((state) => state.resetView);

    return (
        <div className="bg-gray-900 p-1 border border-gray-700 rounded-md w-full flex flex-col gap-2">
            <div className=" flex flex-row gap-2 w-full">
                {/* Undo / Redo Controls */}
                <UndoRedoControls />

                {/* Delete Button (Only Shows When an Element is Selected) */}
                {selectedElementId && (
                    <button
                        onClick={() => deleteElement(selectedElementId)}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                        title="Delete Selected Element"
                    >
                        <FaTrash size={14} />
                    </button>
                )}

                {/* 🔧 Future Tools Can Be Added Here */}
            </div>

        </div>
    );
};

export default ToolsPanel;
