import * as THREE from "three";
import {frame2Position} from "@/utils/frame-2-position.ts";

export function createOval(layer: any, parentFrame?: any): THREE.Group {
  const { frame, style, rotation = 0, isFlippedHorizontal = false, isFlippedVertical = false } = layer;
  const group = new THREE.Group();
  group.name = layer.name;
  
  const geometry = new THREE.EllipseGeometry(frame.width / 2, frame.height / 2, 32);
  
  let materialColor = new THREE.Color(0x000000);
  let materialOpacity = 1;
  
  if (style?.fills && style.fills.length > 0) {
    const fill = style.fills[0];
    if (fill.isEnabled) {
      if (fill.color) {
        materialColor.setRGB(
          fill.color.red,
          fill.color.green,
          fill.color.blue
        );
      }
      if (fill.contextSettings) {
        materialOpacity = fill.contextSettings.opacity;
      }
    }
  }
  
  const material = new THREE.MeshBasicMaterial({
    color: materialColor,
    opacity: materialOpacity,
    transparent: materialOpacity < 1,
    side: THREE.DoubleSide,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(frame2Position(frame, parentFrame));
  
  group.add(mesh);
  
  if (rotation) {
    group.rotation.z = (rotation * Math.PI) / 180;
  }
  
  if (isFlippedHorizontal) {
    group.scale.x = -1;
  }
  if (isFlippedVertical) {
    group.scale.y = -1;
  }
  
  return group;
}
