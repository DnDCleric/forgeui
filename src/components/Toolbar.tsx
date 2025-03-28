import React, { useState, useRef } from "react";
import { useUIStore } from "../store";
import ToolsPanel from "./ToolsPanel";
import { ProjectExplorerRef } from "./ProjectExplorer";

interface ToolbarProps {
    projectExplorerRef: React.RefObject<ProjectExplorerRef | null>;
}

const Toolbar: React.FC<ToolbarProps> = ({ projectExplorerRef }) => {
    const {
        projects,
        files,
        loadFile,
        activeProjectId,
        activeFileId,
        saveCurrentFile,
        recentFiles,
    } = useUIStore();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLoadRecentFile = (fileId: string) => {
        saveCurrentFile(); // Save current file before switching
        loadFile(fileId);
        setIsDropdownOpen(false);
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-700 shadow-lg z-50 flex items-center px-4">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    {/* File Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center gap-2"
                        >
                            <span>File</span>
                            <span className="text-xs">▼</span>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-2">
                                {/* New Project */}
                                <button
                                    onClick={() => {
                                        projectExplorerRef.current?.showNewProject();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <span className="text-green-500">🆕</span>
                                    New Project
                                </button>

                                {/* Load Project */}
                                <button
                                    onClick={() => {
                                        projectExplorerRef.current?.showLoadProject();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <span className="text-blue-500">📂</span>
                                    Load Project
                                </button>

                                {/* Separator */}
                                <hr className="my-2 border-gray-700" />

                                {/* Recent Files */}
                                <div className="px-4 py-1 text-sm text-gray-500">Recent Files</div>
                                {recentFiles.map((fileId) => {
                                    const file = files[fileId];
                                    if (!file) return null;
                                    const project = file.projectId ? projects[file.projectId] : null;

                                    return (
                                        <button
                                            key={fileId}
                                            onClick={() => handleLoadRecentFile(fileId)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <span className="text-yellow-500">📄</span>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{file.name}</span>
                                                {project && (
                                                    <span className="text-xs text-gray-500">
                                                        in {project.name}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Tools Panel */}
                    <div className="flex items-center">
                        <ToolsPanel />
                    </div>

                    {/* Project/File Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 ml-2">
                        {activeProjectId && projects[activeProjectId] && (
                            <>
                                <span className="font-medium">{projects[activeProjectId].name}</span>
                                <span className="text-gray-600">/</span>
                            </>
                        )}
                        {activeFileId && files[activeFileId] && (
                            <span>{files[activeFileId].name}</span>
                        )}
                    </div>
                </div>

                {/* ForgeUI Title */}
                <div className="flex items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        ForgeUI
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
