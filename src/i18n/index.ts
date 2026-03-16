import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { settings } from "../../config/settings.ts";

// 是否是开发环境
const isDev = import.meta.env.DEV;

i18n
  .use(HttpApi) // 从 public/locales 加载翻译文件
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "zh",
    supportedLngs: ["en", "zh"],
    backend: {
      loadPath: `/i18n/api${settings.path}/{{lng}}/{{ns}}.json`, // 路径模板
    },
    debug: isDev,
    interpolation: {
      escapeValue: false, // React 已经防止 XSS
    },
  })
  .then(() => {
    // do nothing
  });

const preLang = localStorage.getItem("sword-lang");
if (preLang) {
  i18n.changeLanguage(preLang).then(() => {
    // do nothing
  });
}

export default i18n;
