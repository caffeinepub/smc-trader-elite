export {};

declare module "./backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
}
