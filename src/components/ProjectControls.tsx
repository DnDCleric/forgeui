import React from "react";
import { useUIStore } from "../store";

const ProjectControls: React.FC = () => {
    const { saveProject, loadProject } = useUIStore();

    // Handle file selection for loading
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            loadProject(event.target.files[0]);
        }
    };

    return (
        <div className="flex gap-2 mb-4">
            <button
                onClick={saveProject}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
            >
                Save Project
            </button>
            <label className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white cursor-pointer">
                Load Project
                <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
            </label>
        </div>
    );
};

export default ProjectControls;
