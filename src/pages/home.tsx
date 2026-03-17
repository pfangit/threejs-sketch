import { useEffect } from "react";
import * as THREE from "three";
import Sketch from "@/pages/sketch.tsx";

function createSampleGeometry(scene: THREE.Scene) {
  const rectShape1 = new THREE.Shape();
  rectShape1.moveTo(-1, -1);
  rectShape1.lineTo(1, -1);
  rectShape1.lineTo(1, 1);
  rectShape1.lineTo(-1, 1);
  rectShape1.lineTo(-1, -1);

  const rectGeometry1 = new THREE.ShapeGeometry(rectShape1);
  const rectMaterial1 = new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    side: THREE.DoubleSide,
  });
  const rect1 = new THREE.Mesh(rectGeometry1, rectMaterial1);
  rect1.position.set(0, 0, 0);
  scene.add(rect1);

  const rectEdges1 = new THREE.EdgesGeometry(rectGeometry1);
  const rectLine1 = new THREE.LineSegments(
    rectEdges1,
    new THREE.LineBasicMaterial({ color: 0xffffff }),
  );
  rectLine1.position.copy(rect1.position);
  scene.add(rectLine1);

  const circleGeometry = new THREE.CircleGeometry(1, 32);
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: 0x81c784,
    side: THREE.DoubleSide,
  });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);
  circle.position.set(5, 3, 0);
  scene.add(circle);

  const circleEdges = new THREE.EdgesGeometry(circleGeometry);
  const circleLine = new THREE.LineSegments(
    circleEdges,
    new THREE.LineBasicMaterial({ color: 0xffffff }),
  );
  circleLine.position.copy(circle.position);
  scene.add(circleLine);

  const triangleShape = new THREE.Shape();
  triangleShape.moveTo(0, 1.5);
  triangleShape.lineTo(-1.3, -0.75);
  triangleShape.lineTo(1.3, -0.75);
  triangleShape.lineTo(0, 1.5);

  const triangleGeometry = new THREE.ShapeGeometry(triangleShape);
  const triangleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb74d,
    side: THREE.DoubleSide,
  });
  const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
  triangle.position.set(-4, -3, 0);
  scene.add(triangle);

  const triangleEdges = new THREE.EdgesGeometry(triangleGeometry);
  const triangleLine = new THREE.LineSegments(
    triangleEdges,
    new THREE.LineBasicMaterial({ color: 0xffffff }),
  );
  triangleLine.position.copy(triangle.position);
  scene.add(triangleLine);
}

function HomePage() {
  const scene = new THREE.Scene();

  useEffect(() => {
    createSampleGeometry(scene);
  }, [scene]);

  return (
    <div>
      <Sketch scene={scene} />
    </div>
  );
}

export default HomePage;
