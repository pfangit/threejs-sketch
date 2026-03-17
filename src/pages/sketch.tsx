import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RULER_THICKNESS, Ruler } from "@/components/ruler.tsx";
import type { SceneObject } from "@/types";

interface SketchProps {
  scene: THREE.Scene;
  objects: SceneObject[];
  onSelectObject: (id: string | null) => void;
  onDragObject: (id: string, x: number, y: number) => void;
}

function Sketch({ scene, objects, onSelectObject, onDragObject }: SketchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  const [pixelsPerUnit, setPixelsPerUnit] = useState(40);
  const [originPixelX, setOriginPixelX] = useState(400);
  const [originPixelY, setOriginPixelY] = useState(300);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const [zoomPercent, setZoomPercent] = useState(100);

  const panStartRef = useRef<{
    x: number;
    y: number;
    originX: number;
    originY: number;
  } | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);

  const dragStartRef = useRef<{
    x: number;
    y: number;
    objectId: string;
    startPos: { x: number; y: number };
  } | null>(null);
  const isDraggingRef = useRef(false);

  const drawGrid = useCallback(
    (ppu: number, ox: number, oy: number, w: number, h: number) => {
      const canvas = gridCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, w, h);

      const unitsPerPixel = 1 / ppu;

      let majorStep = 50;
      let minorStep = 10;

      if (ppu < 0.5) {
        majorStep = 100;
        minorStep = 20;
      } else if (ppu < 1) {
        majorStep = 50;
        minorStep = 10;
      } else if (ppu < 2) {
        majorStep = 20;
        minorStep = 5;
      } else if (ppu < 5) {
        majorStep = 10;
        minorStep = 2;
      } else if (ppu < 10) {
        majorStep = 5;
        minorStep = 1;
      } else {
        majorStep = 2;
        minorStep = 0.5;
      }

      const worldLeft = (0 - ox) * unitsPerPixel;
      const worldRight = (w - ox) * unitsPerPixel;
      const worldTop = (0 - oy) * unitsPerPixel;
      const worldBottom = (h - oy) * unitsPerPixel;

      const startX = Math.floor(worldLeft / minorStep) * minorStep;
      const endX = Math.ceil(worldRight / minorStep) * minorStep;
      const startY = Math.floor(worldTop / minorStep) * minorStep;
      const endY = Math.ceil(worldBottom / minorStep) * minorStep;

      ctx.strokeStyle = "#222222";
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let wx = startX; wx <= endX; wx += minorStep) {
        const px = ox + wx * ppu;
        if (px >= 0 && px <= w) {
          ctx.moveTo(px, 0);
          ctx.lineTo(px, h);
        }
      }

      for (let wy = startY; wy <= endY; wy += minorStep) {
        const py = oy + wy * ppu;
        if (py >= 0 && py <= h) {
          ctx.moveTo(0, py);
          ctx.lineTo(w, py);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "#444444";
      ctx.lineWidth = 1;
      ctx.beginPath();

      const majorStartX = Math.floor(worldLeft / majorStep) * majorStep;
      const majorEndX = Math.ceil(worldRight / majorStep) * majorStep;
      const majorStartY = Math.floor(worldTop / majorStep) * majorStep;
      const majorEndY = Math.ceil(worldBottom / majorStep) * majorStep;

      for (let wx = majorStartX; wx <= majorEndX; wx += majorStep) {
        const px = ox + wx * ppu;
        if (px >= 0 && px <= w) {
          ctx.moveTo(px, 0);
          ctx.lineTo(px, h);
        }
      }

      for (let wy = majorStartY; wy <= majorEndY; wy += majorStep) {
        const py = oy + wy * ppu;
        if (py >= 0 && py <= h) {
          ctx.moveTo(0, py);
          ctx.lineTo(w, py);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "#666666";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const originPx = ox;
      const originPy = oy;
      if (originPx >= 0 && originPx <= w) {
        ctx.moveTo(originPx, 0);
        ctx.lineTo(originPx, h);
      }
      if (originPy >= 0 && originPy <= h) {
        ctx.moveTo(0, originPy);
        ctx.lineTo(w, originPy);
      }
      ctx.stroke();
    },
    [],
  );

  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current || !cameraRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const x = screenX - rect.left;
    const y = screenY - rect.top;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const aspect = w / h;
    const frustumSize = 20 / zoomRef.current;

    const unitsPerPixel = (frustumSize * aspect) / w;

    const worldX = (x - w / 2) * unitsPerPixel + originRef.current.x;
    const worldY = -(y - h / 2) * unitsPerPixel + originRef.current.y;

    return { x: worldX, y: worldY };
  }, []);

  const getMeshesForRaycasting = useCallback(() => {
    const meshes: THREE.Mesh[] = [];
    objects.forEach((obj) => {
      if (obj.mesh && obj.visible && !obj.locked) {
        meshes.push(obj.mesh);
      }
    });
    return meshes;
  }, [objects]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    setContainerWidth(width);
    setContainerHeight(height);

    sceneRef.current = scene;

    const aspect = width / height;
    const frustumSize = 20;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100,
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const updateCamera = () => {
      if (!cameraRef.current || !containerRef.current) return;

      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const aspect = w / h;
      const frustumSize = 20 / zoomRef.current;

      camera.left = (frustumSize * aspect) / -2 + originRef.current.x;
      camera.right = (frustumSize * aspect) / 2 + originRef.current.x;
      camera.top = frustumSize / 2 + originRef.current.y;
      camera.bottom = frustumSize / -2 + originRef.current.y;
      camera.updateProjectionMatrix();

      const ppu = w / (frustumSize * aspect);
      setPixelsPerUnit(ppu);

      const centerX = w / 2;
      const centerY = h / 2;
      const ox = centerX - originRef.current.x * ppu;
      const oy = centerY + originRef.current.y * ppu;
      setOriginPixelX(ox);
      setOriginPixelY(oy);

      setZoomPercent(Math.round(zoomRef.current * 100));

      drawGrid(ppu, ox, oy, w, h);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          originX: originRef.current.x,
          originY: originRef.current.y,
        };
        e.preventDefault();
        return;
      }

      if (e.button === 0 && !e.altKey) {
        if (!containerRef.current || !cameraRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1,
          -((e.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1,
        );

        raycasterRef.current.setFromCamera(mouse, cameraRef.current);
        const meshes = getMeshesForRaycasting();
        const intersects = raycasterRef.current.intersectObjects(meshes);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const objectId = hitMesh.userData.id as string;
          const worldPos = screenToWorld(e.clientX, e.clientY);

          if (objectId && worldPos) {
            const obj = objects.find((o) => o.id === objectId);
            if (obj && !obj.locked) {
              onSelectObject(objectId);
              dragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                objectId,
                startPos: { x: obj.position.x, y: obj.position.y },
              };
              isDraggingRef.current = false;
            }
          }
        } else {
          onSelectObject(null);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (panStartRef.current) {
        if (!containerRef.current) return;

        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const aspect = w / h;
        const frustumSize = 20 / zoomRef.current;
        const unitsPerPixel = (frustumSize * aspect) / w;

        const deltaX = (e.clientX - panStartRef.current.x) * unitsPerPixel;
        const deltaY = (e.clientY - panStartRef.current.y) * unitsPerPixel;

        originRef.current.x = panStartRef.current.originX - deltaX;
        originRef.current.y = panStartRef.current.originY + deltaY;

        updateCamera();
        return;
      }

      if (dragStartRef.current) {
        if (!containerRef.current) return;

        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const aspect = w / h;
        const frustumSize = 20 / zoomRef.current;
        const unitsPerPixel = (frustumSize * aspect) / w;

        const deltaX = (e.clientX - dragStartRef.current.x) * unitsPerPixel;
        const deltaY = (e.clientY - dragStartRef.current.y) * unitsPerPixel;

        if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
          isDraggingRef.current = true;
        }

        const newX = dragStartRef.current.startPos.x + deltaX;
        const newY = dragStartRef.current.startPos.y - deltaY;

        onDragObject(dragStartRef.current.objectId, newX, newY);
      }
    };

    const handleMouseUp = () => {
      panStartRef.current = null;
      dragStartRef.current = null;
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomRef.current = zoomRef.current * zoomFactor;
      updateCamera();
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      setContainerWidth(w);
      setContainerHeight(h);
      renderer.setSize(w, h);
      updateCamera();
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("mouseleave", handleMouseUp);
    renderer.domElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    renderer.domElement.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("resize", handleResize);

    updateCamera();

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("mouseleave", handleMouseUp);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.domElement.removeEventListener("contextmenu", handleContextMenu);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    drawGrid,
    scene,
    getMeshesForRaycasting,
    screenToWorld,
    objects,
    onSelectObject,
    onDragObject,
  ]);

  useEffect(() => {
    drawGrid(
      pixelsPerUnit,
      originPixelX,
      originPixelY,
      containerWidth,
      containerHeight,
    );
  }, [
    pixelsPerUnit,
    originPixelX,
    originPixelY,
    containerWidth,
    containerHeight,
    drawGrid,
  ]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Ruler
          type="horizontal"
          pixelsPerUnit={pixelsPerUnit}
          originPixel={originPixelX}
          containerSize={containerWidth}
        />
        <div className="flex-1 relative">
          <Ruler
            type="vertical"
            pixelsPerUnit={pixelsPerUnit}
            originPixel={originPixelY}
            containerSize={containerHeight}
          />
          <canvas
            ref={gridCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ left: RULER_THICKNESS }}
          />
          <div
            ref={containerRef}
            className="absolute inset-0"
            style={{ left: RULER_THICKNESS }}
          />
        </div>
        <div className="absolute bottom-3 left-3 bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-3 z-10">
          <span className="font-medium">{zoomPercent}%</span>
          <span className="text-gray-400 text-[10px]">
            点击选中 | 拖拽移动 | Alt+拖拽平移 | 滚轮缩放
          </span>
        </div>
      </div>
    </div>
  );
}

export default Sketch;
