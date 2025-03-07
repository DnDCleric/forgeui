import React from "react";
import { useUIStore } from "../store";

const AlignmentTools: React.FC = () => {
    const alignElements = useUIStore((state) => state.alignElements); // Ensure correct retrieval

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md mt-4">
            <h3 className="text-lg font-bold">Alignment Tools</h3>

            <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                    onClick={() => alignElements("left")}
                >
                    Left
                </button>
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                    onClick={() => alignElements("center")}
                >
                    Center
                </button>
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                    onClick={() => alignElements("right")}
                >
                    Right
                </button>
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                    onClick={() => alignElements("top")}
                >
                    Top
                </button>
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                    onClick={() => alignElements("bottom")}
                >
                    Bottom
                </button>
                <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                    onClick={() => alignElements("vertical")}
                >
                    Distribute Evenly
                </button>
            </div>
        </div>
    );
};

export default AlignmentTools;
