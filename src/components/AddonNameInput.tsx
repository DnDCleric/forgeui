import React from "react";
import { useUIStore } from "../store";

const AddonNameInput: React.FC = () => {
    const { addonName, setAddonName } = useUIStore();

    return (
        <div className="mb-4">
            <label className="text-sm font-bold">Addon Name:</label>
            <input
                type="text"
                className="w-full p-2 mt-1 bg-gray-800 text-white border border-gray-600 rounded"
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
            />
        </div>
    );
};

export default AddonNameInput;
