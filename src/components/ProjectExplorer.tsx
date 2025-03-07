import React from "react";
import { useUIStore } from "../store";

const ProjectExplorer: React.FC = () => {
    const {
        projects,
        files,
        createProject,
        createFile,
        moveFileToProject,
        deleteFile,
        deleteProject,
        activeFileId,
        loadFile,
    } = useUIStore();

    const handleNewProject = () => {
        const name = prompt("Enter project name:");
        if (name) createProject(name);
    };

    const handleNewFile = (projectId?: string) => {
        const name = prompt("Enter file name:");
        if (name) createFile(name, projectId);
    };

    return (
        <div className="absolute left-0 top-0 h-screen w-64 bg-gray-900 text-white p-4 border-r border-gray-700 overflow-y-auto">
            <h2 className="text-lg font-bold mb-2">Projects & Files</h2>

            {/* Buttons */}
            <button className="w-full bg-green-600 hover:bg-green-700 p-2 rounded mb-2" onClick={handleNewProject}>
                ➕ New Project
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded mb-2" onClick={() => handleNewFile()}>
                📄 New File
            </button>

            {/* Standalone Files */}
            <h3 className="text-md font-bold mt-4">Standalone Files</h3>
            {Object.values(files)
                .filter((file) => !file.projectId)
                .map((file) => (
                    <div
                        key={file.id}
                        className={`p-2 cursor-pointer rounded ${activeFileId === file.id ? "bg-gray-700" : "hover:bg-gray-800"}`}
                        onClick={() => loadFile(file.id)}
                    >
                        📄 {file.name}
                    </div>
                ))}

            {/* Projects */}
            <h3 className="text-md font-bold mt-4">Projects</h3>
            {Object.values(projects).map((project) => (
                <div key={project.id} className="mt-2">
                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                        <span>📂 {project.name}</span>
                        <button className="text-red-500 hover:text-red-400" onClick={() => deleteProject(project.id)}>✖</button>
                    </div>
                    <div className="ml-4 mt-2">
                        {project.files.map((fileId) => {
                            const file = files[fileId];
                            return (
                                <div
                                    key={file.id}
                                    className={`p-2 cursor-pointer rounded ${activeFileId === file.id ? "bg-gray-700" : "hover:bg-gray-800"}`}
                                    onClick={() => loadFile(file.id)}
                                >
                                    📄 {file.name}
                                    <button
                                        className="ml-2 text-yellow-400 hover:text-yellow-300"
                                        onClick={() => moveFileToProject(file.id, "")}
                                    >
                                        ↩ Move Out
                                    </button>
                                    <button
                                        className="ml-2 text-red-400 hover:text-red-300"
                                        onClick={() => deleteFile(file.id)}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 p-1 mt-1 rounded"
                        onClick={() => handleNewFile(project.id)}
                    >
                        ➕ Add File
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ProjectExplorer;
