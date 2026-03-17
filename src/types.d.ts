import * as THREE from "three";

declare global {
  interface ImportMeta {
    env: {
      VITE_BASE_API: string;
    };
    glob: (
      path: string,
      options: Record<string, unknown>,
    ) => {
      [key: string]: { default: object[] };
    };
  }
}

export interface SketchCurvePoint {
  _class: "curvePoint";
  cornerRadius: number;
  cornerStyle: number;
  curveFrom: string;
  curveMode: number;
  curveTo: string;
  hasCurveFrom: boolean;
  hasCurveTo: boolean;
  point: string;
}

export interface SketchFrame {
  _class: "rect";
  constrainProportions: boolean;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface SketchShapePath {
  _class: "shapePath";
  isClosed: boolean;
  pointRadiusBehaviour: number;
  frame?: SketchFrame;
  points: SketchCurvePoint[];
}

export interface SceneObject {
  id: string;
  name: string;
  type: "rect" | "circle" | "triangle" | "shapePath";
  visible: boolean;
  locked: boolean;
  selected: boolean;
  position: { x: number; y: number; z: number };
  color: string;
  shapePath?: SketchShapePath;
  mesh: THREE.Mesh | null;
  edges: THREE.LineSegments | null;
}
