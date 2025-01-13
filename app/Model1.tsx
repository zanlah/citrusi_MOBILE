// Fast refresh doesn't work very well with GLViews.
// Always reload the entire component when the file changes:
// https://reactnative.dev/docs/fast-refresh#fast-refresh-and-hooks
// @refresh reset

import { Asset } from 'expo-asset';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import ExpoTHREE, { loadAsync, Renderer, TextureLoader, THREE } from 'expo-three';
import * as React from 'react';
import { Platform, ActivityIndicator, Text, View } from 'react-native';

import {
    AmbientLight,
    BoxGeometry,
    Fog,
    GridHelper,
    Mesh,
    PerspectiveCamera,
    PointLight,
    Scene,
    SpotLight,
    Group
} from 'three';

import OrbitControlsView from 'expo-three-orbit-controls';

function Model({ modelName = "object1", scale = 1 }) {
    const [isLoading, setIsLoading] = React.useState(true);
    const cameraRef = React.useRef<THREE.Camera>();
    const modelRef = React.useRef<Group>();
    const timeoutRef = React.useRef<number>();
    const controlsRef = React.useRef(null);

    React.useEffect(() => {
        // Clear the animation loop when the component unmounts
        return () => clearTimeout(timeoutRef.current);
    }, []);

    const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
        // removes the warning EXGL: gl.pixelStorei() doesn't support this parameter yet!
        const pixelStorei = gl.pixelStorei.bind(gl);
        gl.pixelStorei = function (...args) {
            const [parameter] = args;
            switch (parameter) {
                case gl.UNPACK_FLIP_Y_WEBGL:
                    return pixelStorei(...args);
            }
        };

        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
        const clearColor = 0xffffff;
        const lightColor = 0xffffff;

        // Create a WebGLRenderer without a DOM element
        const renderer = new Renderer({
            gl,
            clearColor,
            width: width,
            height: height,
        });

        const camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
        camera.position.set(2, 3, 2);
        camera.updateProjectionMatrix();
        cameraRef.current = camera;


        const scene = new Scene();
        /*  scene.fog = new Fog(clearColor, 1, 1000);
          scene.add(new GridHelper(10, 10));
  */
        // Increase ambient light intensity significantly
        const ambientLight = new AmbientLight(0xffffff, 2);
        scene.add(ambientLight);

        /*const pointLight = new PointLight(lightColor, 1, 1000, 1);
        pointLight.position.set(50, 50, 50);
        scene.add(pointLight);
*/

        /*  const spotLight = new SpotLight(
              lightColor,
              0.1 * Math.PI,
              0,
              Math.PI / 3,
              0,
              0.0
          );
          spotLight.position.set(0, 500, 100);
          spotLight.lookAt(scene.position);
          scene.add(spotLight);*/

        //nalozim obj model
        const assets: any = {
            obj: `http://172.20.10.3:3000/uploads/objects/${modelName}/${modelName}.obj`,
            mtl: `http://172.20.10.3:3000/uploads/objects/${modelName}/${modelName}.mtl`,
            //dodam teksture
            textures: {
                color: `http://172.20.10.3:3000/uploads/objects/${modelName}/textures/color.jpg`,
                normal: `http://172.20.10.3:3000/uploads/objects/${modelName}/textures/normal.jpg`,
                occlusion: `http://172.20.10.3:3000/uploads/objects/${modelName}/textures/occlusion.jpg`
            }
        };

        try {
            if (Platform.OS !== 'web') {
                // First load any textures
                const textureLoader = new TextureLoader();

                // Load all textures first
                const loadedTextures = {
                    color: await textureLoader.loadAsync(assets.textures.color),
                    normal: await textureLoader.loadAsync(assets.textures.normal),
                    occlusion: await textureLoader.loadAsync(assets.textures.occlusion)
                };
                // Then load the model
                const object = await loadAsync(
                    [assets.obj, assets.mtl],
                    // @ts-ignore
                    null,
                    (name) => {
                        // This function helps resolve texture paths referenced in MTL
                        if (name.includes('color.jpg')) return assets.textures.color;
                        if (name.includes('normal.jpg')) return assets.textures.normal;
                        if (name.includes('occlusion.jpg')) return assets.textures.occlusion;
                        return null;
                    }
                    // (name: any) => model[name]
                );

                object.traverse((child: any) => {
                    if (child instanceof Mesh) {
                        const material = child.material;
                        if (material) {
                            // Apply textures based on their intended use
                            material.map = loadedTextures.color;
                            material.normalMap = loadedTextures.normal;
                            material.aoMap = loadedTextures.occlusion;
                            material.needsUpdate = true;
                        }
                    }
                });

                // Position the object in view
                object.scale.set(scale, scale, scale);
                object.position.set(0, -2, 0); // Center the object

                scene.add(object);
                modelRef.current = object;

                // Adjust camera to look at center of object
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                camera.lookAt(center);
            }
        } catch (err) {
            console.log('Error loading model:', err);
            return;
        }

        // Setup an animation loop
        const render = () => {
            if (isLoading) {
                setIsLoading(false);
            }

            timeoutRef.current = requestAnimationFrame(render);
            if (modelRef.current) {
                modelRef.current.rotation.y += 0.004;
            }
            if (cameraRef.current && scene) {
                renderer.render(scene, camera);
            }
            gl.endFrameEXP();
        };
        render();
    };

    return (
        <View className="rounded-xl" style={{ flex: 1, borderRadius: "40px" }}>
            <OrbitControlsView
                style={{ flex: 1, borderRadius: 40 }}
                camera={cameraRef.current}
                //  minPolarAngle={0} // Minimum vertical rotation (45 degrees from top)
                // maxPolarAngle={Math.PI * 0.1} // Maximum vertical rotation (90 degrees - horizontal)
                minDistance={1} // Minimum zoom distance
                maxDistance={4} // Maximum zoom distance
                enablePan={false}
                enableZoom={true}
            >
                <GLView style={{ flex: 1, borderRadius: 40 }} onContextCreate={onContextCreate} />
            </OrbitControlsView>
            {isLoading && <LoadingView />}
        </View >
    );
}

export default Model;
const LoadingView = () => {
    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
            }}
        >
            <ActivityIndicator />
            <Text>Nalagam...</Text>
        </View>
    );
};