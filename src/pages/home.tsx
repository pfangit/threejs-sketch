import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function createGrid(scene: THREE.Scene, size: number, divisions: number) {
  const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
  scene.add(gridHelper);
}

function createSampleGeometry(scene: THREE.Scene) {
  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    wireframe: false,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0, 1, 0);
  scene.add(cube);

  const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
  const cubeLine = new THREE.LineSegments(
    cubeEdges,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  cubeLine.position.copy(cube.position);
  scene.add(cubeLine);

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x81c784,
    wireframe: false,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(5, 1, 3);
  scene.add(sphere);

  const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);
  const sphereLine = new THREE.LineSegments(
    sphereEdges,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  sphereLine.position.copy(sphere.position);
  scene.add(sphereLine);

  const coneGeometry = new THREE.ConeGeometry(1, 2, 32);
  const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb74d,
    wireframe: false,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.set(-4, 1, -3);
  scene.add(cone);

  const coneEdges = new THREE.EdgesGeometry(coneGeometry);
  const coneLine = new THREE.LineSegments(
    coneEdges,
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  coneLine.position.copy(cone.position);
  scene.add(coneLine);
}

const RULER_SIZE = 30;
const RULER_THICKNESS = 24;

interface RulerProps {
  type: "horizontal" | "vertical";
  scale: number;
  offsetX: number;
  offsetY: number;
}

function Ruler({ type, scale, offsetX, offsetY }: RulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);

  const drawRuler = useCallback(() => {
    const canvas = rulerRef.current?.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isHorizontal = type === "horizontal";
    const length = isHorizontal ? canvas.width : canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#666";
    ctx.fillStyle = "#aaa";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const step = 10 * scale;
    const majorStep = 50 * scale;
    const offset = isHorizontal ? offsetX : offsetY;

    const startVal = Math.floor(-offset / step) * step;
    const endVal = startVal + length + step * 2;

    for (let pos = startVal; pos < endVal; pos += step) {
      const pixelPos = pos * scale + offset;

      if (pixelPos < 0 || pixelPos > length) continue;

      const isMajor = Math.abs(pos % majorStep) < step / 2 || Math.abs(pos % majorStep) > majorStep - step / 2;

      if (isHorizontal) {
        if (isMajor) {
          ctx.beginPath();
          ctx.moveTo(pixelPos, RULER_THICKNESS);
          ctx.lineTo(pixelPos, RULER_THICKNESS - 12);
          ctx.stroke();

          const label = Math.round(pos / scale);
          ctx.fillText(String(label), pixelPos, 8);
        } else {
          ctx.beginPath();
          ctx.moveTo(pixelPos, RULER_THICKNESS);
          ctx.lineTo(pixelPos, RULER_THICKNESS - 6);
          ctx.stroke();
        }
      } else {
        if (isMajor) {
          ctx.beginPath();
          ctx.moveTo(RULER_THICKNESS, pixelPos);
          ctx.lineTo(RULER_THICKNESS - 12, pixelPos);
          ctx.stroke();

          ctx.save();
          ctx.translate(8, pixelPos);
          ctx.rotate(-Math.PI / 2);
          const label = Math.round(pos / scale);
          ctx.fillText(String(label), 0, 0);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.moveTo(RULER_THICKNESS, pixelPos);
          ctx.lineTo(RULER_THICKNESS - 6, pixelPos);
          ctx.stroke();
        }
      }
    }
  }, [type, scale, offsetX, offsetY]);

  useEffect(() => {
    drawRuler();
  }, [drawRuler]);

  const canvasStyle: React.CSSProperties = {
    display: "block",
  };

  if (type === "horizontal") {
    return (
      <div
        ref={rulerRef}
        className="bg-[#2d2d2d] flex-shrink-0"
        style={{ height: RULER_THICKNESS, marginLeft: RULER_THICKNESS }}
      >
        <canvas width={RULER_SIZE * 50} height={RULER_THICKNESS} style={canvasStyle} />
      </div>
    );
  }

  return (
    <div
      ref={rulerRef}
      className="bg-[#2d2d2d] flex-shrink-0 absolute left-0 top-0"
      style={{ width: RULER_THICKNESS, height: "100%" }}
    >
      <canvas width={RULER_THICKNESS} height={RULER_SIZE * 50} style={canvasStyle} />
    </div>
  );
}

function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 2;
    controls.maxDistance = 100;

    const updateRuler = () => {
      const distance = camera.position.length();
      const baseDistance = 17.32;
      const currentScale = baseDistance / distance;
      setScale(Number(currentScale.toFixed(2)));

      const centerX = width / 2;
      const centerY = height / 2;

      const target = controls.target;
      const fov = camera.fov * (Math.PI / 180);
      const aspect = camera.aspect;

      const worldWidth = 2 * distance * Math.tan(fov / 2) * aspect;
      const worldHeight = 2 * distance * Math.tan(fov / 2);

      const pixelsPerUnit = width / worldWidth;
      const offsetX = centerX - target.x * pixelsPerUnit;
      const offsetY = centerY + target.z * pixelsPerUnit;

      setOffsetX(offsetX);
      setOffsetY(offsetY);
    };

    controls.addEventListener("change", updateRuler);
    controlsRef.current = controls;

    createGrid(scene, 20, 20);
    createSampleGeometry(scene);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateRuler();
    };
    window.addEventListener("resize", handleResize);

    updateRuler();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center gap-4 flex-shrink-0">
        <span className="text-sm">缩放比例: {scale}x</span>
        <span className="text-xs text-gray-400">
          鼠标左键旋转 | 鼠标中键/右键平移 | 滚轮缩放
        </span>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Ruler type="horizontal" scale={scale} offsetX={offsetX} offsetY={offsetY} />
        <div className="flex-1 relative">
          <Ruler type="vertical" scale={scale} offsetX={offsetX} offsetY={offsetY} />
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

export default HomePage;
