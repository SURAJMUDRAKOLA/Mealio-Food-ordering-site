/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SENTRY_DSN: string | undefined;
  readonly VITE_APP_VERSION: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


declare module 'animejs/lib/anime.es.js' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const anime: typeof import('animejs');
  export default anime;
}

declare module 'three' {
  export interface Disposable {
    dispose(): void;
  }

  export interface Vector3Like {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): void;
  }

  export interface RotationLike {
    x: number;
    y: number;
    z: number;
  }

  export type Material = Disposable;

  export class Scene {
    add(...objects: object[]): void;
  }

  export class PerspectiveCamera {
    aspect: number;
    position: Vector3Like;
    constructor(fov: number, aspect: number, near: number, far: number);
    updateProjectionMatrix(): void;
  }

  export class WebGLRenderer {
    constructor(options: { canvas: HTMLCanvasElement; alpha?: boolean; antialias?: boolean });
    setPixelRatio(pixelRatio: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }

  export class BufferGeometry implements Disposable {
    setAttribute(name: string, attribute: BufferAttribute): void;
    dispose(): void;
  }

  export class BufferAttribute {
    constructor(array: Float32Array, itemSize: number);
  }

  export class PointsMaterial implements Material {
    constructor(options: object);
    dispose(): void;
  }

  export class MeshStandardMaterial implements Material {
    constructor(options: object);
    dispose(): void;
  }

  export class Points {
    rotation: RotationLike;
    position: Vector3Like;
    constructor(geometry: BufferGeometry, material: PointsMaterial);
  }

  export class TorusGeometry implements Disposable {
    constructor(radius: number, tube: number, radialSegments: number, tubularSegments: number);
    dispose(): void;
  }

  export class IcosahedronGeometry implements Disposable {
    constructor(radius: number, detail: number);
    dispose(): void;
  }

  export class SphereGeometry implements Disposable {
    constructor(radius: number, widthSegments: number, heightSegments: number);
    dispose(): void;
  }

  export class Mesh {
    rotation: RotationLike;
    position: Vector3Like;
    geometry: Disposable;
    material: Material | Material[];
    constructor(geometry: Disposable, material: Material);
  }

  export class PointLight {
    position: Vector3Like;
    constructor(color: number, intensity: number, distance: number);
  }

  export class AmbientLight {
    constructor(color: number, intensity: number);
  }

  export const AdditiveBlending: unknown;
}
