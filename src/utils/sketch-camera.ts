import * as THREE from "three";

export function createCamera(
  width: number,
  height: number,
): THREE.OrthographicCamera {
  const aspect = width / height;
  const frustumSize = 20;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    100,
  );
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  return camera;
}

export function createRenderer(
  width: number,
  height: number,
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

export function updateCamera(
  camera: THREE.OrthographicCamera,
  width: number,
  height: number,
  zoom: number,
  originX: number,
  originY: number,
): number {
  const aspect = width / height;
  const frustumSize = 20 / zoom;

  camera.left = (frustumSize * aspect) / -2 + originX;
  camera.right = (frustumSize * aspect) / 2 + originX;
  camera.top = frustumSize / 2 + originY;
  camera.bottom = frustumSize / -2 + originY;
  camera.updateProjectionMatrix();

  return width / (frustumSize * aspect);
}

export function startRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): number {
  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  return requestAnimationFrame(animate);
}

export function stopRenderLoop(animationId: number | null) {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
}
