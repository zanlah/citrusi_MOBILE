/*import { Circle, Html, OrbitControls, Stats, useProgress } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import React, { Suspense } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


function Loader() {
    const { progress } = useProgress()
    console.log(progress)
    return <Html center>{progress} % loaded</Html>
}

const Scene: React.FC = () => {
    const gltf = useLoader(GLTFLoader, 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf')

    return (
        <Suspense fallback={<Loader />}>
            <Canvas camera={{ position: [-0.5, 1, 2] }} shadows>
                <directionalLight
                    position={[-1.3, 6.0, 4.4]}
                    castShadow
                    intensity={Math.PI * 1}
                />
                <primitive
                    object={gltf.scene}
                    position={[0, 1, 0]}
                    children-0-castShadow
                />
                <Circle args={[10]} rotation-x={-Math.PI / 2} receiveShadow>
                    <meshStandardMaterial />
                </Circle>
                <OrbitControls target={[0, 1, 0]} />
                <axesHelper args={[5]} />
                <Stats />
            </Canvas>
        </Suspense>
    );
};

export default Scene;
*/
import React from 'react';

const Scene = () => {
    return (1)
}

export default Scene;