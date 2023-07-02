import { Canvas } from '@react-three/fiber';
import { Environment, Center, SoftShadows } from '@react-three/drei';

import Shirt from './Shirt';
import Backdrop from './Backdrop';
import CameraRig from './CameraRig';

const CanvasModel = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 0], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
      className="w-full max-w-full h-full transition-all ease-in"
    >
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0.8} position={[5, 5, 5]} castShadow />

      <SoftShadows
        // Adjust the resolution and size to match your needs
        resolution={1024}
        size={2}
        near={1}
        far={20}
        samples={10}
        frustum={[10, 2000]}
      />

      {/* <Environment preset="city" background /> */}

      <CameraRig>
        <Backdrop />
        <Center>
          <Shirt receiveShadow castShadow />
        </Center>
      </CameraRig>
    </Canvas>
  );
};

export default CanvasModel;
