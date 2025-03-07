import React, { useEffect } from "react";
import { useUIStore } from "./store";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";
import CodePanel from "./components/CodePanel";
import ToastManager from "./components/ToastManager";
import Toolbar from "./components/Toolbar.tsx";

const App: React.FC = () => {
    const loadState = useUIStore((state) => state.loadState);

    useEffect(() => {
        loadState();
    }, []);

    return (
        <>
            <Toolbar />
            <ToastManager />
            <div className="relative flex h-screen w-screen">

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
