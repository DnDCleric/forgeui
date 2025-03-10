import React, { useEffect, useRef } from "react";
import { useUIStore } from "./store";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import CodePanel from "./components/CodePanel";
import ToastManager from "./components/ToastManager";
import Toolbar from "./components/Toolbar";
import { ProjectExplorerRef } from "./components/ProjectExplorer";

const App: React.FC = () => {
    const loadState = useUIStore((state) => state.loadState);
    const projectExplorerRef = useRef<ProjectExplorerRef>(null);

    // Only run once on initial mount
    useEffect(() => {
        loadState();
    }, []); // Empty dependency array ensures this only runs once

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            {/* Fixed position elements */}
            <Toolbar projectExplorerRef={projectExplorerRef} />
            <ToastManager />
            
            {/* Main content */}
            <div className="flex flex-1 pt-14">
                {/* Left sidebar */}
                <div className="flex flex-col w-64 min-w-64 border-r border-gray-700 h-[calc(100vh-3.5rem)]">
                    <Sidebar projectExplorerRef={projectExplorerRef} />
                </div>

                {/* Main Canvas */}
                <div className="flex-1 relative bg-gray-800 overflow-hidden">
                    <Canvas />
                </div>

                {/* Right sidebar */}
                <div className="w-64 min-w-64 border-l border-gray-700 overflow-y-auto">
                    <CodePanel />
                </div>
            </div>
        </div>
    );
};

export default App;
