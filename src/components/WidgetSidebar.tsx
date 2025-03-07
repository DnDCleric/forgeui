import React, { useRef } from "react";
import { useUIStore } from "../store";
import { v4 as uuidv4 } from "uuid";

const WidgetSidebar: React.FC = () => {
    const addElement = useUIStore((state) => state.addElement);


    const handleAddElement = (type: UIElement["type"]) => {
        const newElement = {
            id: uuidv4(),
            type,
            x: 50,
            y: 50,
            width: type === "Button" ? 120 : 200,
            height: type === "Button" ? 40 : 150,
            color: "rgba(0, 0, 255, 0.5)",
            borderColor: "#ffffff",
            borderWidth: 1,
            imageSrc: "",
            text: type === "Button" ? "Click Me" : type === "EditBox" ? "Enter text..." : undefined,
            checked: type === "CheckButton" ? false : undefined,
            minValue: type === "Slider" ? 0 : undefined,
            maxValue: type === "Slider" ? 100 : undefined,
            value: type === "Slider" ? 50 : undefined,
        };

        addElement(newElement);
    };

    return (
        <div className="bg-gray-900 p-4 border border-gray-700 rounded-md mt-4">
            <h3 className="text-lg font-bold">Widgets</h3>

            <div className="grid gap-2 mt-2">
                <button className="bg-gray-700" onClick={() => handleAddElement("Frame")}>
                    ➕ Add Frame
                </button>
                <button className="bg-gray-700" onClick={() => handleAddElement("Button")}>
                    ➕ Add Button
                </button>
                <button className="bg-gray-700" onClick={() => handleAddElement("Text")}>
                    ➕ Add Text
                </button>
                <button className="bg-gray-700" onClick={() => handleAddElement("CheckButton")}>
                    ✅ CheckButton
                </button>
                <button className="bg-gray-700" onClick={() => handleAddElement("EditBox")}>
                    ✏️ EditBox
                </button>
                <button className="bg-gray-700" onClick={() => handleAddElement("ScrollFrame")}>
                    📜 ScrollFrame
                </button>
                <button className="bg-gray-700" onClick={() => handleAddElement("Slider")}>
                    🎚 Slider
                </button>
            </div>
        </div>
    );
};

export default WidgetSidebar;
