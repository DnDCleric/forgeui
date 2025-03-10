import React, { useRef, useState, useEffect } from "react";
import { useUIStore } from "../store";
import { UIElement } from "../store";
import { FaImage, FaTrash, FaTimesCircle, FaArrowUp, FaList } from "react-icons/fa";

const ElementProperties: React.FC = () => {
    const selectedElementIds = useUIStore((state) => state.selectedElementIds);
    const elements = useUIStore((state) => state.elements);
    const updateElement = useUIStore((state) => state.updateElement);
    const deleteElement = useUIStore((state) => state.deleteElement);
    const clearSelection = useUIStore((state) => state.clearSelection);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tempWidth, setTempWidth] = useState<string>("");
    const [tempHeight, setTempHeight] = useState<string>("");
    const setSelectedElements = useUIStore((state) => state.setSelectedElements);

    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

    // Get common properties across all selected elements
    const getCommonProperties = () => {
        if (selectedElements.length === 0) return null;

        const firstElement = selectedElements[0];
        const commonProps: Partial<UIElement> = {
            width: firstElement.width,
            height: firstElement.height,
            color: firstElement.color,
            borderColor: firstElement.borderColor,
            borderWidth: firstElement.borderWidth,
            opacity: firstElement.opacity,
            imageSrc: firstElement.imageSrc
        };

        // Check which properties are common across all elements
        for (let i = 1; i < selectedElements.length; i++) {
            const element = selectedElements[i];
            Object.keys(commonProps).forEach(key => {
                if (commonProps[key as keyof typeof commonProps] !== element[key as keyof UIElement]) {
                    delete commonProps[key as keyof typeof commonProps];
                }
            });
        }

        return commonProps;
    };

    const commonProps = getCommonProperties();

    useEffect(() => {
        if (commonProps) {
            setTempWidth(String(commonProps.width || ""));
            setTempHeight(String(commonProps.height || ""));
        }
    }, [selectedElementIds, commonProps]);

    if (selectedElements.length === 0) {
        return <div className="p-4 text-gray-400">No element selected</div>;
    }

    const updateAllSelected = (updates: Partial<UIElement>) => {
        selectedElementIds.forEach(id => {
            updateElement(id, updates);
        });
    };

    const enforceMinMax = (key: "width" | "height") => {
        let value = key === "width" ? parseInt(tempWidth, 10) : parseInt(tempHeight, 10);
        if (isNaN(value)) value = 5;
        value = Math.max(5, Math.min(1500, value));

        updateAllSelected({ [key]: value });

        if (key === "width") setTempWidth(String(value));
        if (key === "height") setTempHeight(String(value));
    };

    // Handle Enter Key Press for Inputs
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, commitFn: () => void) => {
        if (e.key === "Enter") {
            commitFn();
            e.currentTarget.blur();
        }
    };

    // Handle Image Upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                updateAllSelected({ imageSrc: reader.result });
            }
        };

        reader.readAsDataURL(file);
        event.target.value = "";
    };

    // Handle Removing Image
    const handleRemoveImage = () => {
        updateAllSelected({ imageSrc: "" });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeleteSelected = () => {
        if (selectedElementIds.length === 0) return;
        
        // Delete each element one by one
        selectedElementIds.forEach(id => {
            deleteElement(id);
        });
        
        // Clear the selection after all deletions are complete
        clearSelection();
    };

    // Function to get parent element
    const getParentElement = (element: UIElement) => {
        if (!element.parentId) return null;
        return elements.find(el => el.id === element.parentId);
    };

    // Function to get child elements
    const getChildElements = (element: UIElement) => {
        return elements.filter(el => element.childIds.includes(el.id));
    };

    // Function to select parent
    const handleSelectParent = (element: UIElement) => {
        const parent = getParentElement(element);
        if (parent) {
            setSelectedElements([parent.id]);
        }
    };

    // Function to select a child
    const handleSelectChild = (childId: string) => {
        setSelectedElements([childId]);
    };

    // Add parent/child relationship section to the render
    const renderParentChildSection = () => {
        if (selectedElements.length !== 1) return null;
        const element = selectedElements[0];
        const parent = getParentElement(element);
        const children = getChildElements(element);

        return (
            <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Relationships</h4>
                
                {/* Parent Section */}
                {parent && (
                    <div className="mb-2">
                        <div className="text-sm text-gray-400">Parent:</div>
                        <button
                            className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded mt-1 flex items-center gap-2"
                            onClick={() => handleSelectParent(element)}
                        >
                            <FaArrowUp className="text-gray-400" />
                            <span>{parent.name || `${parent.type} (${parent.id.slice(0, 8)})`}</span>
                        </button>
                    </div>
                )}

                {/* Children Section */}
                {element.isContainer && children.length > 0 && (
                    <div className="mt-2">
                        <div className="text-sm text-gray-400">Children:</div>
                        <div className="space-y-1 mt-1">
                            {children.map(child => (
                                <button
                                    key={child.id}
                                    className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2"
                                    onClick={() => handleSelectChild(child.id)}
                                >
                                    <FaList className="text-gray-400" />
                                    <span>{child.name || `${child.type} (${child.id.slice(0, 8)})`}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md mt-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    {selectedElements.length > 1 ? `${selectedElements.length} Elements Selected` : "Element Properties"}
                </h3>
                <button
                    onClick={clearSelection}
                    className="text-sm text-gray-400 hover:text-white"
                >
                    Clear Selection
                </button>
            </div>

            {/* Width - only show if common across all elements */}
            {commonProps?.width !== undefined && (
                <>
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
                </>
            )}

            {/* Height - only show if common across all elements */}
            {commonProps?.height !== undefined && (
                <>
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
                </>
            )}

            {/* Opacity Slider */}
            <label className="block mt-2 text-sm">Opacity:</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={commonProps?.opacity ?? 1}
                onChange={(e) => updateAllSelected({ opacity: Number(e.target.value) })}
                className="w-full"
            />

            {/* Background Color - only show if common across all elements */}
            {commonProps?.color !== undefined && (
                <>
                    <label className="block mt-2 text-sm">Background Color:</label>
                    <input
                        type="color"
                        value={commonProps.color}
                        onChange={(e) => updateAllSelected({ color: e.target.value })}
                        className="w-full"
                    />
                </>
            )}

            {/* Border Color - only show if common across all elements */}
            {commonProps?.borderColor !== undefined && (
                <>
                    <label className="block mt-2 text-sm">Border Color:</label>
                    <input
                        type="color"
                        value={commonProps.borderColor}
                        onChange={(e) => updateAllSelected({ borderColor: e.target.value })}
                        className="w-full"
                    />
                </>
            )}

            {/* Border Width - only show if common across all elements */}
            {commonProps?.borderWidth !== undefined && (
                <>
                    <label className="block mt-2 text-sm">Border Width:</label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={commonProps.borderWidth}
                        onChange={(e) => updateAllSelected({ borderWidth: Number(e.target.value) })}
                        className="w-full"
                    />
                </>
            )}

            {/* Image Upload */}
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
            />
            <button 
                className="mt-4 bg-gray-700 w-full text-white py-2 hover:bg-gray-600 rounded flex items-center justify-center gap-2" 
                onClick={() => fileInputRef.current?.click()}
            >
                <FaImage /> Upload Background Image
            </button>

            {/* Remove Image Option - only show if all selected elements have images */}
            {commonProps?.imageSrc && (
                <button 
                    className="mt-2 bg-red-600 w-full text-white py-2 hover:bg-red-700 rounded flex items-center justify-center gap-2" 
                    onClick={handleRemoveImage}
                >
                    <FaTimesCircle /> Remove Background Image
                </button>
            )}

            {/* Add the parent/child relationship section */}
            {renderParentChildSection()}

            {/* Delete Selected Elements Button */}
            <button
                className="mt-4 bg-red-600 w-full text-white py-2 hover:bg-red-700 rounded flex items-center justify-center gap-2"
                onClick={handleDeleteSelected}
            >
                <FaTrash /> Delete Selected {selectedElements.length > 1 ? `(${selectedElements.length})` : "Element"}
            </button>
        </div>
    );
};

export default ElementProperties;
