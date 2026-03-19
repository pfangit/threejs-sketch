declare global {
  interface ImportMeta {
    env: {
      VITE_BASE_API: string;
    };
    glob: (
      path: string,
      options: Record<string, unknown>,
    ) => {
      [key: string]: { default: object[] };
    };
  }
}