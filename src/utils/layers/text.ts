import type FileFormat from "@sketch-hq/sketch-file-format-ts";
import * as THREE from "three";
import {frame2Position} from "@/utils/frame-2-position.ts";

export function createText(layer: FileFormat.Text, parentFrame?: FileFormat.Rect): THREE.Mesh {
  const { frame, style = {} as FileFormat.Style, wholeText } = layer;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const geometry = new THREE.PlaneGeometry(frame.width, frame.height);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(frame2Position(frame, parentFrame));
    return mesh;
  }

  canvas.width = frame.width;
  canvas.height = frame.height;

  const textStyle = (style.textStyle || {}) as FileFormat.TextStyle;
  const fontSize = textStyle.fontSize || 12;
  const fontFamily = textStyle.fontFamily || "Arial";
  const fontWeight = textStyle.fontWeight || "normal";
  const fontStyle = textStyle.fontStyle || "normal";
  const textAlign = textStyle.textAlign || "left";
  const textVerticalAlignment = textStyle.textVerticalAlignment || "top";

  let textColor = "#000000";
  let textOpacity = 1;

  if (style?.fills && style.fills.length > 0) {
    const fill = style.fills[0];
    if (fill.color) {
      textColor = fill.color;
    }
    if (fill.opacity !== undefined) {
      textOpacity = fill.opacity;
    }
  }

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.globalAlpha = textOpacity;
  ctx.textAlign = textAlign as CanvasTextAlign;
  ctx.textBaseline = textVerticalAlignment as CanvasTextBaseline;

  ctx.clearRect(0, 0, frame.width, frame.height);

  const lines: string[] = wholeText.split("\n");
  const lineHeight = fontSize * 1.2;

  lines.forEach((line, index) => {
    let y: number;
    switch (textVerticalAlignment) {
      case "top":
        y = lineHeight * (index + 1);
        break;
      case "middle":
        y = frame.height / 2 + (index - (lines.length - 1) / 2) * lineHeight;
        break;
      case "bottom":
        y = frame.height - lineHeight * (lines.length - index);
        break;
      default:
        y = lineHeight * (index + 1);
    }

    ctx.fillText(line, frame.width / 2, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(frame.width, frame.height);

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(frame2Position(frame, parentFrame));

  return mesh;
}
