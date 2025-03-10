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
2. **Some generated Lua code does not use correct WoW API syntax.**  
3. **Improve drag-and-drop by implementing WoW’s UI layout rules** (`SetPoint`, `FrameStrata`).  
4. **Child elements need to be bound to their parent container -- see current task notes**
5. *(Reserved for future bug reports)*  

### **B. Feature Updates**
1. **Add `SetPoint` logic for WoW UI elements.**  
2. **Allow manual editing of Lua code inside the app.**  
3. **Optimize Zustand store for better state management.**  
4. **Finalize undo/redo system so all actions are reversible.**  

### **C. New Features to Implement**
1. **Implement a real-time preview mode for UI changes.**  
2. **Create an export system that saves project state as a `.lua` file.**  
3. **Support frame layering** (`FrameStrata`).  
4. **Implement manual Lua editing and validate syntax.**  
5. **Implement full file export, converting project state into `.lua`.**  

---

## **Current Task Notes**
A frame is required for all the other element widgets. These other widgets are child elements and must
be bound inside the parent frame. Let's also add the ability to add 'sections' inside frames to better
place content inside the sections. Example: Main frame (container), has two sections, a left container and
a right container. Each will provide bounds for their child elements. In the element properties window when an
element is selected that has child elements, display them by their element name or element type + uuid. User can
click on an element child to have it selected in the canvas, then in the element properties change the element
child list if it doesn't have children to display the element parent. When that is clicked to then select the parent.

---

