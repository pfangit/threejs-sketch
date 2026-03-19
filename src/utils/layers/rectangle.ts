import * as THREE from "three";
import {frame2Position} from "@/utils/frame-2-position.ts";

// 创建带圆角的矩形几何体
function createRoundedRectGeometry(width: number, height: number, radius: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  
  // 绘制带圆角的矩形
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  
  // 创建几何体
  const geometry = new THREE.ShapeGeometry(shape);
  return geometry;
}

export function createRectangle(layer: any, parentFrame?: any): THREE.Group {
  const { frame, style, fixedRadius = 0, rotation = 0, isFlippedHorizontal = false, isFlippedVertical = false } = layer;
  
  const group = new THREE.Group();
  
  const geometry = fixedRadius > 0 
    ? createRoundedRectGeometry(frame.width, frame.height, fixedRadius)
    : new THREE.PlaneGeometry(frame.width, frame.height);
  
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
  
  if (style?.borders && style.borders.length > 0) {
    for (const border of style.borders) {
      if (border.isEnabled) {
        const borderGeometry = fixedRadius > 0 
          ? createRoundedRectGeometry(
              frame.width + border.thickness * 2,
              frame.height + border.thickness * 2,
              fixedRadius + border.thickness
            )
          : new THREE.PlaneGeometry(
              frame.width + border.thickness * 2,
              frame.height + border.thickness * 2
            );
        
        let borderColor = new THREE.Color(0x000000);
        let borderOpacity = 1;
        
        if (border.color) {
          borderColor.setRGB(
            border.color.red,
            border.color.green,
            border.color.blue
          );
        }
        
        if (border.contextSettings) {
          borderOpacity = border.contextSettings.opacity;
        }
        
        const borderMaterial = new THREE.MeshBasicMaterial({
          color: borderColor,
          opacity: borderOpacity,
          transparent: borderOpacity < 1,
          side: THREE.DoubleSide,
        });
        
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        
        borderMesh.position.set(
          frame.x + frame.width / 2 - (parentFrame?.width ?? 0) / 2,
          -(frame.y + frame.height / 2 - (parentFrame?.height ?? 0) / 2),
          -0.05
        );
        
        group.add(borderMesh);
      }
    }
  }
  
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
