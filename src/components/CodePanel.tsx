import React from "react";
import { useUIStore } from "../store";
import ExportButton from "./ExportButton";
import AddonNameInput from "./AddonNameInput";

const CodePanel: React.FC = () => {
    const { elements } = useUIStore();

    // Generate Lua code preview
    const generateLuaCode = (): string => {
        let luaCode = `local AceGUI = LibStub("AceGUI-3.0")\nlocal DF = _G.DetailsFramework\n\n`;

        elements.forEach((el) => {
            const elementName = el.name && el.name.trim() !== "" ? el.name : `Element_${el.id.replace(/-/g, "_")}`;

            if (el.type === "Frame") {
                luaCode += `
-- Create Frame
local ${elementName} = AceGUI:Create("Frame")
${elementName}:SetTitle("${el.text || "Frame"}")
${elementName}:SetLayout("Fill")
${elementName}:SetWidth(${el.width})
${elementName}:SetHeight(${el.height})
${elementName}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
\n`;
            } else if (el.type === "Button") {
                luaCode += `
-- Create Button
local ${elementName} = DF:CreateButton(UIParent, function() print("${el.text || "Button Clicked!"}") end, ${el.width}, ${el.height}, "${el.text || "Click Me"}")
${elementName}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
\n`;
            } else if (el.type === "CheckButton") {
                luaCode += `
-- Create CheckButton
local ${elementName} = DF:CreateCheckBox(UIParent, function(self, state) print("Checkbox state:", state) end, ${el.width}, ${el.height}, nil, nil, nil, nil, nil, nil, "${el.text || "Check Me"}")
${elementName}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
\n`;
            } else if (el.type === "EditBox") {
                luaCode += `
-- Create EditBox
local ${elementName} = AceGUI:Create("EditBox")
${elementName}:SetWidth(${el.width})
${elementName}:SetHeight(${el.height})
${elementName}:SetLabel("${el.text || "Enter Text"}")
${elementName}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
${elementName}:SetCallback("OnEnterPressed", function(widget, event, text) print("User entered:", text) end)
\n`;
            } else if (el.type === "ScrollFrame") {
                luaCode += `
-- Create ScrollFrame
local ${elementName} = CreateFrame("ScrollFrame", nil, UIParent, "UIPanelScrollFrameTemplate")
${elementName}:SetSize(${el.width}, ${el.height})
${elementName}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})

-- Create Scroll Child
local ${elementName}_Child = CreateFrame("Frame", nil, ${elementName})
${elementName}_Child:SetSize(${el.width}, ${el.height * 2}) -- Larger than frame for scrolling
${elementName}:SetScrollChild(${elementName}_Child)
\n`;
            } else if (el.type === "Slider") {
                luaCode += `
-- Create Slider
local ${elementName} = DF:CreateSlider(UIParent, ${el.width}, ${el.height}, ${el.minValue || 0}, ${el.maxValue || 100}, ${el.value || 50}, function(self, value) print("Slider Value:", value) end)
${elementName}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
\n`;
            }
        });

        return luaCode.trim();
    };

    return (
        <div className="bg-gray-900 text-white p-4 border-l border-gray-700 h-full flex flex-col">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4">Generated Lua Code</h2>
            <AddonNameInput />
            <textarea
                className="w-full flex-1 bg-gray-800 text-green-400 p-2 rounded-md font-mono resize-none"
                value={generateLuaCode()}
                readOnly
            />
            <ExportButton />
        </div>
    );
};

export default CodePanel;
