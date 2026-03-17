import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LeftPanel } from "@/components/left-panel.tsx";
import { RightPanel } from "@/components/right-panel.tsx";
import Sketch from "@/pages/sketch.tsx";
import type { SceneObject, SketchShapePath } from "@/types";

function parsePointString(pointStr: string): { x: number; y: number } {
  const match = pointStr.match(/\{([^,]+),\s*([^}]+)\}/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return { x: 0, y: 0 };
}

function createShapePathGeometry(
  shapePath: SketchShapePath,
): THREE.BufferGeometry {
  const { points, isClosed } = shapePath;

  if (points.length < 2) {
    return new THREE.BufferGeometry();
  }

  const shape = new THREE.Shape();
  const firstPoint = parsePointString(points[0].point);
  shape.moveTo(firstPoint.x, firstPoint.y);

  for (let i = 1; i < points.length; i++) {
    const currentPoint = points[i];
    const point = parsePointString(currentPoint.point);

    if (currentPoint.hasCurveFrom && currentPoint.hasCurveTo) {
      const curveFrom = parsePointString(currentPoint.curveFrom);
      const curveTo = parsePointString(currentPoint.curveTo);
      shape.bezierCurveTo(
        curveFrom.x,
        curveFrom.y,
        curveTo.x,
        curveTo.y,
        point.x,
        point.y,
      );
    } else if (currentPoint.hasCurveFrom || currentPoint.hasCurveTo) {
      const cp = currentPoint.hasCurveFrom
        ? parsePointString(currentPoint.curveFrom)
        : parsePointString(currentPoint.curveTo);
      shape.quadraticCurveTo(cp.x, cp.y, point.x, point.y);
    } else {
      shape.lineTo(point.x, point.y);
    }
  }

  if (isClosed && points.length > 2) {
    shape.lineTo(firstPoint.x, firstPoint.y);
  }

  return new THREE.ShapeGeometry(shape);
}

function createMeshFromObject(obj: Omit<SceneObject, "mesh" | "edges">): {
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
} {
  let geometry: THREE.BufferGeometry;

  switch (obj.type) {
    case "rect": {
      const shape = new THREE.Shape();
      shape.moveTo(-1, -1);
      shape.lineTo(1, -1);
      shape.lineTo(1, 1);
      shape.lineTo(-1, 1);
      shape.lineTo(-1, -1);
      geometry = new THREE.ShapeGeometry(shape);
      break;
    }
    case "circle": {
      geometry = new THREE.CircleGeometry(1, 32);
      break;
    }
    case "triangle": {
      const shape = new THREE.Shape();
      shape.moveTo(0, 1.5);
      shape.lineTo(-1.3, -0.75);
      shape.lineTo(1.3, -0.75);
      shape.lineTo(0, 1.5);
      geometry = new THREE.ShapeGeometry(shape);
      break;
    }
    case "shapePath": {
      if (obj.shapePath) {
        geometry = createShapePathGeometry(obj.shapePath);
      } else {
        geometry = new THREE.BufferGeometry();
      }
      break;
    }
    default: {
      geometry = new THREE.BoxGeometry(1, 1, 1);
    }
  }

  const material = new THREE.MeshBasicMaterial({
    color: obj.color,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
  mesh.userData = { id: obj.id, type: obj.type };
  mesh.visible = obj.visible;

  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  edges.position.copy(mesh.position);
  edges.visible = obj.visible;

  return { mesh, edges };
}

const exampleShapePath: SketchShapePath = {
  _class: "shapePath",
  isClosed: true,
  pointRadiusBehaviour: 1,
  points: [
    {
      _class: "curvePoint",
      cornerRadius: 0,
      cornerStyle: 0,
      curveFrom: "{0.300329342602128, 0}",
      curveMode: 1,
      curveTo: "{0.300329342602128, 0}",
      hasCurveFrom: false,
      hasCurveTo: false,
      point: "{0.300329342602128, 0}",
    },
    {
      _class: "curvePoint",
      cornerRadius: 0,
      cornerStyle: 0,
      curveFrom: "{0, 1}",
      curveMode: 1,
      curveTo: "{0, 1}",
      hasCurveFrom: false,
      hasCurveTo: false,
      point: "{0, 1}",
    },
    {
      _class: "curvePoint",
      cornerRadius: 0,
      cornerStyle: 0,
      curveFrom: "{1, 0.787909693570071}",
      curveMode: 1,
      curveTo: "{1, 0.787909693570071}",
      hasCurveFrom: false,
      hasCurveTo: false,
      point: "{1, 0.787909693570071}",
    },
  ],
};

const initialObjects: Omit<SceneObject, "mesh" | "edges">[] = [
  {
    id: "rect-1",
    name: "矩形 1",
    type: "rect",
    visible: true,
    locked: false,
    selected: false,
    position: { x: 0, y: 0, z: 0 },
    color: "#4fc3f7",
  },
  {
    id: "circle-1",
    name: "圆形 1",
    type: "circle",
    visible: true,
    locked: false,
    selected: false,
    position: { x: 5, y: 3, z: 0 },
    color: "#81c784",
  },
  {
    id: "triangle-1",
    name: "三角形 1",
    type: "triangle",
    visible: true,
    locked: false,
    selected: false,
    position: { x: -4, y: -3, z: 0 },
    color: "#ffb74d",
  },
  {
    id: "shapepath-1",
    name: "自定义多边形",
    type: "shapePath",
    visible: true,
    locked: false,
    selected: false,
    position: { x: -3, y: 2, z: 0 },
    color: "#e879f9",
    shapePath: exampleShapePath,
  },
];

function HomePage() {
  const [scene] = useState(() => new THREE.Scene());
  const [objects, setObjects] = useState<SceneObject[]>(() =>
    initialObjects.map((obj) => ({
      ...obj,
      mesh: null,
      edges: null,
    })),
  );
  const sceneObjectsRef = useRef<
    Map<string, { mesh: THREE.Mesh; edges: THREE.LineSegments }>
  >(new Map());

  useEffect(() => {
    objects.forEach((obj) => {
      const existing = sceneObjectsRef.current.get(obj.id);

      if (!existing) {
        const { mesh, edges } = createMeshFromObject(obj);
        scene.add(mesh);
        scene.add(edges);
        sceneObjectsRef.current.set(obj.id, { mesh, edges });

        setObjects((prev) =>
          prev.map((o) => (o.id === obj.id ? { ...o, mesh, edges } : o)),
        );
      } else {
        existing.mesh.position.set(
          obj.position.x,
          obj.position.y,
          obj.position.z,
        );
        existing.edges.position.set(
          obj.position.x,
          obj.position.y,
          obj.position.z,
        );
        existing.mesh.visible = obj.visible;
        existing.edges.visible = obj.visible;
        const material = existing.mesh.material as THREE.MeshBasicMaterial;
        material.color.set(obj.color);

        if (obj.selected) {
          existing.edges.material = new THREE.LineBasicMaterial({
            color: 0x00aaff,
            linewidth: 2,
          });
        } else {
          existing.edges.material = new THREE.LineBasicMaterial({
            color: 0xffffff,
          });
        }
      }
    });

    sceneObjectsRef.current.forEach((value, key) => {
      if (!objects.find((obj) => obj.id === key)) {
        scene.remove(value.mesh);
        scene.remove(value.edges);
        value.mesh.geometry.dispose();
        (value.mesh.material as THREE.Material).dispose();
        value.edges.geometry.dispose();
        (value.edges.material as THREE.Material).dispose();
        sceneObjectsRef.current.delete(key);
      }
    });
  }, [scene, objects]);

  useEffect(() => {
    return () => {
      sceneObjectsRef.current.forEach(({ mesh, edges }) => {
        scene.remove(mesh);
        scene.remove(edges);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        edges.geometry.dispose();
        (edges.material as THREE.Material).dispose();
      });
      sceneObjectsRef.current.clear();
    };
  }, [scene]);

  const handleSelectObject = useCallback((id: string | null) => {
    setObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        selected: id === null ? false : obj.id === id,
      })),
    );
  }, []);

  const handleDragObject = useCallback((id: string, x: number, y: number) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          return {
            ...obj,
            position: { ...obj.position, x, y },
          };
        }
        return obj;
      }),
    );
  }, []);

  const handleObjectSelect = useCallback((id: string) => {
    setObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        selected: obj.id === id ? !obj.selected : false,
      })),
    );
  }, []);

  const handleObjectToggleVisibility = useCallback((id: string) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          return { ...obj, visible: !obj.visible };
        }
        return obj;
      }),
    );
  }, []);

  const handleObjectToggleLock = useCallback((id: string) => {
    setObjects((prev) =>
      prev.map((obj) =>
        obj.id === id ? { ...obj, locked: !obj.locked } : obj,
      ),
    );
  }, []);

  const handlePropertyChange = useCallback(
    (id: string, property: string, value: unknown) => {
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id === id) {
            const updated = { ...obj };
            if (property === "x" || property === "y" || property === "z") {
              updated.position = {
                ...updated.position,
                [property]: value as number,
              };
            } else if (property === "color") {
              updated.color = value as string;
            }
            return updated;
          }
          return obj;
        }),
      );
    },
    [],
  );

  const selectedObject = objects.find((obj) => obj.selected) || null;

  return (
    <div className="flex h-screen w-full bg-gray-950">
      <LeftPanel
        objects={objects}
        onObjectSelect={handleObjectSelect}
        onObjectToggleVisibility={handleObjectToggleVisibility}
        onObjectToggleLock={handleObjectToggleLock}
      />
      <div className="flex-1 relative overflow-hidden">
        <Sketch
          scene={scene}
          objects={objects}
          onSelectObject={handleSelectObject}
          onDragObject={handleDragObject}
        />
      </div>
      <RightPanel
        selectedObject={selectedObject}
        onPropertyChange={handlePropertyChange}
      />
    </div>
  );
}

export default HomePage;
