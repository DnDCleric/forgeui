import React, { useState, useRef, useEffect } from "react";
import { useUIStore } from "../store";
import Modal from "./Modal";
import ToolsPanel from "./ToolsPanel.tsx";

const Toolbar: React.FC = () => {
    const saveFile = useUIStore((state) => state.saveFile);
    const loadFile = useUIStore((state) => state.loadFile);
    const clearCanvas = useUIStore((state) => state.clearCanvas);
    const newFile = useUIStore((state) => state.newFile);
    const fileName = useUIStore((state) => state.fileName);
    const setFileName = useUIStore((state) => state.setFileName);
    const recentFiles = useUIStore((state) => state.recentFiles);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            {/* Fixed Top Navbar */}
                <div className="fixed top-0 left-0 w-full bg-gray-900 text-white flex items-center justify-between px-4 py-2 border-b border-gray-700 z-200">
                    <div className="flex items-center gap-4">
                        {/* File Dropdown */}
                        <div className="w-100">
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="px-4 py-2bg-gray-800 hover:bg-gray-700 rounded-md"
                                >
                                    File ▼
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg">
                                        <button
                                            onClick={() => {
                                                newFile();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                                        >
                                            🆕 New
                                        </button>
                                        <button
                                            onClick={() => {
                                                saveFile(); // ✅ Always save on manual click
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                                        >
                                            💾 Save
                                        </button>

                                        {/* Separator */}
                                        <hr className="border-gray-700 my-1" />

                                        {/* Recent Files Section */}
                                        {recentFiles.length > 0 && (
                                            <>
                                                <span className="px-4 py-2 text-gray-400 text-xs block">Recent Files</span>
                                                {recentFiles.map((file) => (
                                                    <button
                                                        key={file}
                                                        onClick={() => {
                                                            loadFile(file);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                                                    >
                                                        📁 {file}
                                                    </button>
                                                ))}
                                            </>
                                        )}

                                        {/* Separator */}
                                        <hr className="border-gray-700 my-1" />

                                        <button
                                            onClick={() => {
                                                setShowConfirm(true);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-red-700 text-red-400"
                                        >
                                            ❌ Clear Canvas
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>


                        <input
                            type="text"
                            className="px-3 py-2 mr-4 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-150"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                        <ToolsPanel />

                    </div>

                    {/* Centered App Name */}
                    <h1 className="text-lg font-bold text-gray-300">ForgeUI</h1>
                </div>

            {/* Confirmation Modal for Clearing Canvas */}
                {showConfirm && (
                    <Modal
                        title="Confirm Clear Canvas"
                        message="Are you sure you want to clear everything?"
                        onClose={() => setShowConfirm(false)}
                        onConfirm={() => {
                            clearCanvas();
                            setShowConfirm(false);
                        }}
                        confirmText="Clear"
                        confirmColor="bg-red-600 hover:bg-red-700"
                    />
                )}
        </>
    );
};

export default Toolbar;
