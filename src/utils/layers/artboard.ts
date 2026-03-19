import type FileFormat from "@sketch-hq/sketch-file-format-ts";
import * as THREE from "three";
import {frame2Position} from "@/utils/frame-2-position.ts";

export function createArtboard(layer: FileFormat.Artboard, parentFrame?: FileFormat.Rect): THREE.Group {
  const { frame, name } = layer;
  const group = new THREE.Group();
  group.name = name;
  
  const geometry = new THREE.PlaneGeometry(frame.width, frame.height);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(frame2Position(frame, parentFrame));
  
  group.add(mesh);
  
  return group;
}
