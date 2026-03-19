import type { MouseEvent } from "react";
import * as THREE from "three";

export interface PanStartState {
  x: number;
  y: number;
  originX: number;
  originY: number;
}

export interface MouseHandlers {
  handleMouseDown: (
    e: MouseEvent,
    callback: (mouse: THREE.Vector2) => void,
  ) => void;
  handleMouseMove: (
    e: MouseEvent,
    panStart: PanStartState | null,
    updateCallback: (deltaX: number, deltaY: number) => void,
  ) => void;
  handleMouseUp: () => PanStartState | null;
  handleWheel: (
    e: WheelEvent,
    zoomCallback: (zoomFactor: number) => void,
  ) => void;
  handleContextMenu: (e: Event) => void;
  getUnitsPerPixel: (width: number, height: number, zoom: number) => number;
}

export const createMouseHandlers = (): MouseHandlers => {
  return {
    handleMouseDown: (
      e: MouseEvent,
      callback: (mouse: THREE.Vector2) => void,
    ) => {
      if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        return;
      }

      if (e.button === 0 && !e.altKey) {
        const target = e.currentTarget as HTMLElement;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / target.clientWidth) * 2 - 1,
          -((e.clientY - rect.top) / target.clientHeight) * 2 + 1,
        );

        callback(mouse);
      }
    },

    handleMouseMove: (
      e: MouseEvent,
      panStart: PanStartState | null,
      updateCallback: (deltaX: number, deltaY: number) => void,
    ) => {
      if (!panStart) return;

      const target = e.currentTarget as HTMLElement;
      if (!target) return;

      const w = target.clientWidth;
      const h = target.clientHeight;
      const aspect = w / h;
      const frustumSize = 20; // zoom is handled in the callback
      const unitsPerPixel = (frustumSize * aspect) / w;

      const deltaX = (e.clientX - panStart.x) * unitsPerPixel;
      const deltaY = (e.clientY - panStart.y) * unitsPerPixel;

      updateCallback(deltaX, deltaY);
    },

    handleMouseUp: () => {
      return null;
    },

    handleWheel: (
      e: WheelEvent,
      zoomCallback: (zoomFactor: number) => void,
    ) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomCallback(zoomFactor);
    },

    handleContextMenu: (e: Event) => {
      e.preventDefault();
    },

    getUnitsPerPixel: (width: number, height: number, zoom: number) => {
      const aspect = width / height;
      const frustumSize = 20 / zoom;
      return (frustumSize * aspect) / width;
    },
  };
};
