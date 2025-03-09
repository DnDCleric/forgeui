import React, { useEffect, useRef } from "react";
import { useUIStore } from "./store";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import CodePanel from "./components/CodePanel";
import ToastManager from "./components/ToastManager";
import Toolbar from "./components/Toolbar";
import ProjectExplorer, { ProjectExplorerRef } from "./components/ProjectExplorer";

const App: React.FC = () => {
    const loadState = useUIStore((state) => state.loadState);
    const projectExplorerRef = useRef<ProjectExplorerRef>(null);

    // Only run once on initial mount
    useEffect(() => {
        loadState();
    }, []); // Empty dependency array ensures this only runs once

    return (
        <>
            <Toolbar projectExplorerRef={projectExplorerRef} />
            <ToastManager />
            <div className="relative flex h-screen w-screen">
                <div className="flex flex-col w-64">
                    <ProjectExplorer ref={projectExplorerRef} />
                    <Sidebar />
                </div>

                {/* Main Canvas */}
                <div className="flex-1 h-screen overflow-hidden relative">
                    <Canvas />
                </div>

                {/* Right Sidebar (Code Panel) */}
                <CodePanel />
            </div>
        </>
    );
};

export default App;
