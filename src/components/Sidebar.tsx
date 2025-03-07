import React from "react";
import WidgetSidebar from "./WidgetSidebar";
import ElementProperties from "./ElementProperties";
import AlignmentTools from "./AlignmentTools";
import GridSettings from "./GridSettings";
import ToolsPanel from "./ToolsPanel.tsx";

const Sidebar: React.FC = () => {
    return (
        <div className="bg-gray-900 text-white w-64 h-screen overflow-y-auto p-4 border-r border-gray-700 fixed left-0 top-0 z-50 shadow-lg custom-scrollbar">
            <div className="pt-15">

                <WidgetSidebar />
                <ElementProperties />
                <AlignmentTools />
                <GridSettings />
            </div>

        </div>
    );
};

export default Sidebar;
