import React, { useState, useEffect, forwardRef, ForwardRefRenderFunction } from "react";
import { useUIStore } from "../store";
import Modal from "./Modal";
import { HiDotsVertical, HiFolder, HiDocument } from "react-icons/hi";
import toast from "react-hot-toast";

interface DropdownMenuProps {
    onEdit: () => void;
    onDelete: () => void;
    onMoveToProject?: () => void;
    className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onEdit, onDelete, onMoveToProject, className }) => (
    <div className={`absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50 ${className}`}>
        <button
            onClick={onEdit}
            className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
        >
            <span>✏️ Edit</span>
        </button>
        {onMoveToProject && (
            <button
                onClick={onMoveToProject}
                className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center gap-2"
            >
                <span>📦 Move to Project</span>
            </button>
        )}
        <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2 hover:bg-red-700 text-red-400 flex items-center gap-2"
        >
            <span>🗑️ Delete</span>
        </button>
    </div>
);

// Export the ref type for TypeScript support
export interface ProjectExplorerRef {
    showNewProject: () => void;
    showLoadProject: () => void;
}

const ProjectExplorer: ForwardRefRenderFunction<ProjectExplorerRef, {}> = (props, ref) => {
    const {
        projects,
        files,
        createProject,
        createFile,
        renameProject,
        renameFile,
        deleteProject,
        deleteFile,
        moveFileToProject,
        loadFile,
        loadProject,
        activeProjectId,
        activeFileId,
        saveCurrentFile,
        validateProjectName,
        validateFileName,
    } = useUIStore();

    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showLoadProjectModal, setShowLoadProjectModal] = useState(false);
    const [showNewFileModal, setShowNewFileModal] = useState(false);
    const [showRenameProjectModal, setShowRenameProjectModal] = useState(false);
    const [showRenameFileModal, setShowRenameFileModal] = useState(false);
    const [showMoveFileModal, setShowMoveFileModal] = useState(false);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
    const [showPostDeleteModal, setShowPostDeleteModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Show project modal on first load if no projects exist
    useEffect(() => {
        if (!Object.keys(projects).length) {
            setShowNewProjectModal(true);
        }
    }, [projects]);

    const handleCreateProject = () => {
        if (!newProjectName.trim()) {
            toast.error("Project name cannot be empty");
            return;
        }
        if (!validateProjectName(newProjectName)) {
            toast.error("Project name must be unique");
            return;
        }
        createProject(newProjectName);
        setNewProjectName("");
        setShowNewProjectModal(false);
        toast.success("Project created");
    };

    const handleLoadProject = (projectId: string) => {
        saveCurrentFile(); // Save current file before switching
        loadProject(projectId);
        setShowLoadProjectModal(false);
        toast.success("Project loaded");
    };

    const handleCreateFile = () => {
        if (!newFileName.trim()) {
            toast.error("File name cannot be empty");
            return;
        }
        if (selectedProjectId && !validateFileName(newFileName, selectedProjectId)) {
            toast.error("File name must be unique within the project");
            return;
        }
        createFile(newFileName, selectedProjectId || undefined);
        setNewFileName("");
        setShowNewFileModal(false);
        toast.success("File created");
    };

    const handleRenameProject = () => {
        if (!selectedProjectId) return;
        if (!newProjectName.trim()) {
            toast.error("Project name cannot be empty");
            return;
        }
        if (!validateProjectName(newProjectName, selectedProjectId)) {
            toast.error("Project name must be unique");
            return;
        }
        renameProject(selectedProjectId, newProjectName);
        setNewProjectName("");
        setShowRenameProjectModal(false);
        toast.success("Project renamed");
    };

    const handleRenameFile = () => {
        if (!selectedFileId) return;
        const file = files[selectedFileId];
        if (!file) return;
        if (!newFileName.trim()) {
            toast.error("File name cannot be empty");
            return;
        }
        if (file.projectId && !validateFileName(newFileName, file.projectId, selectedFileId)) {
            toast.error("File name must be unique within the project");
            return;
        }
        renameFile(selectedFileId, newFileName);
        setNewFileName("");
        setShowRenameFileModal(false);
        toast.success("File renamed");
    };

    const handleMoveFile = (targetProjectId: string) => {
        if (!selectedFileId) return;
        moveFileToProject(selectedFileId, targetProjectId);
        setShowMoveFileModal(false);
        toast.success("File moved");
    };

    const handleDeleteProject = () => {
        if (!selectedProjectId) return;
        
        // Store remaining projects before deletion
        const remainingProjects = Object.keys(projects).filter(id => id !== selectedProjectId);
        
        deleteProject(selectedProjectId);
        setShowDeleteProjectModal(false);

        // If there are remaining projects, show the post-delete modal
        if (remainingProjects.length > 0) {
            setShowPostDeleteModal(true);
        }
        // If no projects remain, the createProject modal will show automatically
        // due to our existing useEffect in Toolbar
    };

    const handleDeleteFile = () => {
        if (!selectedFileId) return;
        deleteFile(selectedFileId);
        setShowDeleteFileModal(false);
        toast.success("File deleted");
    };

    const handleFileClick = (fileId: string) => {
        saveCurrentFile();
        loadFile(fileId);
    };

    // Expose these functions to be used by other components
    React.useImperativeHandle(ref, () => ({
        showNewProject: () => setShowNewProjectModal(true),
        showLoadProject: () => setShowLoadProjectModal(true),
    }));

    return (
        <div className="bg-gray-900 text-white p-4 border-r border-gray-700 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Projects</h2>
                <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded"
                    title="New Project"
                >
                    <span>+</span>
                </button>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                {Object.values(projects)
                    .sort((a, b) => b.lastModified - a.lastModified)
                    .map((project) => (
                        <div key={project.id} className="border border-gray-700 rounded-md">
                            {/* Project Header */}
                            <div className="flex items-center justify-between p-2 bg-gray-800">
                                <div className="flex items-center gap-2">
                                    <HiFolder className="text-blue-500" />
                                    <span>{project.name}</span>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenDropdownId(openDropdownId === project.id ? null : project.id)}
                                        className="p-1 hover:bg-gray-700 rounded"
                                    >
                                        <HiDotsVertical />
                                    </button>
                                    {openDropdownId === project.id && (
                                        <DropdownMenu
                                            onEdit={() => {
                                                setSelectedProjectId(project.id);
                                                setNewProjectName(project.name);
                                                setShowRenameProjectModal(true);
                                                setOpenDropdownId(null);
                                            }}
                                            onDelete={() => {
                                                setSelectedProjectId(project.id);
                                                setShowDeleteProjectModal(true);
                                                setOpenDropdownId(null);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Files List */}
                            <div className="p-2 space-y-1">
                                {project.files.map((fileId) => {
                                    const file = files[fileId];
                                    if (!file) return null;

                                    return (
                                        <div
                                            key={fileId}
                                            className={`flex items-center justify-between p-2 rounded ${
                                                activeFileId === fileId ? "bg-blue-900" : "hover:bg-gray-800"
                                            }`}
                                        >
                                            <button
                                                className="flex items-center gap-2 flex-1 text-left"
                                                onClick={() => handleFileClick(fileId)}
                                            >
                                                <HiDocument className="text-yellow-500" />
                                                <span>{file.name}</span>
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === fileId ? null : fileId)}
                                                    className="p-1 hover:bg-gray-700 rounded"
                                                >
                                                    <HiDotsVertical />
                                                </button>
                                                {openDropdownId === fileId && (
                                                    <DropdownMenu
                                                        className="right-0"
                                                        onEdit={() => {
                                                            setSelectedFileId(fileId);
                                                            setNewFileName(file.name);
                                                            setShowRenameFileModal(true);
                                                            setOpenDropdownId(null);
                                                        }}
                                                        onDelete={() => {
                                                            setSelectedFileId(fileId);
                                                            setShowDeleteFileModal(true);
                                                            setOpenDropdownId(null);
                                                        }}
                                                        onMoveToProject={() => {
                                                            setSelectedFileId(fileId);
                                                            setShowMoveFileModal(true);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={() => {
                                        setSelectedProjectId(project.id);
                                        setShowNewFileModal(true);
                                    }}
                                    className="w-full p-2 text-center text-sm text-gray-400 hover:bg-gray-800 rounded"
                                >
                                    + Add File
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* New Project Modal */}
            {showNewProjectModal && (
                <Modal
                    title="Create New Project"
                    message={Object.keys(projects).length === 0 
                        ? "Welcome! Please create your first project to get started:"
                        : "Enter a name for your new project:"}
                    onClose={() => setShowNewProjectModal(false)}
                    onConfirm={handleCreateProject}
                    confirmText="Create"
                    confirmColor="bg-green-600 hover:bg-green-700"
                    preventCancel={!Object.keys(projects).length}
                    allowOutsideClickClose={Object.keys(projects).length > 0}
                >
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Project Name"
                        autoFocus
                    />
                </Modal>
            )}

            {/* New File Modal */}
            {showNewFileModal && (
                <Modal
                    title="Create New File"
                    message="Enter a name for your new file:"
                    onClose={() => setShowNewFileModal(false)}
                    onConfirm={handleCreateFile}
                    confirmText="Create"
                    confirmColor="bg-green-600 hover:bg-green-700"
                >
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="File Name"
                        autoFocus
                    />
                </Modal>
            )}

            {/* Rename Project Modal */}
            {showRenameProjectModal && (
                <Modal
                    title="Rename Project"
                    message="Enter a new name for the project:"
                    onClose={() => setShowRenameProjectModal(false)}
                    onConfirm={handleRenameProject}
                    confirmText="Rename"
                    confirmColor="bg-blue-600 hover:bg-blue-700"
                >
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Project Name"
                        autoFocus
                    />
                </Modal>
            )}

            {/* Rename File Modal */}
            {showRenameFileModal && (
                <Modal
                    title="Rename File"
                    message="Enter a new name for the file:"
                    onClose={() => setShowRenameFileModal(false)}
                    onConfirm={handleRenameFile}
                    confirmText="Rename"
                    confirmColor="bg-blue-600 hover:bg-blue-700"
                >
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="File Name"
                        autoFocus
                    />
                </Modal>
            )}

            {/* Move File Modal */}
            {showMoveFileModal && (
                <Modal
                    title="Move File"
                    message="Select a project to move the file to:"
                    onClose={() => setShowMoveFileModal(false)}
                    onConfirm={() => setShowMoveFileModal(false)}
                    confirmText="Cancel"
                >
                    <div className="space-y-2">
                        {Object.values(projects)
                            .filter((p) => p.id !== activeProjectId)
                            .map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => handleMoveFile(project.id)}
                                    className="w-full p-2 text-left bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2"
                                >
                                    <HiFolder className="text-blue-500" />
                                    {project.name}
                                </button>
                            ))}
                    </div>
                </Modal>
            )}

            {/* Delete Project Modal */}
            {showDeleteProjectModal && (
                <Modal
                    title="Delete Project"
                    message="Are you sure you want to delete this project? This action cannot be undone and will delete all files in the project."
                    onClose={() => setShowDeleteProjectModal(false)}
                    onConfirm={handleDeleteProject}
                    confirmText="Delete"
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            )}

            {/* Delete File Modal */}
            {showDeleteFileModal && (
                <Modal
                    title="Delete File"
                    message="Are you sure you want to delete this file? This action cannot be undone."
                    onClose={() => setShowDeleteFileModal(false)}
                    onConfirm={handleDeleteFile}
                    confirmText="Delete"
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            )}

            {/* Post Delete Modal */}
            {showPostDeleteModal && (
                <Modal
                    title="Project Deleted"
                    message="What would you like to do next?"
                    onClose={() => setShowPostDeleteModal(false)}
                    onConfirm={() => setShowPostDeleteModal(false)}
                    confirmText="Close"
                >
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setShowPostDeleteModal(false);
                                setShowNewProjectModal(true);
                            }}
                            className="w-full p-3 bg-green-600 hover:bg-green-700 rounded flex items-center gap-2 justify-center text-white"
                        >
                            <span>🆕 Create New Project</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowPostDeleteModal(false);
                                setShowLoadProjectModal(true);
                            }}
                            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 justify-center text-white"
                        >
                            <span>📂 Load Existing Project</span>
                        </button>
                    </div>
                </Modal>
            )}

            {/* Load Project Modal */}
            {showLoadProjectModal && (
                <Modal
                    title="Load Project"
                    message="Select a project to load:"
                    onClose={() => setShowLoadProjectModal(false)}
                    onConfirm={() => setShowLoadProjectModal(false)}
                    confirmText="Close"
                >
                    <div className="flex flex-col gap-2">
                        {Object.values(projects).length === 0 ? (
                            <div className="text-gray-500 text-center py-4">
                                No projects available
                            </div>
                        ) : (
                            Object.values(projects)
                                .sort((a, b) => b.lastModified - a.lastModified)
                                .map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => handleLoadProject(project.id)}
                                        className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-500">📂</span>
                                            <span>{project.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(project.lastModified).toLocaleDateString()}
                                        </span>
                                    </button>
                                ))
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

// Convert to forwardRef to expose the modal functions
export default forwardRef<ProjectExplorerRef, {}>(ProjectExplorer);
