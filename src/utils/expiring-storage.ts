export const expiringStorage = {
  // 设置带过期时间的数据，expireTime单位为s
  set(key: string, value: any, expireTime: number) {
    const now = Date.now();
    const item = {
      value: value,
      expires: now + expireTime * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  // 获取数据，如果过期则自动删除并返回 null
  get(key: string) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = Date.now();

    if (now > item.expires) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },

  // 删除数据
  remove(key: string) {
    localStorage.removeItem(key);
  },
};
