import type FileFormat from "@sketch-hq/sketch-file-format-ts";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { SketchObject } from "@/contexts/sketch-context.tsx";
import { useSketch as useSketchContext } from "@/contexts/sketch-context.tsx";
import {createGroup, createRectangle, createText, createOval, createTriangle, createArtboard} from "@/utils/layers";
import {
  createCamera,
  createRenderer,
  startRenderLoop,
  stopRenderLoop,
} from "@/utils/sketch-camera.ts";
import { drawGrid } from "@/utils/sketch-grid.ts";

export interface UseSketchProps {
  containerRef: RefObject<HTMLDivElement | null>;
  gridCanvasRef: RefObject<HTMLCanvasElement | null>;
  pixelsPerUnit: number;
  originPixelX: number;
  originPixelY: number;
  containerWidth: number;
  containerHeight: number;
  zoomPercent: number;
  renderPage: (page: FileFormat.Page) => void;
}

export function useSketch(): UseSketchProps {
  const [scene] = useState(() => new THREE.Scene());
  const { selectedObject, setSelectedObject, pageData, viewPage } =
    useSketchContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);

  const [pixelsPerUnit, setPixelsPerUnit] = useState(40);
  const [originPixelX, setOriginPixelX] = useState(400);
  const [originPixelY, setOriginPixelY] = useState(300);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(600);
  const [zoomPercent, setZoomPercent] = useState(100);
  const originRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);

  const panStartRef = useRef<{
    x: number;
    y: number;
    originX: number;
    originY: number;
  } | null>(null);

  const updateCameraAndGrid = useCallback(() => {
    if (!cameraRef.current || !containerRef.current) return;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const aspect = w / h;
    const frustumSize = 20 / zoomRef.current;

    cameraRef.current.left = (frustumSize * aspect) / -2 + originRef.current.x;
    cameraRef.current.right = (frustumSize * aspect) / 2 + originRef.current.x;
    cameraRef.current.top = frustumSize / 2 + originRef.current.y;
    cameraRef.current.bottom = frustumSize / -2 + originRef.current.y;
    cameraRef.current.updateProjectionMatrix();

    const ppu = w / (frustumSize * aspect);
    setPixelsPerUnit(ppu);

    const centerX = w / 2;
    const centerY = h / 2;
    const ox = centerX - originRef.current.x * ppu;
    const oy = centerY + originRef.current.y * ppu;
    setOriginPixelX(ox);
    setOriginPixelY(oy);

    setZoomPercent(Math.round(zoomRef.current * 100));

    drawGrid(gridCanvasRef.current, ppu, ox, oy, w, h);
  }, []);

  // 添加选中效果
  const addSelectionEffect = useCallback((object: THREE.Object3D) => {
    // 移除之前的选中效果
    if (selectedMeshRef.current) {
      sceneRef.current?.remove(selectedMeshRef.current);
      selectedMeshRef.current = null;
    }

    // 为选中的对象添加高亮边框
    if (object) {
      // 计算对象的边界框（考虑所有子对象）
      const boundingBox = new THREE.Box3().setFromObject(object);

      // 获取边界框的尺寸和位置
      const size = new THREE.Vector3();
      boundingBox.getSize(size);

      // 创建边框几何体，使用与对象完全匹配的尺寸
      const borderGeometry = new THREE.EdgesGeometry(
        new THREE.BoxGeometry(size.x, size.y, 0.1),
      );

      // 创建边框材质
      const borderMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00, // 绿色高亮
        linewidth: 2,
      });

      // 创建边框网格
      const borderMesh = new THREE.LineSegments(borderGeometry, borderMaterial);

      // 计算边框的位置：边界框的中心
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      borderMesh.position.copy(center);

      // 添加到场景
      sceneRef.current?.add(borderMesh);
      // @ts-expect-error
      selectedMeshRef.current = borderMesh;
    }
  }, []);

  // 监听 pageData 变化，清空场景
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.clear();
      if (selectedMeshRef.current) {
        selectedMeshRef.current = null;
      }
    }
  }, [pageData]);

  // 监听 viewPage 变化，设置缩放比例
  useEffect(() => {
    if (viewPage?.zoomValue) {
      // 设置缩放比例
      zoomRef.current = viewPage.zoomValue;
      // 更新相机和网格
      updateCameraAndGrid();
    }
  }, [viewPage, updateCameraAndGrid]);

  // 监听选中对象变化，更新选中效果
  useEffect(() => {
    if (selectedObject && sceneRef.current) {
      // 查找对应的 Three.js 对象
      const findThreeObject = (
        parent: THREE.Object3D,
        name: string,
      ): THREE.Object3D | null => {
        if (parent.name === name) {
          return parent;
        }
        for (const child of parent.children) {
          const found = findThreeObject(child, name);
          if (found) {
            return found;
          }
        }
        return null;
      };

      const pageGroup = sceneRef.current.getObjectByName(pageData?.name || "");
      if (pageGroup) {
        const threeObject = findThreeObject(pageGroup, selectedObject.name);
        if (threeObject) {
          addSelectionEffect(threeObject);
        }
      }
    } else {
      // 取消选中，移除选中效果
      if (selectedMeshRef.current) {
        sceneRef.current?.remove(selectedMeshRef.current);
        selectedMeshRef.current = null;
      }
    }
  }, [selectedObject, pageData, addSelectionEffect]);

  const renderPage = useCallback((page: FileFormat.Page) => {
    if (!sceneRef.current) {
      console.warn("场景初始化未完成");
      return;
    }

    // 清空场景中的所有图层
    const layersGroup = sceneRef.current.getObjectByName(page.name);
    if (layersGroup) {
      sceneRef.current.remove(layersGroup);
    }

    // 创建一个新的组来存放所有图层
    const pageGroup = new THREE.Group();
    pageGroup.name = page.name;

    // 根据 rulerData.base 调整坐标偏移
    const offsetX = page.horizontalRulerData?.base ?? 0;
    const offsetY = page.verticalRulerData?.base ?? 0;
    pageGroup.position.set(-offsetX, offsetY, 0);

    // 递归渲染图层
    const renderLayer = (layer: SketchObject, parent: THREE.Object3D, parentFrame?: FileFormat.Rect) => {
      if (!layer.isVisible) return;
      console.log("[renderLayer]", layer);
      const layerFrame = (layer as any).frame;
      switch (layer._class) {
        case "group": {
          const group = createGroup(layer, parentFrame);
          group.name = layer.name;
          parent.add(group);
          // 递归渲染组内的图层
          if ((layer as FileFormat.AnyGroup).layers) {
            (layer as FileFormat.AnyGroup).layers.forEach((childLayer) => {
              renderLayer(childLayer, group, layerFrame);
            });
          }
          break;
        }
        case 'rectangle': {
          const rectangle = createRectangle(layer, parentFrame);
          rectangle.name = layer.name;
          parent.add(rectangle);
          break;
        }
        case 'text': {
          const text = createText(layer, parentFrame);
          text.name = layer.name;
          parent.add(text);
          break;
        }
        case 'oval': {
          const oval = createOval(layer, parentFrame);
          oval.name = layer.name;
          parent.add(oval);
          break;
        }
        case 'triangle': {
          const triangle = createTriangle(layer, parentFrame);
          triangle.name = layer.name;
          parent.add(triangle);
          break;
        }
        case 'artboard': {
          const artboard = createArtboard(layer, parentFrame);
          artboard.name = layer.name;
          // 递归渲染画板内的图层
          if ((layer as FileFormat.Artboard).layers) {
            (layer as FileFormat.Artboard).layers.forEach((childLayer) => {
              renderLayer(childLayer, artboard, layerFrame);
            });
          }
          parent.add(artboard);
          break;
        }
        default:
          console.warn(`[renderLayer] Unknown layer type: ${layer._class}`);
      }
    };

    // 渲染所有图层
    page.layers.forEach((layer) => {
      renderLayer(layer, pageGroup);
    });

    // 将图层组添加到场景中
    sceneRef.current.add(pageGroup);

    // 自动调整相机视口以适应内容
    if (page.layers.length > 0) {
      const boundingBox = new THREE.Box3().setFromObject(pageGroup);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      boundingBox.getSize(size);
      boundingBox.getCenter(center);

      // 计算需要的视口大小（留一些边距）
      const padding = 1.2;
      const requiredWidth = size.x * padding;
      const requiredHeight = size.y * padding;

      // 更新原点位置到内容中心
      originRef.current = { x: center.x, y: center.y };

      // 计算需要的缩放比例
      const containerW = containerRef.current?.clientWidth ?? 800;
      const containerH = containerRef.current?.clientHeight ?? 600;
      const aspect = containerW / containerH;
      const frustumWidth = requiredWidth;
      const frustumHeight = requiredHeight / aspect;
      const frustumSize = Math.max(frustumWidth, frustumHeight);
      zoomRef.current = 20 / frustumSize;

      updateCameraAndGrid();
    }
  }, [updateCameraAndGrid]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    setContainerWidth(width);
    setContainerHeight(height);

    sceneRef.current = scene;

    const camera = createCamera(width, height);
    cameraRef.current = camera;

    const renderer = createRenderer(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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
        if (!containerRef.current || !cameraRef.current || !sceneRef.current)
          return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1,
          -((e.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1,
        );

        raycasterRef.current.setFromCamera(mouse, cameraRef.current);

        // 检测射线与物体的交点
        const intersects = raycasterRef.current.intersectObjects(
          sceneRef.current.children,
          true,
        );

        if (intersects.length > 0) {
          // 获取第一个交点的对象
          const intersectedObject = intersects[0].object;

          // 找到最近的带有名称的父对象（通常是组本身）
          let targetObject = intersectedObject;
          while (
            targetObject.parent &&
            targetObject.parent.type !== "Scene" &&
            !targetObject.name
          ) {
            targetObject = targetObject.parent;
          }

          // 查找对应的 Sketch 对象
          if (targetObject.name) {
            const pageGroup = sceneRef.current?.getObjectByName(
              pageData?.name || "",
            );
            if (pageGroup) {
              // 遍历所有图层，找到对应的对象
              const findSketchObject = (
                layers: FileFormat.AnyLayer[],
              ): SketchObject | undefined => {
                for (const layer of layers) {
                  if (layer.name === targetObject.name) {
                    return layer as SketchObject;
                  }
                  if ("layers" in layer) {
                    const found = findSketchObject(layer.layers);
                    if (found) {
                      return found;
                    }
                  }
                }
                return undefined;
              };

              if (pageData?.layers) {
                const sketchObject = findSketchObject(pageData.layers);
                if (sketchObject) {
                  setSelectedObject(sketchObject);
                }
              }
            }
          }
        } else {
          // 点击空白区域，取消选中
          setSelectedObject(undefined);
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

        updateCameraAndGrid();
        return;
      }
    };

    const handleMouseUp = () => {
      panStartRef.current = null;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomRef.current = zoomRef.current * zoomFactor;
      updateCameraAndGrid();
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      setContainerWidth(w);
      setContainerHeight(h);
      rendererRef.current.setSize(w, h);
      updateCameraAndGrid();
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

    updateCameraAndGrid();

    const animationId = startRenderLoop(renderer, scene, camera);

    return () => {
      window.removeEventListener("resize", handleResize);
      stopRenderLoop(animationId);
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
  }, [scene, updateCameraAndGrid]);

  useEffect(() => {
    drawGrid(
      gridCanvasRef.current,
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
  ]);

  return {
    containerRef,
    gridCanvasRef,
    pixelsPerUnit,
    originPixelX,
    originPixelY,
    containerWidth,
    containerHeight,
    zoomPercent,
    renderPage,
  };
}
