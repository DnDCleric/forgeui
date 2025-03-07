import React, { useRef, useState, useEffect } from "react";
import { useUIStore } from "../store";

const ElementProperties: React.FC = () => {
    const selectedElementId = useUIStore((state) => state.selectedElementId);
    const elements = useUIStore((state) => state.elements);
    const updateElement = useUIStore((state) => state.updateElement);
    const validateName = useUIStore((state) => state.validateName);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [tempWidth, setTempWidth] = useState<string>("");
    const [tempHeight, setTempHeight] = useState<string>("");
    const [tempName, setTempName] = useState<string>("");

    const selectedElement = elements.find((el) => el.id === selectedElementId);

    useEffect(() => {
        if (selectedElement) {
            setTempWidth(String(selectedElement.width));
            setTempHeight(String(selectedElement.height));
            setTempName(selectedElement.name || "");
        }
    }, [selectedElement?.width, selectedElement?.height, selectedElement?.name]);

    if (!selectedElement) return <div className="p-4 text-gray-400">No element selected</div>;

    const enforceMinMax = (key: "width" | "height") => {
        let value = key === "width" ? parseInt(tempWidth, 10) : parseInt(tempHeight, 10);
        if (isNaN(value)) value = 5;
        value = Math.max(5, Math.min(1500, value));

        updateElement(selectedElementId, { [key]: value });

        if (key === "width") setTempWidth(String(value));
        if (key === "height") setTempHeight(String(value));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempName(e.target.value);
    };

    const commitNameChange = () => {
        const newName = tempName.trim().replace(/\s+/g, "_");

        if (!newName) {
            updateElement(selectedElementId, { name: "" });
            setNameError(null);
            return;
        }

        if (!newName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
            setNameError("Invalid name. Must start with a letter and contain only letters, numbers, or underscores.");
            return;
        }

        if (validateName(newName, selectedElementId)) {
            updateElement(selectedElementId, { name: newName });
            setNameError(null);
        } else {
            setNameError("Name already taken in this scope.");
        }
    };

    // ✅ Handle Enter Key Press for Inputs
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, commitFn: () => void) => {
        if (e.key === "Enter") {
            commitFn();
            e.currentTarget.blur(); // Ensure blur event is triggered
        }
    };

    // ✅ Handle Image Upload
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
        event.target.value = "";
    };

    // ✅ Handle Removing Image
    const handleRemoveImage = () => {
        updateElement(selectedElementId, { imageSrc: null });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ✅ Scale Slider: Adjusts Width & Height Proportionally
    const handleScaleChange = (scaleFactor: number) => {
        const newWidth = Math.floor(Math.max(5, Math.min(1500, selectedElement.width * (scaleFactor / 100))));
        const newHeight = Math.floor(Math.max(5, Math.min(1500, selectedElement.height * (scaleFactor / 100))));

        updateElement(selectedElementId, {
            width: newWidth,
            height: newHeight,
        });
    };

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md mt-4">
            <h3 className="text-lg font-bold">Element Properties</h3>

            {/* Element Name */}
            <label className="block mt-2 text-sm">Element Name:</label>
            <input
                type="text"
                value={tempName}
                onChange={handleNameChange}
                onBlur={commitNameChange}
                onKeyDown={(e) => handleKeyPress(e, commitNameChange)}
                className="w-full p-2 border bg-gray-800 text-white rounded"
                placeholder="Enter name"
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}

            {/* Width */}
            <label className="block mt-2 text-sm">Width:</label>
            <input
                type="number"
                value={tempWidth}
                onChange={(e) => setTempWidth(e.target.value)}
                onBlur={() => enforceMinMax("width")}
                onKeyDown={(e) => handleKeyPress(e, () => enforceMinMax("width"))}
                className="w-full p-2 border bg-gray-800 text-white rounded"
                placeholder="Enter width (5-1500)"
            />

            {/* Height */}
            <label className="block mt-2 text-sm">Height:</label>
            <input
                type="number"
                value={tempHeight}
                onChange={(e) => setTempHeight(e.target.value)}
                onBlur={() => enforceMinMax("height")}
                onKeyDown={(e) => handleKeyPress(e, () => enforceMinMax("height"))}
                className="w-full p-2 border bg-gray-800 text-white rounded"
                placeholder="Enter height (5-1500)"
            />

            {/* Scale Slider */}
            {/*<label className="block mt-4 text-sm">Scale:</label>*/}
            {/*<input*/}
            {/*    type="range"*/}
            {/*    min="5"*/}
            {/*    max="50"*/}
            {/*    step="5"*/}
            {/*    value={((selectedElement.width + selectedElement.height) / 2) || 100}*/}
            {/*    onChange={(e) => handleScaleChange(Number(e.target.value))}*/}
            {/*    className="w-full"*/}
            {/*/>*/}

            {/* Opacity Slider */}
            <label className="block mt-2 text-sm">Opacity:</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedElement.opacity ?? 1}
                onChange={(e) => updateElement(selectedElementId, { opacity: Number(e.target.value) })}
                className="w-full"
            />

            {/* Background Color Picker */}
            <label className="block mt-2 text-sm">Background Color:</label>
            <input
                type="color"
                value={selectedElement.color || "#ffffff"}
                onChange={(e) => updateElement(selectedElementId, { color: e.target.value })}
                className="w-full"
            />

            {/* Border Color Picker */}
            <label className="block mt-2 text-sm">Border Color:</label>
            <input
                type="color"
                value={selectedElement.borderColor || "#000000"}
                onChange={(e) => updateElement(selectedElementId, { borderColor: e.target.value })}
                className="w-full"
            />

            {/* Image Upload */}
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button className="mt-4 bg-gray-700 w-full text-white py-2 hover:bg-gray-600" onClick={() => fileInputRef.current?.click()}>
                🖼️ Upload Background Image
            </button>

            {/* Remove Image Option */}
            {selectedElement.imageSrc && (
                <button className="mt-2 bg-red-600 w-full text-white py-2 hover:bg-red-700" onClick={handleRemoveImage}>
                    ❌ Remove Background Image
                </button>
            )}
        </div>
    );
};

export default ElementProperties;
