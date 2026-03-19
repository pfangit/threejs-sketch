import FileFormat from "@sketch-hq/sketch-file-format-ts";
import * as THREE from "three";

export function frame2Position(frame: FileFormat.Rect, parentFrame?: FileFormat.Rect): THREE.Vector3 {
    if (parentFrame) {
        const parentCenterX = parentFrame.width / 2;
        const parentCenterY = parentFrame.height / 2;
        return new THREE.Vector3(
            frame.x + frame.width / 2 - parentCenterX,
            -(frame.y + frame.height / 2 - parentCenterY),
            0
        );
    }
    return new THREE.Vector3(
        frame.x + frame.width / 2,
        -(frame.y + frame.height / 2),
        0
    );
}
