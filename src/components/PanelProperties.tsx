import React, { useRef } from "react";
import { useUIStore } from "../store";

const PropertiesPanel: React.FC = () => {
    const selectedElementId = useUIStore((state) => state.selectedElementId);
    const elements = useUIStore((state) => state.elements);
    const updateElement = useUIStore((state) => state.updateElement);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedElement = elements.find((el) => el.id === selectedElementId);

    if (!selectedElement) return <div className="p-4 text-gray-400">No element selected</div>;

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                updateElement(selectedElementId, { imageSrc: reader.result });
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md mt-4">
            <h3 className="text-lg font-bold">Element Properties</h3>

            {/* Width */}
            <label className="block mt-2 text-sm">Width:</label>
            <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => updateElement(selectedElementId, { width: Number(e.target.value) })}
                className="w-full bg-gray-700 p-1 rounded-md text-white"
            />

            {/* Height */}
            <label className="block mt-2 text-sm">Height:</label>
            <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => updateElement(selectedElementId, { height: Number(e.target.value) })}
                className="w-full bg-gray-700 p-1 rounded-md text-white"
            />

            {/* Background Color */}
            <label className="block mt-2 text-sm">Background Color:</label>
            <input
                type="color"
                value={selectedElement.color || "#0000ff"}
                onChange={(e) => updateElement(selectedElementId, { color: e.target.value })}
                className="w-full"
            />

            {/* Border Color */}
            <label className="block mt-2 text-sm">Border Color:</label>
            <input
                type="color"
                value={selectedElement.borderColor || "#ffffff"}
                onChange={(e) => updateElement(selectedElementId, { borderColor: e.target.value })}
                className="w-full"
            />

            {/* Border Width */}
            <label className="block mt-2 text-sm">Border Width:</label>
            <input
                type="range"
                min="0"
                max="10"
                value={selectedElement.borderWidth || 1}
                onChange={(e) => updateElement(selectedElementId, { borderWidth: Number(e.target.value) })}
                className="w-full"
            />

            {/* Image Upload */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
            />
            <button
                className="mt-4 bg-gray-700 w-full text-white py-2 hover:bg-gray-600"
                onClick={() => fileInputRef.current?.click()}
            >
                🖼️ Upload Background Image
            </button>

            {/* Remove Image Option */}
            {selectedElement.imageSrc && (
                <button
                    className="mt-2 bg-red-600 w-full text-white py-2 hover:bg-red-700"
                    onClick={() => updateElement(selectedElementId, { imageSrc: "" })}
                >
                    ❌ Remove Background Image
                </button>
            )}
        </div>
    );
};

export default PropertiesPanel;
