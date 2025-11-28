// Three.js фоновый компонент с частицами
const { useRef, useEffect, useState } = React;

const ThreeBackground = () => {
    const mountRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX - window.innerWidth / 2) * 0.0005,
                y: (e.clientY - window.innerHeight / 2) * 0.0005
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const count = 4000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color1 = new THREE.Color(0x22d3ee); 
        const color2 = new THREE.Color(0xa855f7); 

        for (let i = 0; i < count; i++) {
            const r = 40 * Math.random(); 
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
            const mixed = Math.random() > 0.5 ? color1 : color2;
            colors[i * 3] = mixed.r;
            colors[i * 3 + 1] = mixed.g;
            colors[i * 3 + 2] = mixed.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.8 });
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.0005;
            particles.rotation.x += (mousePos.y - particles.rotation.x) * 0.05;
            particles.rotation.y += (mousePos.x - particles.rotation.y) * 0.05;
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [mousePos]);
    return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
};


