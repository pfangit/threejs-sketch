export default {
  development: {
    "/auth": {
      target: "http://localhost",
      changeOrigin: true,
      pathRewrite: {
        "^": "",
      },
    },
  },
  prod: {
    "/auth": {
      target: "http://localhost",
      changeOrigin: true,
      pathRewrite: {
        "^": "",
      },
    },
  },
};
