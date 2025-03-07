import { create } from "zustand";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export interface FileItem {
    id: string;
    name: string;
    content: string;  // Serialized canvas JSON
    projectId?: string; // Null for standalone files
}

export interface Project {
    id: string;
    name: string;
    files: string[]; // File IDs
}

export interface UIElement {
    id: string;
    type: "Text" | "Frame" | "Button" | "CheckButton" | "EditBox" | "ScrollFrame" | "Slider";
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
    name?: string;
    checked?: boolean;
    minValue?: number;
    maxValue?: number;
    value?: number;
}

export interface UIState {
    elements: UIElement[];
    selectedElementId: string | null;
    gridSize: number;
    snapToGrid: boolean;
    addElement: (element: UIElement) => void;
    updateElement: (id: string, updates: Partial<UIElement>) => void;
    setSelectedElement: (id: string | null) => void;
    validateName: (name: string, id?: string) => boolean; // ✅ Name validation
    triggerAutoSave: () => void;
    saveState: () => void;
    loadState: () => void;
    fileName: string;
    setFileName: (name: string) => void;
    recentFiles: string[];
    addRecentFile: (name: string) => void;
    loadFile: (name: string) => void;
    hasUnsavedChanges: boolean;
    markAsChanged: () => void;
    deleteElement: (id: string) => void;
    scale: number;
    offset: { x: number; y: number };
    resetView: () => void;
    setScale: (scale: number) => void;
    setOffset: (x: number, y: number) => void;
    createFile: (name: string, projectId?: string) => void;
    createProject: (name: string) => void;
    moveFileToProject: (fileId: string, projectId: string) => void;
    deleteFile: (fileId: string) => void;
    deleteProject: (projectId: string) => void;
    projects: Record<string, Project>;
    files: Record<string, FileItem>;
    activeFileId: string | null;
    clearCanvas: () => void;
    loadProject: (projectId: string) => void;
}

export const useUIStore = create<UIState>((set, get) => {
    let initialState: UIState = {
        elements: [],
        selectedElementId: null,
        gridSize: 20,
        snapToGrid: true,
        scale: 1,
        offset: { x: 0, y: 0 },
    };

    try {
        const savedState = localStorage.getItem("forgeui_state");
        if (savedState) {
            initialState = JSON.parse(savedState);
        }
    } catch {
        console.warn("Invalid saved state, using defaults.");
    }

    // @ts-expect-error No error
    let saveTimeout: NodeJS.Timeout | null = null;

    const triggerAutoSave = () => {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            set((state) => {
                localStorage.setItem("forgeui_state", JSON.stringify(state));
                toast.success("Changes saved!");
                return state;
            });
        }, 1500);
    };

    return {
        ...initialState,
        projects: {} as Record<string, Project>,
        files: {} as Record<string, FileItem>,
        recentFiles: [] as string[],
        activeFileId: null,
        setScale: (scale) => set({ scale }),
        setOffset: (x, y) => set({ offset: { x, y } }),
        resetView: () => set({ scale: 1, offset: { x: 0, y: 0 } }),
        fileName: `Untitled-${new Date().toISOString().replace(/[:.]/g, "-")}`,
        //recentFiles: JSON.parse(localStorage.getItem("forgeui_recentFiles") || "[]"),
        hasUnsavedChanges: false,

        setFileName: (name) => {
            set({ fileName: name, hasUnsavedChanges: true });
        },

        markAsChanged: () => {
            set({ hasUnsavedChanges: true });
        },

        createFile: (name, projectId) =>
            set((state) => {
                const id = uuidv4();
                const newFile: FileItem = { id, name, content: "", projectId };
                return {
                    files: { ...state.files, [id]: newFile },
                    projects: projectId
                        ? {
                            ...state.projects,
                            [projectId]: {
                                ...state.projects[projectId],
                                files: [...state.projects[projectId].files, id],
                            },
                        }
                        : state.projects,
                };
            }),

        createProject: (name) =>
            set((state) => {
                const id = uuidv4();
                return { projects: { ...state.projects, [id]: { id, name, files: [] } } };
            }),

        moveFileToProject: (fileId, projectId) =>
            set((state) => {
                const file = state.files[fileId];
                if (!file) return state;

                // Remove from old project if applicable
                const updatedProjects = { ...state.projects };
                if (file.projectId && updatedProjects[file.projectId]) {
                    updatedProjects[file.projectId].files = updatedProjects[file.projectId].files.filter(
                        (id) => id !== fileId
                    );
                }

                // Add to new project (or remove from any project)
                if (projectId && updatedProjects[projectId]) {
                    updatedProjects[projectId].files.push(fileId);
                }

                return {
                    files: { ...state.files, [fileId]: { ...file, projectId } },
                    projects: updatedProjects,
                };
            }),

        deleteFile: (fileId) =>
            set((state) => {
                const file = state.files[fileId];
                if (!file) return state;

                // Remove from project if applicable
                const updatedProjects = { ...state.projects };
                if (file.projectId && updatedProjects[file.projectId]) {
                    updatedProjects[file.projectId].files = updatedProjects[file.projectId].files.filter(
                        (id) => id !== fileId
                    );
                }

                return {
                    files: Object.fromEntries(Object.entries(state.files).filter(([id]) => id !== fileId)),
                    projects: updatedProjects,
                };
            }),

        deleteProject: (projectId) =>
            set((state) => {
                const updatedProjects = { ...state.projects };
                const projectFiles = updatedProjects[projectId]?.files || [];
                delete updatedProjects[projectId];

                return {
                    projects: updatedProjects,
                    files: Object.fromEntries(Object.entries(state.files).filter(([id]) => !projectFiles.includes(id))),
                };
            }),

        loadFile: (fileId) =>
            set((state) => ({
                activeFileId: fileId,
                recentFiles: [fileId, ...state.recentFiles.filter((id) => id !== fileId)].slice(0, 5),
            })),

        addElement: (element) =>
            set((state) => {
                const newState = { ...state, elements: [...state.elements, element] };
                triggerAutoSave();
                return newState;
            }),

        updateElement: (id, updates) =>
            set((state) => {
                let updatedElements = state.elements.map((el) => {
                    if (el.id === id) {
                        return { ...el, ...updates };
                    }
                    return el;
                });

                if (updates.name === "") {
                    updatedElements = updatedElements.map((el) =>
                        el.id === id ? { ...el, name: undefined } : el
                    );
                }

                triggerAutoSave();
                return { elements: updatedElements };
            }),

        setSelectedElement: (id) => set({ selectedElementId: id }),

        validateName: (name, id) => {
            const elements = get().elements;
            return !elements.some((el) => el.name === name && el.id !== id);
        },

        triggerAutoSave,

        saveState: () =>
            set((state) => {
                localStorage.setItem("forgeui_state", JSON.stringify(state));
                toast.success("Changes saved!");
                return state;
            }),

        loadState: () =>
            set(() => {
                try {
                    const saved = localStorage.getItem("forgeui_state");
                    return saved ? JSON.parse(saved) : {};
                } catch {
                    return {};
                }
            }),
        deleteElement: (id) =>
            set((state) => ({
                elements: state.elements.filter((el) => el.id !== id),
                selectedElementId: null, // ✅ Deselect after deletion
            })),
        clearCanvas: () =>
            set(() => ({
                elements: [],
                selectedElementId: null,
            })),
    };
});
