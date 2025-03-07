import React, { useEffect, useState } from "react";
import { useUIStore } from "./store";
import Sidebar from "./components/Sidebar";
import ProjectExplorer from "./components/ProjectExplorer";
import Canvas from "./components/Canvas";
import CodePanel from "./components/CodePanel";
import ToastManager from "./components/ToastManager";
import Toolbar from "./components/Toolbar.tsx";

const App: React.FC = () => {
    const loadState = useUIStore((state) => state.loadState);
    const [showProjectExplorer, setShowProjectExplorer] = useState(true);

    useEffect(() => {
        loadState();
    }, []);

    return (
        <>
            <Toolbar />
            <ToastManager />
            <div className="relative flex h-screen w-screen">
                {/* Toggle Button for Project Explorer */}
                <button
                    className="absolute top-4 left-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded z-50"
                    onClick={() => setShowProjectExplorer((prev) => !prev)}
                >
                    {showProjectExplorer ? "❌ Hide" : "📂 Show"} Projects
                </button>

                {/* Project Explorer Sidebar (Collapsible) */}
                {showProjectExplorer && <ProjectExplorer />}

                {/* Sidebar (Existing UI) */}
                <Sidebar />

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
