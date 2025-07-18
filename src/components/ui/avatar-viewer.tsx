import { useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE: any;
    VRM: any;
  }
}

export function AvatarViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const vrmRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !window.THREE || !window.VRM) return;

    const container = containerRef.current;
    const THREE = window.THREE;
    const { VRMLoaderPlugin, VRMUtils } = window.VRM;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // VRM Loader
    const loader = new THREE.GLTFLoader();
    loader.register((parser: any) => new VRMLoaderPlugin(parser));

    // Load VRM file
    const loadVRM = async () => {
      try {
        // For now, we'll create a simple placeholder since the VRM file path needs to be handled
        // In a real implementation, you would load the VRM file from the attached_assets
        const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const material = new THREE.MeshBasicMaterial({ 
          color: 0x8b5cf6,
          transparent: true,
          opacity: 0.7
        });
        const placeholder = new THREE.Mesh(geometry, material);
        placeholder.position.set(0, -1, 0);
        scene.add(placeholder);

        // Add a simple "face"
        const faceGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const faceMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xf472b6,
          transparent: true,
          opacity: 0.8
        });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 0.5, 0.2);
        scene.add(face);

        // Simple breathing animation
        const animate = () => {
          const time = Date.now() * 0.001;
          placeholder.scale.y = 1 + Math.sin(time * 2) * 0.05;
          face.rotation.y = Math.sin(time * 0.5) * 0.1;
          
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        };
        animate();

      } catch (error) {
        console.log("VRM loading not implemented yet - showing placeholder");
      }
    };

    loadVRM();

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Cleanup
    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-10 glass rounded-2xl p-4 hidden lg:block">
      <div ref={containerRef} className="relative">
        <div className="absolute top-2 left-2 text-xs text-white/70 bg-black/30 rounded px-2 py-1">
          ARIA
        </div>
      </div>
    </div>
  );
}
