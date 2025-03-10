import { create } from "zustand";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export interface FileItem {
    id: string;
    name: string;
    content: string;  // Serialized canvas state
    projectId?: string;
    lastModified: number;
    elements: UIElement[];
}

export interface Project {
    id: string;
    name: string;
    files: string[]; // File IDs
    lastModified: number;
    lastOpenedFileId?: string;
}

export interface UIElement {
    id: string;
    type: "Text" | "Frame" | "Button" | "CheckButton" | "EditBox" | "ScrollFrame" | "Slider" | "Section";
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
    imageSrc?: string;
    parentId?: string;
    childIds: string[];  // Array of child element IDs
    name?: string;
    checked?: boolean;
    minValue?: number;
    maxValue?: number;
    value?: number;
    isContainer?: boolean; // Indicates if this element can contain other elements (Frame, Section)
}

export interface UIState {
    elements: UIElement[];
    selectedElementIds: string[];
    gridSize: number;
    snapToGrid: boolean;
    projects: Record<string, Project>;
    files: Record<string, FileItem>;
    activeProjectId: string | null;
    activeFileId: string | null;
    recentFiles: string[];  // Array of file IDs, most recent first
    hasUnsavedChanges: boolean;

    // Grid Settings
    setGridSize: (size: number) => void;
    toggleSnapToGrid: () => void;

    // Project Management
    createProject: (name: string) => string; // Returns project ID
    renameProject: (projectId: string, newName: string) => void;
    deleteProject: (projectId: string) => void;
    loadProject: (projectId: string) => void;
    validateProjectName: (name: string, excludeProjectId?: string) => boolean;

    // File Management
    createFile: (name: string, projectId?: string) => string; // Returns file ID
    renameFile: (fileId: string, newName: string) => void;
    deleteFile: (fileId: string) => void;
    moveFileToProject: (fileId: string, projectId: string) => void;
    loadFile: (fileId: string) => void;
    saveCurrentFile: () => void;
    validateFileName: (name: string, projectId: string, excludeFileId?: string) => boolean;

    // Element Management
    addElement: (element: UIElement) => void;
    updateElement: (id: string, updates: Partial<UIElement>) => void;
    deleteElement: (id: string) => void;
    setSelectedElements: (ids: string[]) => void;
    toggleElementSelection: (id: string) => void;
    clearSelection: () => void;
    clearCanvas: () => void;
    alignElements: (alignment: "left" | "center" | "right" | "top" | "bottom" | "vertical") => void;

    // View Management
    scale: number;
    offset: { x: number; y: number };
    setScale: (scale: number) => void;
    setOffset: (x: number, y: number) => void;
    resetView: () => void;

    // State Management
    loadState: () => void;
}

export const useUIStore = create<UIState>((set, get) => {
    // Load initial state from localStorage
    const loadInitialState = () => {
        try {
            const savedState = localStorage.getItem("forgeui_state");
            if (savedState) {
                return JSON.parse(savedState);
            }
        } catch (error) {
            console.warn("Failed to load saved state:", error);
        }
        return {
            elements: [],
            selectedElementIds: [],
            gridSize: 20,
            snapToGrid: true,
            scale: 1,
            offset: { x: 0, y: 0 },
            projects: {},
            files: {},
            activeProjectId: null,
            activeFileId: null,
            recentFiles: [],
            hasUnsavedChanges: false,
        };
    };

    const initialState = loadInitialState();

    const saveState = () => {
        const state = get();
        localStorage.setItem("forgeui_state", JSON.stringify(state));
    };

    const autoSave = () => {
        if (get().hasUnsavedChanges) {
            saveState();
            toast.success("Changes saved!");
        }
    };

    // Auto-save every 30 seconds if there are unsaved changes
    setInterval(autoSave, 30000);

    return {
        ...initialState,

        createProject: (name) => {
            const projectId = uuidv4();
            const timestamp = Date.now();
            
            // Create a default file for the project
            const fileId = uuidv4();
            const defaultFileName = `untitled-${new Date(timestamp).toISOString().slice(0, 19).replace(/[:.]/g, "-")}`;
            
            set((state) => ({
                projects: {
                    ...state.projects,
                    [projectId]: {
                        id: projectId,
                        name,
                        files: [fileId],
                        lastModified: timestamp,
                        lastOpenedFileId: fileId,
                    },
                },
                files: {
                    ...state.files,
                    [fileId]: {
                        id: fileId,
                        name: defaultFileName,
                        content: "",
                        projectId,
                        lastModified: timestamp,
                        elements: [],
                    },
                },
                activeProjectId: projectId,
                activeFileId: fileId,
                recentFiles: [fileId, ...state.recentFiles].slice(0, 5),
                elements: [],
                hasUnsavedChanges: false,
            }));
            
            saveState();
            return projectId;
        },

        deleteProject: (projectId) => {
            const project = get().projects[projectId];
            if (!project) return;

            // Get all file IDs associated with this project
            const fileIds = project.files;

            set((state) => {
                // Create new files object without the project's files
                const updatedFiles = { ...state.files };
                fileIds.forEach(fileId => {
                    delete updatedFiles[fileId];
                });

                // Create new projects object without the deleted project
                const updatedProjects = { ...state.projects };
                delete updatedProjects[projectId];

                // Remove deleted files from recent files
                const updatedRecentFiles = state.recentFiles.filter(
                    fileId => !fileIds.includes(fileId)
                );

                // Reset active project/file if they were part of the deleted project
                const resetActive = state.activeProjectId === projectId;

                return {
                    projects: updatedProjects,
                    files: updatedFiles,
                    recentFiles: updatedRecentFiles,
                    activeProjectId: resetActive ? null : state.activeProjectId,
                    activeFileId: resetActive ? null : state.activeFileId,
                    elements: resetActive ? [] : state.elements,
                    hasUnsavedChanges: false,
                };
            });

            saveState();
        },

        renameProject: (projectId, newName) => {
            if (!get().validateProjectName(newName, projectId)) {
                toast.error("Project name must be unique");
                return;
            }

            set((state) => ({
                projects: {
                    ...state.projects,
                    [projectId]: {
                        ...state.projects[projectId],
                        name: newName,
                        lastModified: Date.now(),
                    },
                },
                hasUnsavedChanges: true,
            }));
        },

        validateProjectName: (name, excludeProjectId) => {
            const projects = get().projects;
            return !Object.values(projects).some(
                (p) => p.id !== excludeProjectId && p.name.toLowerCase() === name.toLowerCase()
            );
        },

        validateFileName: (name, projectId, excludeFileId) => {
            const files = get().files;
            return !Object.values(files).some(
                (f) => 
                    f.id !== excludeFileId && 
                    f.projectId === projectId && 
                    f.name.toLowerCase() === name.toLowerCase()
            );
        },

        createFile: (name, projectId) => {
            const fileId = uuidv4();
            const timestamp = Date.now();

            set((state) => {
                const newState: Partial<UIState> = {
                    files: {
                        ...state.files,
                        [fileId]: {
                            id: fileId,
                            name,
                            content: "",
                            projectId,
                            lastModified: timestamp,
                            elements: [],
                        },
                    },
                    hasUnsavedChanges: false,
                };

                if (projectId) {
                    newState.projects = {
                        ...state.projects,
                        [projectId]: {
                            ...state.projects[projectId],
                            files: [...state.projects[projectId].files, fileId],
                            lastModified: timestamp,
                        },
                    };
                }

                return newState as UIState;
            });

            saveState();
            return fileId;
        },

        renameFile: (fileId, newName) => {
            const file = get().files[fileId];
            if (!file) return;

            if (file.projectId && !get().validateFileName(newName, file.projectId, fileId)) {
                toast.error("File name must be unique within the project");
                return;
            }

            set((state) => ({
                files: {
                    ...state.files,
                    [fileId]: {
                        ...state.files[fileId],
                        name: newName,
                        lastModified: Date.now(),
                    },
                },
                hasUnsavedChanges: true,
            }));
        },

        loadProject: (projectId) => {
            const project = get().projects[projectId];
            if (!project) return;

            const fileToLoad = project.lastOpenedFileId || project.files[0];
            if (!fileToLoad) return;

            set((state) => ({
                activeProjectId: projectId,
                activeFileId: fileToLoad,
                elements: state.files[fileToLoad]?.elements || [],
                hasUnsavedChanges: false,
            }));

            saveState();
        },

        loadFile: (fileId) => {
            const file = get().files[fileId];
            if (!file) return;

            // Save current file before loading new one
            get().saveCurrentFile();

            set((state) => ({
                activeFileId: fileId,
                activeProjectId: file.projectId || state.activeProjectId,
                elements: file.elements,
                recentFiles: [fileId, ...state.recentFiles.filter(id => id !== fileId)].slice(0, 5),
                hasUnsavedChanges: false,
            }));

            // Update project's last opened file
            if (file.projectId) {
                const projectId = file.projectId;  // TypeScript will infer this as string
                set((state) => ({
                    projects: {
                        ...state.projects,
                        [projectId]: {
                            ...state.projects[projectId],
                            lastOpenedFileId: fileId,
                        },
                    },
                }));
            }

            saveState();
        },

        saveCurrentFile: () => {
            const { activeFileId, elements, hasUnsavedChanges } = get();
            if (!activeFileId || !hasUnsavedChanges) return;

            set((state) => ({
                files: {
                    ...state.files,
                    [activeFileId]: {
                        ...state.files[activeFileId],
                        elements: [...elements],
                        lastModified: Date.now(),
                    },
                },
                hasUnsavedChanges: false,
            }));

            saveState();
        },

        addElement: (element) => {
            // Only allow Frame/Section to be created without a parent
            if (!element.parentId && element.type !== "Frame" && element.type !== "Section") {
                toast.error("Elements must be placed inside a Frame or Section");
                return;
            }

            const newElement = {
                ...element,
                color: element.color || "#0000ff80",
                childIds: [],
                isContainer: element.type === "Frame" || element.type === "Section"
            };

            set((state) => {
                // If this element has a parent, validate position within parent bounds
                if (newElement.parentId) {
                    const parent = state.elements.find(el => el.id === newElement.parentId);
                    if (!parent) {
                        toast.error("Parent container not found");
                        return state;
                    }

                    // Convert absolute coordinates to relative coordinates
                    newElement.x = Math.max(0, Math.min(newElement.x - parent.x, parent.width - newElement.width));
                    newElement.y = Math.max(0, Math.min(newElement.y - parent.y, parent.height - newElement.height));
                }

                const updatedElements = [...state.elements, newElement];

                // Update parent's childIds
                if (newElement.parentId) {
                    const parentIndex = updatedElements.findIndex(el => el.id === newElement.parentId);
                    if (parentIndex !== -1) {
                        updatedElements[parentIndex] = {
                            ...updatedElements[parentIndex],
                            childIds: [...updatedElements[parentIndex].childIds, newElement.id]
                        };
                    }
                }

                return {
                    elements: updatedElements,
                    hasUnsavedChanges: true,
                };
            });
        },

        updateElement: (id, updates) =>
            set((state) => {
                const element = state.elements.find(el => el.id === id);
                if (!element) return state;

                // If updating position or size and element has a parent, validate bounds
                if (element.parentId && (updates.x !== undefined || updates.y !== undefined || 
                    updates.width !== undefined || updates.height !== undefined)) {
                    const parent = state.elements.find(el => el.id === element.parentId);
                    if (!parent) return state;

                    const newX = updates.x !== undefined ? updates.x - parent.x : element.x;
                    const newY = updates.y !== undefined ? updates.y - parent.y : element.y;
                    const newWidth = updates.width || element.width;
                    const newHeight = updates.height || element.height;

                    // Ensure element stays within parent bounds
                    updates.x = Math.max(parent.x, Math.min(parent.x + parent.width - newWidth, parent.x + newX));
                    updates.y = Math.max(parent.y, Math.min(parent.y + parent.height - newHeight, parent.y + newY));
                    
                    // Ensure size doesn't exceed parent bounds
                    if (updates.width !== undefined) {
                        updates.width = Math.min(updates.width, parent.width);
                    }
                    if (updates.height !== undefined) {
                        updates.height = Math.min(updates.height, parent.height);
                    }
                }

                return {
                    elements: state.elements.map((el) =>
                        el.id === id ? { ...el, ...updates } : el
                    ),
                    hasUnsavedChanges: true,
                };
            }),

        deleteElement: (id) =>
            set((state) => {
                const elementToDelete = state.elements.find(el => el.id === id);
                if (!elementToDelete) return state;

                // Get all descendant IDs (children, grandchildren, etc.)
                const getAllDescendantIds = (elementId: string): string[] => {
                    const element = state.elements.find(el => el.id === elementId);
                    if (!element || !element.childIds.length) return [];
                    
                    const childIds = element.childIds;
                    const descendantIds = childIds.flatMap(childId => getAllDescendantIds(childId));
                    return [...childIds, ...descendantIds];
                };

                const descendantIds = getAllDescendantIds(id);
                const idsToRemove = [id, ...descendantIds];

                // Update parent's childIds if the element has a parent
                let updatedElements = state.elements.map(el => {
                    if (el.id === elementToDelete.parentId) {
                        return {
                            ...el,
                            childIds: el.childIds.filter(childId => childId !== id)
                        };
                    }
                    return el;
                });

                // Remove the element and all its descendants
                updatedElements = updatedElements.filter(el => !idsToRemove.includes(el.id));

                // Update selected elements
                const updatedSelectedIds = state.selectedElementIds.filter(
                    elementId => !idsToRemove.includes(elementId)
                );

                return {
                    elements: updatedElements,
                    selectedElementIds: updatedSelectedIds,
                    hasUnsavedChanges: true,
                };
            }),

        setSelectedElements: (ids) => set({ selectedElementIds: ids }),
        
        toggleElementSelection: (id) => set((state) => ({
            selectedElementIds: state.selectedElementIds.includes(id)
                ? state.selectedElementIds.filter(elementId => elementId !== id)
                : [...state.selectedElementIds, id]
        })),

        clearSelection: () => set({ selectedElementIds: [] }),

        clearCanvas: () =>
            set((state) => ({
                elements: [],
                selectedElementIds: [],
                hasUnsavedChanges: true,
            })),

        setScale: (scale) => set({ scale }),
        setOffset: (x, y) => set({ offset: { x, y } }),
        resetView: () => set({ scale: 1, offset: { x: 0, y: 0 } }),

        loadState: () => {
            try {
                const savedState = localStorage.getItem("forgeui_state");
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    set((state) => ({
                        ...state,
                        ...parsedState,
                        hasUnsavedChanges: false,
                    }));
                }
            } catch (error) {
                console.warn("Failed to load saved state:", error);
            }
        },

        moveFileToProject: (fileId: string, projectId: string) => {
            const file = get().files[fileId];
            if (!file || !file.projectId) return;

            const oldProjectId = file.projectId;
            const oldProject = get().projects[oldProjectId];
            const newProject = get().projects[projectId];

            if (!oldProject || !newProject) return;

            set((state) => ({
                projects: {
                    ...state.projects,
                    [oldProjectId]: {
                        ...oldProject,
                        files: oldProject.files.filter(id => id !== fileId),
                        lastModified: Date.now(),
                    },
                    [projectId]: {
                        ...newProject,
                        files: [...newProject.files, fileId],
                        lastModified: Date.now(),
                    },
                },
                files: {
                    ...state.files,
                    [fileId]: {
                        ...file,
                        projectId,
                        lastModified: Date.now(),
                    },
                },
                hasUnsavedChanges: true,
            }));

            saveState();
        },

        deleteFile: (fileId: string) => {
            const file = get().files[fileId];
            if (!file) return;

            set((state) => {
                const newState = {
                    files: { ...state.files },
                    recentFiles: state.recentFiles.filter(id => id !== fileId),
                    hasUnsavedChanges: false,
                } as Partial<UIState>;

                // Remove the file from files
                delete newState.files![fileId];

                // If file belongs to a project, remove it from project's files array
                if (file.projectId) {
                    const project = state.projects[file.projectId];
                    if (project) {
                        newState.projects = {
                            ...state.projects,
                            [file.projectId]: {
                                ...project,
                                files: project.files.filter(id => id !== fileId),
                                lastModified: Date.now(),
                                // If this was the last opened file, clear that reference
                                lastOpenedFileId: project.lastOpenedFileId === fileId ? undefined : project.lastOpenedFileId,
                            },
                        };
                    }
                }

                // If this was the active file, clear the canvas and active file
                if (state.activeFileId === fileId) {
                    newState.activeFileId = null;
                    newState.elements = [];
                }

                return newState as UIState;
            });

            saveState();
        },

        toggleSnapToGrid: () => set(state => ({ snapToGrid: !state.snapToGrid })),
        setGridSize: (size) => set({ gridSize: size }),

        alignElements: (alignment) => {
            const state = get();
            const selectedElements = state.elements.filter(el => state.selectedElementIds.includes(el.id));
            
            if (selectedElements.length < 2) {
                toast.error("Select at least 2 elements to align");
                return;
            }

            const updates: { id: string; updates: Partial<UIElement> }[] = [];

            switch (alignment) {
                case "left": {
                    const leftmost = Math.min(...selectedElements.map(el => el.x));
                    selectedElements.forEach(el => {
                        if (el.x !== leftmost) {
                            updates.push({ id: el.id, updates: { x: leftmost } });
                        }
                    });
                    break;
                }
                case "center": {
                    const avgX = selectedElements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / selectedElements.length;
                    selectedElements.forEach(el => {
                        updates.push({ id: el.id, updates: { x: avgX - el.width / 2 } });
                    });
                    break;
                }
                case "right": {
                    const rightmost = Math.max(...selectedElements.map(el => el.x + el.width));
                    selectedElements.forEach(el => {
                        updates.push({ id: el.id, updates: { x: rightmost - el.width } });
                    });
                    break;
                }
                case "top": {
                    const topmost = Math.min(...selectedElements.map(el => el.y));
                    selectedElements.forEach(el => {
                        if (el.y !== topmost) {
                            updates.push({ id: el.id, updates: { y: topmost } });
                        }
                    });
                    break;
                }
                case "bottom": {
                    const bottommost = Math.max(...selectedElements.map(el => el.y + el.height));
                    selectedElements.forEach(el => {
                        updates.push({ id: el.id, updates: { y: bottommost - el.height } });
                    });
                    break;
                }
                case "vertical": {
                    const sortedByY = [...selectedElements].sort((a, b) => a.y - b.y);
                    const totalHeight = sortedByY.reduce((sum, el) => sum + el.height, 0);
                    const spacing = (sortedByY[sortedByY.length - 1].y + sortedByY[sortedByY.length - 1].height - sortedByY[0].y - totalHeight) / (sortedByY.length - 1);
                    
                    let currentY = sortedByY[0].y;
                    sortedByY.forEach((el, index) => {
                        if (index > 0) {
                            updates.push({ id: el.id, updates: { y: currentY } });
                        }
                        currentY += el.height + spacing;
                    });
                    break;
                }
            }

            updates.forEach(({ id, updates }) => {
                set(state => ({
                    elements: state.elements.map(el => 
                        el.id === id ? { ...el, ...updates } : el
                    ),
                    hasUnsavedChanges: true
                }));
            });

            if (updates.length > 0) {
                toast.success(`Elements aligned ${alignment}`);
            }
        },
    };
});
