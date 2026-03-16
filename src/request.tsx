import { type AlovaMethodCreateConfig, createAlova } from "alova";
import adapterFetch from "alova/fetch";
import ReactHook from "alova/react";

export type ApiResponse<T> = {
  success: boolean;
  code: number;
  data: T;
  message: string;
};

export const request = createAlova({
  baseURL: "/",
  requestAdapter: adapterFetch(),
  statesHook: ReactHook,
  async beforeRequest(method) {
    // 应用全局请求拦截，例如注入token
    method.config.headers.token = "token";
  },
  // 使用 responded 对象分别指定请求成功的拦截器和请求失败的拦截器
  responded: {
    // 请求成功的拦截器
    // 当使用 `alova/fetch` 请求适配器时，第一个参数接收Response对象
    // 第二个参数为当前请求的method实例，你可以用它同步请求前后的配置信息
    onSuccess: async (response, method) => {
      if (response.status >= 400) {
        throw new Error(response.statusText);
      }

      // 从 method 配置中获取期望的响应类型
      // @ts-expect-error
      const responseType = method.config.responseType || "json";

      let data: Blob | string | any;
      switch (responseType) {
        case "blob":
          data = await response.blob();
          break;
        case "text":
          data = await response.text();
          break;
        case "json":
        default: {
          const json = await response.json();
          if (json.code !== 0) {
            // 抛出错误或返回reject状态的Promise实例时，此请求将抛出错误
            throw new Error(json.message);
          }
          data = json.data;
          break;
        }
      }
      // 解析的响应数据将传给method实例的transform钩子函数，这些函数将在后续讲解
      // console.log("[request][success]", data);
      return data;
    },

    // 请求失败的拦截器
    // 请求错误时将会进入该拦截器。
    // 第二个参数为当前请求的method实例，你可以用它同步请求前后的配置信息
    onError: (err, method) => {
      console.log("[request][error]", method);
      console.error(err.message);
    },

    // 请求完成的拦截器
    // 当你需要在请求不论是成功、失败、还是命中缓存都需要执行的逻辑时，可以在创建alova实例时指定全局的`onComplete`拦截器，例如关闭请求 loading 状态。
    // 接收当前请求的method实例
    onComplete: async (_method) => {
      // console.log("[request][complete]", method);
      // 处理请求完成逻辑
    },
  },
});

export const fecth = <T = any>(
  url: string,
  options?: AlovaMethodCreateConfig<any, any, any>,
) => {
  return request.Get<T>(url, options);
};

export const asyncFetch = async <T = any>(
  url: string,
  options?: any,
): Promise<T> => {
  const response = await request.Get(url, options);
  return response as T;
};
