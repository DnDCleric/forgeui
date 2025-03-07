import React from "react";
import { saveAs } from "file-saver";
import { useUIStore } from "../store";

const ExportButton: React.FC = () => {
    const { elements, addonName } = useUIStore();

    // Generate Lua code
    const generateLuaCode = (): string => {
        let luaCode = `local AceGUI = LibStub("AceGUI-3.0")\n\n`;

        elements.forEach((el) => {
            if (el.type === "Frame") {
                luaCode += `
-- Create Frame
local ${el.id} = AceGUI:Create("Frame")
${el.id}:SetTitle("${addonName} Frame")
${el.id}:SetLayout("Fill")
${el.id}:SetWidth(${el.width})
${el.id}:SetHeight(${el.height})
${el.id}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
\n`;
            } else if (el.type === "Button") {
                luaCode += `
-- Create Button
local ${el.id} = AceGUI:Create("Button")
${el.id}:SetText("Click Me")
${el.id}:SetWidth(${el.width})
${el.id}:SetHeight(${el.height})
${el.id}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
${el.id}:SetCallback("OnClick", function() 
    print("${addonName}: Button Clicked!") 
end)
\n`;
            } else if (el.type === "Text") {
                luaCode += `
-- Create Label
local ${el.id} = AceGUI:Create("Label")
${el.id}:SetText("${el.text || "Default Text"}")
${el.id}:SetPoint("CENTER", UIParent, "CENTER", ${el.x}, ${el.y})
\n`;
            }
        });

        return luaCode.trim();
    };

    // Generate .toc file content
    const generateTocFile = (): string => {
        return `## Interface: 100000
## Title: ${addonName}
## Notes: This is an addon created with ForgeUI
## Author: ForgeUI
## Version: 1.0
## DefaultState: Enabled

${addonName}.lua
`;
    };

    // Handle export
    const handleDownload = () => {
        const luaCode = generateLuaCode();
        const tocFile = generateTocFile();

        const luaBlob = new Blob([luaCode], { type: "text/plain;charset=utf-8" });
        saveAs(luaBlob, `${addonName}.lua`);

        const tocBlob = new Blob([tocFile], { type: "text/plain;charset=utf-8" });
        saveAs(tocBlob, `${addonName}.toc`);
    };

    return (
        <button
            onClick={handleDownload}
            className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 mt-4 rounded text-black font-bold"
        >
            Download Addon Files
        </button>
    );
};

export default ExportButton;
