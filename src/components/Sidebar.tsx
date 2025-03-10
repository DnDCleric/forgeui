import React from "react";
import WidgetSidebar from "./WidgetSidebar";
import ElementProperties from "./ElementProperties";
import AlignmentTools from "./AlignmentTools";
import GridSettings from "./GridSettings";
import ProjectExplorer from "./ProjectExplorer";
import { ProjectExplorerRef } from "./ProjectExplorer";

interface SidebarProps {
    projectExplorerRef: React.RefObject<ProjectExplorerRef | null>;
}

const Sidebar: React.FC<SidebarProps> = ({ projectExplorerRef }) => {
    return (
        <div className="flex flex-col h-full w-full bg-gray-900">
            <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
                <div className="p-4 space-y-4 text-white">
                    <div className="space-y-4">
                        <ProjectExplorer ref={projectExplorerRef} />
                        <WidgetSidebar />
                        <ElementProperties />
                        <AlignmentTools />
                        <GridSettings />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
