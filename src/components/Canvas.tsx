import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Group, Image as KonvaImage, Text } from "react-konva";
import { useUIStore } from "../store";
import ContextMenu from "./ContextMenu";

const Canvas: React.FC = () => {
    const { elements, updateElement, selectedElementId, setSelectedElement, deleteElement, gridSize, snapToGrid } =
        useUIStore();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth - 400, height: window.innerHeight });
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});

    // ✅ State for Zooming
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 2.5;

    useEffect(() => {
        const updateSize = () => {
            setDimensions({
                width: window.innerWidth - 400,
                height: window.innerHeight,
            });
        };
        window.addEventListener("resize", updateSize);
        updateSize();
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
            setSelectedElement(null);
        }
    };

    // ✅ Listen for Delete key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Delete" && selectedElementId) {
                deleteElement(selectedElementId);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedElementId, deleteElement]);

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

    return (
        <div ref={canvasRef} className="absolute left-64 top-0 w-[calc(100%-64px)] h-screen bg-gray-800 z-10">
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                className="rounded-lg"
                onClick={handleDeselect}
                scaleX={scale}
                scaleY={scale}
                x={offset.x}
                y={offset.y}
            >
                <Layer>
                    {Array.from({ length: Math.ceil(dimensions.width / gridSize) }).map((_, i) => (
                        <Line key={`v${i}`} points={[i * gridSize, 0, i * gridSize, dimensions.height]} stroke="#333" strokeWidth={1} />
                    ))}
                    {Array.from({ length: Math.ceil(dimensions.height / gridSize) }).map((_, i) => (
                        <Line key={`h${i}`} points={[0, i * gridSize, dimensions.width, i * gridSize]} stroke="#333" strokeWidth={1} />
                    ))}
                </Layer>

                <Layer>
                    {elements.map((el) => (
                        <Group
                            key={el.id}
                            draggable
                            x={el.x}
                            y={el.y}
                            onClick={() => setSelectedElement(el.id)}
                        >
                            <Rect
                                width={el.width}
                                height={el.height}
                                fill={el.color || "#ffffff"}
                                stroke={selectedElementId === el.id ? "yellow" : el.borderColor || "transparent"}
                                strokeWidth={selectedElementId === el.id ? 3 : el.borderWidth || 0}
                                opacity={el.opacity ?? 1}
                            />

                            {el.type === "Text" && (
                                <Text
                                    x={el.x + 5}
                                    y={el.y + 5}
                                    text={el.text || "Text"}
                                    fontSize={16}
                                    fill={el.color || "#000000"}
                                    opacity={el.opacity ?? 1}
                                    draggable
                                    onClick={() => setSelectedElement(el.id)}
                                />
                            )}
                        </Group>
                    ))}
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
