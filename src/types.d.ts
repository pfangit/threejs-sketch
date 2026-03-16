declare global {
  interface ImportMeta {
    env: {
      VITE_BASE_API: string;
    };
    glob: (
      path: string,
      options: Record<string, any>,
    ) => {
      [key: string]: { default: object[] };
    };
  }
}
