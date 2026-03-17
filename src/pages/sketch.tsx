import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RULER_THICKNESS, Ruler } from "@/components/ruler.tsx";

function Sketch({ scene }: { scene: THREE.Scene }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);

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
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!panStartRef.current || !containerRef.current) return;

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
    };

    const handleMouseUp = () => {
      panStartRef.current = null;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomRef.current = Math.max(
        0.1,
        Math.min(10, zoomRef.current * zoomFactor),
      );
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
  }, [drawGrid, scene]);

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
    <div className="flex flex-col h-screen w-full">
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center gap-4 flex-shrink-0">
        <span className="text-sm">缩放比例: {zoomPercent}%</span>
        <span className="text-xs text-gray-400">
          Alt+左键/中键/右键拖拽平移 | 滚轮缩放
        </span>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
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
      </div>
    </div>
  );
}

export default Sketch;
