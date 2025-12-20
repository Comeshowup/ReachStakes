import React, { useEffect, useRef } from "react";

/**
 * Background3D
 *
 * Full-screen dark 3D background with very slow motion
 * and subtle mouse-reactive parallax.
 */

const Background3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer, scene, camera, animationId;
    let startTime = Date.now();
    const container = containerRef.current;

    const init = async () => {
      const THREE = await import("three");

      const { innerWidth: width, innerHeight: height } = window;

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 1);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      container.appendChild(renderer.domElement);

      // Scene & camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 5;

      // Geometry
      const geometry = new THREE.PlaneGeometry(1, 1, 100, 100); // Unit plane

      // Uniforms
      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      };

      // Shaders
      const vertexShader = `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        precision highp float;

        varying vec2 vUv;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;

        void main() {
          // Dark-mode animated gradient with mouse interaction
          vec2 st = vUv;
          float t = u_time * 0.03; // slow movement

          // Use mouse to create subtle parallax
          vec2 mouseNorm = u_mouse; // 0..1
          vec2 center = vec2(0.5);
          vec2 mouseOffset = (mouseNorm - center) * 0.1; // subtle shift
          st += mouseOffset;

          // Deep dark palette
          vec3 color1 = vec3(0.0, 0.0, 0.0);
          vec3 color2 = vec3(0.05, 0.05, 0.07);
          vec3 color3 = vec3(0.12, 0.12, 0.15);

          float wave1 = 0.5 + 0.5 * sin((st.x + t) * 3.14159);
          float wave2 = 0.5 + 0.5 * sin((st.y - t * 0.5) * 3.14159 * 1.2);

          vec3 color = mix(color1, color2, wave1);
          color = mix(color, color3, wave2 * 0.8);

          // Subtle vignette to keep edges darker
          float d = distance(vUv, vec2(0.5));
          float vignette = smoothstep(0.9, 0.4, d);
          color *= vignette;

          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const updateMeshScale = () => {
        const dist = camera.position.z; // 5
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
        const visibleWidth = visibleHeight * camera.aspect;

        // Add a small buffer to prevent any edge artifacts
        mesh.scale.set(visibleWidth * 1.01, visibleHeight * 1.01, 1);
      };

      updateMeshScale();

      const onResize = () => {
        const { innerWidth, innerHeight } = window;
        if (!renderer || !camera) return;
        renderer.setSize(innerWidth, innerHeight);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        if (material.uniforms.u_resolution) {
          material.uniforms.u_resolution.value.set(innerWidth, innerHeight);
        }
        updateMeshScale();
      };

      window.addEventListener("resize", onResize);

      const onPointerMove = (event) => {
        const x = event.clientX / window.innerWidth;
        const y = 1.0 - event.clientY / window.innerHeight;
        if (material.uniforms.u_mouse) {
          material.uniforms.u_mouse.value.set(x, y);
        }
      };

      window.addEventListener("pointermove", onPointerMove);

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (material.uniforms.u_time) {
          material.uniforms.u_time.value = elapsed;
        }

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };

      animate();

      // Cleanup
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
        if (geometry) geometry.dispose();
        if (material) material.dispose();
      };
    };

    let cleanup;
    init().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -20,
        pointerEvents: "none",
      }}
    />
  );
};


function Wave() {
  return (
    <>
      <div className="absolute inset-0 -z-10">
        <iframe
          src="https://my.spline.design/claritystream-a72K0KUwFoZV82QBzvu52Kai/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="w-full h-full"
          style={{ filter: "saturate(0.95) contrast(1.05)" }}
        ></iframe>

        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      </div>
    </>
  );
}


export { Background3D, Wave };
