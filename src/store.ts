import { create } from "zustand";
import toast from "react-hot-toast";

interface UIElement {
    id: string;
    type: "Frame" | "Button" | "CheckButton" | "EditBox" | "ScrollFrame" | "Slider";
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
}

interface UIState {
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
    } catch (error) {
        console.warn("Invalid saved state, using defaults.");
    }

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
        setScale: (scale) => set({ scale }),
        setOffset: (x, y) => set({ offset: { x, y } }),
        resetView: () => set({ scale: 1, offset: { x: 0, y: 0 } }),
        fileName: `Untitled-${new Date().toISOString().replace(/[:.]/g, "-")}`,
        recentFiles: JSON.parse(localStorage.getItem("forgeui_recentFiles") || "[]"),
        hasUnsavedChanges: false,

        setFileName: (name) => {
            set({ fileName: name, hasUnsavedChanges: true });
        },

        markAsChanged: () => {
            set({ hasUnsavedChanges: true });
        },

        saveFile: () => {
            const { fileName, recentFiles } = get();

            // ✅ Always save, even if no changes
            const updatedRecentFiles = [fileName, ...recentFiles.filter((file) => file !== fileName)].slice(0, 5);
            localStorage.setItem("forgeui_recentFiles", JSON.stringify(updatedRecentFiles));
            localStorage.setItem(`forgeui_project_${fileName}`, JSON.stringify(get()));

            set({ recentFiles: updatedRecentFiles, hasUnsavedChanges: false });
        },

        loadFile: (name) => {
            const savedState = localStorage.getItem(`forgeui_project_${name}`);
            if (savedState) {
                const { recentFiles } = get();

                // ✅ Ensure the file remains in recent files
                const updatedRecentFiles = [name, ...recentFiles.filter((file) => file !== name)].slice(0, 5);
                localStorage.setItem("forgeui_recentFiles", JSON.stringify(updatedRecentFiles));

                set({ ...JSON.parse(savedState), fileName: name, hasUnsavedChanges: false, recentFiles: updatedRecentFiles });
            }
        },

        newFile: () => {
            set({
                fileName: `Untitled-${new Date().toISOString().replace(/[:.]/g, "-")}`,
                elements: [],
                selectedElementId: null,
                hasUnsavedChanges: false,
            });
        },
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
