import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Group, Image as KonvaImage, Text } from "react-konva";
import { useUIStore } from "../store";
import ContextMenu from "./ContextMenu";

interface SelectionBox {
    startX: number;
    startY: number;
    width: number;
    height: number;
}

const Canvas: React.FC = () => {
    const {
        elements,
        updateElement,
        selectedElementIds = [],
        setSelectedElements,
        toggleElementSelection,
        clearSelection,
        deleteElement,
        gridSize,
        snapToGrid
    } = useUIStore();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [isDragging, setIsDragging] = useState(false);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

    // ✅ State for Zooming
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 2.5;

    useEffect(() => {
        const updateSize = () => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: rect.height,
                });
            }
        };
        
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        elements.forEach((el) => {
            if (el.imageSrc && !images[el.id]) {
                const img = new window.Image();
                img.src = el.imageSrc;
                img.onload = () => setImages((prev) => ({ ...prev, [el.id]: img }));
            }
        });
    }, [elements, images]);

    const handleZoom = (event: WheelEvent) => {
        if (canvasRef.current && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale - event.deltaY * 0.002));
            setScale(newScale);
        }
    };

    const handleDeselect = (e: any) => {
        if (e.target === e.currentTarget) {
            clearSelection();
        }
    };

    const handleElementClick = (e: any, elementId: string) => {
        e.cancelBubble = true; // Stop event from bubbling to stage
        
        if (e.evt.shiftKey) {
            // Toggle selection when shift is held
            toggleElementSelection(elementId);
        } else if (!selectedElementIds.includes(elementId)) {
            // Only select this element if it's not already selected
            setSelectedElements([elementId]);
        }
    };

    const handleDragMove = (e: any, elementId: string) => {
        const pos = e.target.position();
        if (snapToGrid) {
            const snappedX = Math.round(pos.x / gridSize) * gridSize;
            const snappedY = Math.round(pos.y / gridSize) * gridSize;
            e.target.position({ x: snappedX, y: snappedY });
        }

        // Move all selected elements together
        if (selectedElementIds.includes(elementId)) {
            const element = elements.find(el => el.id === elementId);
            if (!element) return;

            const dx = pos.x - element.x;
            const dy = pos.y - element.y;

            selectedElementIds.forEach(id => {
                if (id !== elementId) {
                    const el = elements.find(e => e.id === id);
                    if (!el) return;

                    const group = e.target.getStage().findOne(`#group-${id}`);
                    if (group) {
                        const newX = snapToGrid ? Math.round((el.x + dx) / gridSize) * gridSize : el.x + dx;
                        const newY = snapToGrid ? Math.round((el.y + dy) / gridSize) * gridSize : el.y + dy;
                        group.position({ x: newX, y: newY });
                    }
                }
            });
        }
    };

    const handleDragEnd = (e: any, elementId: string) => {
        const pos = e.target.position();
        const snappedX = snapToGrid ? Math.round(pos.x / gridSize) * gridSize : pos.x;
        const snappedY = snapToGrid ? Math.round(pos.y / gridSize) * gridSize : pos.y;

        // Update all selected elements
        if (selectedElementIds.includes(elementId)) {
            const element = elements.find(el => el.id === elementId);
            if (!element) return;

            const dx = snappedX - element.x;
            const dy = snappedY - element.y;

            selectedElementIds.forEach(id => {
                const el = elements.find(e => e.id === id);
                if (!el) return;

                updateElement(id, {
                    x: snapToGrid ? Math.round((el.x + dx) / gridSize) * gridSize : el.x + dx,
                    y: snapToGrid ? Math.round((el.y + dy) / gridSize) * gridSize : el.y + dy
                });
            });
        } else {
            updateElement(elementId, { x: snappedX, y: snappedY });
        }
    };

    // Listen for Delete key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Delete" && selectedElementIds.length > 0) {
                selectedElementIds.forEach(id => deleteElement(id));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedElementIds, deleteElement]);

    // ✅ Attach zoom event listener
    useEffect(() => {
        window.addEventListener("wheel", handleZoom, { passive: false });
        return () => {
            window.removeEventListener("wheel", handleZoom);
        };
    }, [scale]);

    // ✅ Reset View Function
    const resetView = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleStageMouseDown = (e: any) => {
        // Only start drag selection if clicking on the stage itself
        if (e.target === e.target.getStage()) {
            const pos = e.target.getStage().getPointerPosition();
            const { x: stageX, y: stageY } = e.target.getStage().position();
            const mouseX = (pos.x - stageX) / scale;
            const mouseY = (pos.y - stageY) / scale;
            
            setIsDragging(true);
            setDragStartPos({ x: mouseX, y: mouseY });
            setSelectionBox({
                startX: mouseX,
                startY: mouseY,
                width: 0,
                height: 0
            });
            
            // Clear selection if not holding shift
            if (!e.evt.shiftKey) {
                clearSelection();
            }
        }
    };

    const handleStageMouseMove = (e: any) => {
        if (isDragging && dragStartPos) {
            const pos = e.target.getStage().getPointerPosition();
            const { x: stageX, y: stageY } = e.target.getStage().position();
            const mouseX = (pos.x - stageX) / scale;
            const mouseY = (pos.y - stageY) / scale;

            setSelectionBox({
                startX: Math.min(dragStartPos.x, mouseX),
                startY: Math.min(dragStartPos.y, mouseY),
                width: Math.abs(mouseX - dragStartPos.x),
                height: Math.abs(mouseY - dragStartPos.y)
            });
        }
    };

    const handleStageMouseUp = () => {
        if (isDragging && selectionBox) {
            // Find elements that intersect with the selection box
            const selectedElements = elements.filter(el => {
                return (
                    el.x < selectionBox.startX + selectionBox.width &&
                    el.x + el.width > selectionBox.startX &&
                    el.y < selectionBox.startY + selectionBox.height &&
                    el.y + el.height > selectionBox.startY
                );
            });

            // Update selection
            if (selectedElements.length > 0) {
                const newSelection = selectedElements.map(el => el.id);
                setSelectedElements([...new Set([...selectedElementIds, ...newSelection])]);
            }
        }

        setIsDragging(false);
        setSelectionBox(null);
        setDragStartPos(null);
    };

    return (
        <div ref={canvasRef} className="absolute inset-0 bg-gray-800">
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                onClick={handleDeselect}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                scaleX={scale}
                scaleY={scale}
                x={offset.x}
                y={offset.y}
            >
                <Layer>
                    {dimensions.width > 0 && Array.from({ length: Math.ceil(dimensions.width / gridSize) }).map((_, i) => (
                        <Line key={`v${i}`} points={[i * gridSize, 0, i * gridSize, dimensions.height]} stroke="#333" strokeWidth={1} />
                    ))}
                    {dimensions.height > 0 && Array.from({ length: Math.ceil(dimensions.height / gridSize) }).map((_, i) => (
                        <Line key={`h${i}`} points={[0, i * gridSize, dimensions.width, i * gridSize]} stroke="#333" strokeWidth={1} />
                    ))}
                </Layer>

                <Layer>
                    {elements.map((el) => (
                        <Group
                            key={el.id}
                            id={`group-${el.id}`}
                            draggable
                            x={el.x}
                            y={el.y}
                            onClick={(e) => handleElementClick(e, el.id)}
                            onDragMove={(e) => handleDragMove(e, el.id)}
                            onDragEnd={(e) => handleDragEnd(e, el.id)}
                        >
                            <Rect
                                width={el.width}
                                height={el.height}
                                fill={el.color || "#0000ff80"}
                                stroke={selectedElementIds.includes(el.id) ? "#ffff00" : el.borderColor || "transparent"}
                                strokeWidth={selectedElementIds.includes(el.id) ? 3 : el.borderWidth || 0}
                                opacity={el.opacity ?? 1}
                            />

                            {el.type === "Text" && (
                                <Text
                                    x={5}
                                    y={5}
                                    text={el.text || "Text"}
                                    fontSize={16}
                                    fill={el.color || "#000000"}
                                    opacity={el.opacity ?? 1}
                                    onClick={(e) => handleElementClick(e, el.id)}
                                />
                            )}
                        </Group>
                    ))}

                    {/* Selection Box */}
                    {selectionBox && (
                        <Rect
                            x={selectionBox.startX}
                            y={selectionBox.startY}
                            width={selectionBox.width}
                            height={selectionBox.height}
                            fill="rgba(0, 119, 255, 0.2)"
                            stroke="rgba(0, 119, 255, 0.8)"
                            strokeWidth={1}
                        />
                    )}
                </Layer>
            </Stage>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    elementId={contextMenu.elementId}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

export default Canvas;
