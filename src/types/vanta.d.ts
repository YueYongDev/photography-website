declare module "vanta/dist/vanta.net.min" {
  type VantaNetOptions = {
    el: HTMLElement;
    THREE: typeof import("three");
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
    showDots?: boolean;
  };

  type VantaEffect = {
    destroy: () => void;
    resize: () => void;
    setOptions: (options: Partial<VantaNetOptions>) => void;
  };

  const createNetEffect: (options: VantaNetOptions) => VantaEffect;
  export default createNetEffect;
}
