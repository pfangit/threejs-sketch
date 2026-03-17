import * as THREE from "three";

declare global {
  interface ImportMeta {
    env: {
      VITE_BASE_API: string;
    };
    glob: (
      path: string,
      options: Record<string, any>,
    ) => {
      [key: string]: { default: object[] };
    };
  }
}

export interface SceneObject {
  id: string;
  name: string;
  type: "rect" | "circle" | "triangle";
  visible: boolean;
  locked: boolean;
  selected: boolean;
  position: { x: number; y: number; z: number };
  color: string;
  mesh: THREE.Mesh | null;
  edges: THREE.LineSegments | null;
}
