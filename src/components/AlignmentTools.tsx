import React from "react";
import { useUIStore } from "../store";
import { 
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaArrowUp,
    FaArrowDown,
    FaArrowsAltV
} from "react-icons/fa";

const AlignmentTools: React.FC = () => {
    const alignElements = useUIStore((state) => state.alignElements);

    const alignmentButtons = [
        { icon: <FaAlignLeft size={16} />, action: "left", tooltip: "Align Left" },
        { icon: <FaAlignCenter size={16} />, action: "center", tooltip: "Align Center" },
        { icon: <FaAlignRight size={16} />, action: "right", tooltip: "Align Right" },
        { icon: <FaArrowUp size={16} />, action: "top", tooltip: "Align Top" },
        { icon: <FaArrowDown size={16} />, action: "bottom", tooltip: "Align Bottom" },
        { icon: <FaArrowsAltV size={16} />, action: "vertical", tooltip: "Distribute Evenly" }
    ] as const;

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md mt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Alignment Tools</h3>

            <div className="grid grid-cols-3 gap-2 mt-2">
                {alignmentButtons.map(({ icon, action, tooltip }) => (
                    <button
                        key={action}
                        className="group relative bg-gray-800 hover:bg-gray-700 p-2 rounded flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                        onClick={() => alignElements(action)}
                    >
                        {icon}
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {tooltip}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AlignmentTools;
