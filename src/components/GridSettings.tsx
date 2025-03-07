import React from "react";
import { useUIStore } from "../store";

const GridSettings: React.FC = () => {
    const { gridSize, setGridSize, snapToGrid, toggleSnapToGrid } = useUIStore();

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md mt-4">
            <h3 className="text-lg font-bold">Grid Settings</h3>

            {/* Snap to Grid Toggle */}
            <label className="flex items-center gap-2 mt-2">
                <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={toggleSnapToGrid}
                    className="w-4 h-4"
                />
                <span>Snap to Grid</span>
            </label>

            {/* Grid Size Slider */}
            <div className="mt-2">
                <label className="text-sm">Grid Size: {gridSize}px</label>
                <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default GridSettings;
