export default [
  {
    url: "/i18n/api/app/zh/translation.json", // 接口路径
    method: "get", // 请求方法
    response: () => {
      return {
        hello: "你好",
      };
    },
  },
];
