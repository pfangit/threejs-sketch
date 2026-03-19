import type FileFormat from "@sketch-hq/sketch-file-format-ts";
import * as THREE from "three";
import {frame2Position} from "@/utils/frame-2-position.ts";

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  if (radius <= 0) {
    shape.moveTo(x, y);
    shape.lineTo(x + width, y);
    shape.lineTo(x + width, y + height);
    shape.lineTo(x, y + height);
    shape.lineTo(x, y);
  } else {
    const r = Math.min(radius, width / 2, height / 2);
    shape.moveTo(x + r, y);
    shape.lineTo(x + width - r, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + r);
    shape.lineTo(x + width, y + height - r);
    shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    shape.lineTo(x + r, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
  }

  return shape;
}

export function createGroup(layer: FileFormat.Group, parentFrame?: FileFormat.Rect): THREE.Group {
  const {
    frame,
    rotation,
    isFlippedHorizontal,
    isFlippedVertical,
    name,
    style,
    isLocked,
    hasClippingMask,
    isVisible,
  } = layer;

  const clippingBehavior = (layer as any).clippingBehavior ?? 0;
  const corners = (style as any)?.corners;
  const cornerRadius = corners?.radii?.[0] ?? 0;

  const group = new THREE.Group();

  group.position.copy(frame2Position(frame, parentFrame));

  if (rotation) {
    group.rotation.z = (rotation * Math.PI) / 180;
  }

  if (isFlippedHorizontal) {
    group.scale.x = -1;
  }
  if (isFlippedVertical) {
    group.scale.y = -1;
  }

  const opacity = style?.contextSettings?.opacity ?? 1;
  const blendMode = style?.contextSettings?.blendMode ?? 0;

  if (frame.width > 0 && frame.height > 0) {
    const shape = createRoundedRectShape(frame.width, frame.height, cornerRadius);
    const geometry = new THREE.ShapeGeometry(shape);

    if (style?.fills && style.fills.length > 0) {
      const fill = style.fills.find(f => f.isEnabled);
      if (fill && fill.fillType === 0) {
        const color = fill.color;
        const alpha = (color.alpha || 1) * opacity;
        const fillMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color.red, color.green, color.blue),
          transparent: alpha < 1,
          opacity: alpha,
          side: THREE.DoubleSide,
        });
        const fillMesh = new THREE.Mesh(geometry, fillMaterial);
        group.add(fillMesh);
      }
    }

    if (style?.shadows && style.shadows.length > 0) {
      style.shadows.forEach((shadow) => {
        if (!shadow.isEnabled) return;

        const shadowColor = shadow.color;
        const shadowAlpha = (shadowColor.alpha || 1) * opacity;
        const blurRadius = shadow.blurRadius || 0;
        const offsetX = shadow.offsetX || 0;
        const offsetY = -(shadow.offsetY || 0);

        const shadowShape = createRoundedRectShape(
          frame.width + blurRadius * 2,
          frame.height + blurRadius * 2,
          cornerRadius + blurRadius
        );
        const shadowGeometry = new THREE.ShapeGeometry(shadowShape);
        const shadowMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(shadowColor.red, shadowColor.green, shadowColor.blue),
          transparent: true,
          opacity: shadowAlpha * 0.5,
          side: THREE.DoubleSide,
        });
        const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowMesh.position.set(offsetX, offsetY, -0.1);
        group.add(shadowMesh);
      });
    }

    if (style?.borders && style.borders.length > 0) {
      const enabledBorders = style.borders.filter(b => b.isEnabled);
      enabledBorders.forEach((border, index) => {
        const thickness = border.thickness || 1;
        const color = border.color;
        const alpha = (color.alpha || 1) * opacity;
        const position = border.position;

        let borderRadius = cornerRadius;
        let borderWidth = frame.width;
        let borderHeight = frame.height;
        let zOffset = 0.01 * (index + 1);

        if (position === 1) {
          borderRadius = Math.max(0, cornerRadius - thickness / 2);
          borderWidth = frame.width - thickness;
          borderHeight = frame.height - thickness;
        } else if (position === 2) {
          borderRadius = cornerRadius + thickness / 2;
          borderWidth = frame.width + thickness;
          borderHeight = frame.height + thickness;
        }

        const borderShape = createRoundedRectShape(borderWidth, borderHeight, borderRadius);
        const borderGeometry = new THREE.ShapeGeometry(borderShape);
        const edges = new THREE.EdgesGeometry(borderGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(color.red, color.green, color.blue),
          transparent: alpha < 1,
          opacity: alpha,
          linewidth: thickness,
        });
        const borderLine = new THREE.LineSegments(edges, borderMaterial);
        borderLine.position.z = zOffset;
        group.add(borderLine);
      });
    }
  }

  if (hasClippingMask) {
    console.log(`[Group] ${name} has clipping mask`);
  }

  if (isLocked) {
    group.userData.isLocked = true;
  }

  group.userData.isVisible = isVisible;
  group.userData.blendMode = blendMode;

  if (name) {
    const nameCanvas = document.createElement("canvas");
    const nameCtx = nameCanvas.getContext("2d");

    if (nameCtx) {
      const fontSize = 12;
      nameCtx.font = `bold ${fontSize}px Arial`;
      const textWidth = nameCtx.measureText(name).width + 10;
      const nameHeight = fontSize + 8;

      nameCanvas.width = textWidth;
      nameCanvas.height = nameHeight;

      nameCtx.font = `bold ${fontSize}px Arial`;
      nameCtx.textAlign = "center";
      nameCtx.textBaseline = "middle";

      const bgColor = isLocked ? "rgba(128, 128, 128, 0.7)" : "rgba(0, 0, 0, 0.7)";
      nameCtx.fillStyle = bgColor;
      nameCtx.fillRect(0, 0, textWidth, nameHeight);

      nameCtx.fillStyle = isVisible ? "#ffffff" : "#999999";
      nameCtx.fillText(name, textWidth / 2, nameHeight / 2);

      const nameTexture = new THREE.CanvasTexture(nameCanvas);
      nameTexture.needsUpdate = true;

      const nameMaterial = new THREE.SpriteMaterial({
        map: nameTexture,
        transparent: true,
        depthTest: false,
      });

      const nameSprite = new THREE.Sprite(nameMaterial);
      nameSprite.scale.set(textWidth * 0.1, nameHeight * 0.1, 1);

      const labelY = frame.height / 2 + nameHeight * 0.05 + 5;
      nameSprite.position.set(0, labelY, 10);

      group.add(nameSprite);
    }
  }

  return group;
}
