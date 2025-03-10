import React, { forwardRef, ForwardRefRenderFunction } from "react";
import { UIElement, useUIStore } from "../store";
import { v4 as uuidv4 } from "uuid";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";

const WidgetSidebar: React.FC = () => {
    const addElement = useUIStore((state) => state.addElement);

    const handleAddElement = (type: UIElement["type"]) => {
        const { elements, selectedElementIds } = useUIStore.getState();
        
        // Find selected container (Frame or Section)
        let parentId: string | undefined;
        if (selectedElementIds.length === 1) {
            const selectedElement = elements.find(el => el.id === selectedElementIds[0]);
            if (selectedElement?.isContainer) {
                parentId = selectedElement.id;
            }
        }

        // Only allow non-container elements to be created if there's a selected container
        if (!parentId && type !== "Frame" && type !== "Section") {
            toast.error("Please select a Frame or Section first");
            return;
        }

        const newElement = {
            id: uuidv4(),
            type,
            x: parentId ? 0 : 50, // If has parent, position relative to parent
            y: parentId ? 0 : 50,
            width: type === "Button" ? 120 : 200,
            height: type === "Button" ? 40 : 150,
            color: "rgba(0, 0, 255, 0.5)",
            borderColor: "#ffffff",
            borderWidth: 1,
            imageSrc: "",
            text: type === "Button" ? "Click Me" : type === "EditBox" ? "Enter text..." : undefined,
            minValue: type === "Slider" ? 0 : undefined,
            maxValue: type === "Slider" ? 100 : undefined,
            value: type === "Slider" ? 50 : undefined,
            parentId,
            childIds: [],
        };

        addElement(newElement);
    };

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Widgets</h3>

            <div className="grid gap-2 mt-2">
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => handleAddElement("Frame")}>
                    ➕ Add Frame
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => handleAddElement("Button")}>
                    ➕ Add Button
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => handleAddElement("Text")}>
                    ➕ Add Text
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => handleAddElement("CheckButton")}>
                    ✅ CheckButton
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => handleAddElement("EditBox")}>
                    <FaEdit className="mr-2" /> EditBox
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => handleAddElement("ScrollFrame")}>
                    📜 ScrollFrame
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded" onClick={() => handleAddElement("Slider")}>
                    🎚 Slider
                </button>
            </div>
        </div>
    );
};

export default WidgetSidebar;
