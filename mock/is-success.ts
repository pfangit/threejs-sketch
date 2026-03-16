export const isSuccess = (success?: boolean) => {
  if (success) {
    return { success: true, code: 0 };
  }
  // 随机决定是否成功（code 为 0 或非 0）
  const isSuccess = Math.random() > 0.7; // 30% 概率成功，70% 概率失败
  const code = isSuccess ? 0 : Math.floor(Math.random() * 100) + 1; // 成功为 0，失败为 1-100 的随机数

  return { success: isSuccess, code: code };
};
