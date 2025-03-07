import React, { useState } from "react";
import { useUIStore } from "../store";
import toast from "react-hot-toast";
import Modal from "./Modal";


const Toolbar: React.FC = () => {
    const { createProject, projects, loadProject } = useUIStore();
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [showLoadProjectModal, setShowLoadProjectModal] = useState(false);

    const handleNewProject = () => {
        if (!newProjectName.trim()) {
            toast.error("Project name cannot be empty.");
            return;
        }
        if (Object.values(projects).some((p) => p.name.toLowerCase() === newProjectName.toLowerCase())) {
            toast.error("A project with this name already exists.");
            return;
        }
        createProject(newProjectName);
        setNewProjectName("");
        setShowProjectModal(false);
        toast.success(`Project "${newProjectName}" created.`);
    };

    return (
        <div className="flex bg-gray-800 p-2 text-white">
            <div className="relative">
                <button className="px-4 py-2 hover:bg-gray-700 rounded">File</button>
                <div className="absolute left-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded shadow-lg">
                    <button className="block w-full px-4 py-2 text-left hover:bg-gray-700" onClick={() => setShowProjectModal(true)}>
                        ➕ New Project
                    </button>
                    <button className="block w-full px-4 py-2 text-left hover:bg-gray-700" onClick={() => setShowLoadProjectModal(true)}>
                        📂 Load Project
                    </button>
                </div>
            </div>

            {/* New Project Modal */}
            {showProjectModal && (
                <Modal
                    title="Create New Project"
                    message="Enter a unique project name:"
                    onClose={() => setShowProjectModal(false)}
                    onConfirm={handleNewProject}
                    confirmText="Create"
                    confirmColor="bg-green-600 hover:bg-green-700"
                >
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full p-2 border bg-gray-800 text-white rounded mt-2"
                        placeholder="Enter project name..."
                    />
                </Modal>
            )}

            {/* Load Project Modal */}
            {showLoadProjectModal && (
                <Modal
                    title="Load Project"
                    message="Select a project to load:"
                    onClose={() => setShowLoadProjectModal(false)}
                    confirmText="Load"
                    confirmColor="bg-blue-600 hover:bg-blue-700"
                >
                    <select
                        className="w-full p-2 border bg-gray-800 text-white rounded mt-2"
                        onChange={(e) => loadProject(e.target.value)}
                    >
                        <option value="">-- Select Project --</option>
                        {Object.values(projects).map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </Modal>
            )}
        </div>
    );
};

export default Toolbar;
