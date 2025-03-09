# ForgeUI Project Context

## **Project Overview**
ForgeUI is a React + TypeScript app that allows users to visually design World of Warcraft UI elements, generating real-time Lua code that can be exported for use in a WoW addon.

## **Current Features**
- Drag-and-drop UI editor using `react-dnd`
- Auto-generates Lua code as users modify UI elements
- Zustand for state management
- File management system (projects, saving, renaming, deleting)

---

## **Current Tasks & To-Do List**

### **A. Bugs to Fix**
1. **Undo/Redo does not track all UI changes properly.**  
2. **Dragging UI elements sometimes resets their position on refresh.**  
3. **Some generated Lua code does not use correct WoW API syntax.**  
4. **Improve drag-and-drop by implementing WoW’s UI layout rules** (`SetPoint`, `FrameStrata`).  
5. *(Reserved for future bug reports)*  

### **B. Feature Updates**
1. **Add `SetPoint` logic for WoW UI elements.**  
2. **Allow manual editing of Lua code inside the app.**  
3. **Improve project file management** (rename validation, sorting).  
4. **Optimize Zustand store for better state management.**  
5. **Finalize undo/redo system so all actions are reversible.**  
6. **Rework our project/file system** – *See Current Task Notes for details.*  

### **C. New Features to Implement**
1. **Add right-click context menu for UI elements.**  
2. **Implement a real-time preview mode for UI changes.**  
3. **Create an export system that saves project state as a `.lua` file.**  
4. **Support frame layering** (`FrameStrata`).  
5. **Implement manual Lua editing and validate syntax.**  
6. **Implement full file export, converting project state into `.lua`.**  

---

## **Current Task Notes**
### **B.6 – Rework our project/file system**
**Goal:** Improve how projects and files are stored, organized, and accessed within ForgeUI.  

**Issues with current implementation:**  
- Not yet fully implemented, let's finish this.
1. In our toolbar menu/file dropdown:
    a. Have new project option - when user clicks, display our modal with an input to name the project - The name must be unique. User clicks confirm then, add project to the saved state, load it in the canvas view with a new 'untitled-datetime' default file.
    b. Have a load project option - when clicked opens our modal with a list of projects. When user clicks a project load it in the
    canvas and load the last recent editied file for that project in the canvas. 
    c. Show the 5 most recent edited files. When user clicks then load that file's project and that file in the canvas, similar to 
    the load project option, except we are loading the project and this selected file.

2. Add/Create a project/file explorer component which we will add to the sidebar.tsx
    a. It should display the project name with an ellipsis icon button next to it that displays a dropdown list of options - Edit, Delete. When user clicks edit, show our modal with input populated with the name, allow user to change the name. The name must be unique. Commit changes on confirm/save button action. If user
    clicks delete, display our modal with a prompt to confirm deleteing. If confirm then delete project and all files.
    b. Displays a scrollable list of files/filenames with an ellipsis icon button next to it that displays a dropdown list of options when clicked - Edit, Delete, Move To Project. Similar to the project edit option, the only requirement is the filename must be unique to the project. On delete show modal confirm and only delete this file when user confirms. If the user clicks the 'move to project' option, then display the modal with list
    of projects (exclude current loaded project from list), when a project is clicked then move the file to that project, load the selected project and moved file in canvas/window, close modal.
    c. when user clicks a file/filename in the list, then save the current file loaded in the canvas and load/display the selected file/filename in the canvas.
    
---

