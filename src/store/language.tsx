import i18n from "i18next";
import { createStore } from "./create-store";

export type LanguageEnum = "zh-CN" | "en-US";

interface LanguageState {
  lang: LanguageEnum;
  setLang: (lang: LanguageEnum) => void;
}
const langCacheKey = "lang-default";

const defaultLang = (localStorage.getItem(langCacheKey) ||
  "zh") as LanguageEnum;

export const useLanguageStore = createStore<LanguageState>(
  (set) => ({
    lang: defaultLang,
    setLang: (lang) => {
      i18n.changeLanguage(lang).then(() => {
        // do nothing
      });
      localStorage.setItem(langCacheKey, lang);
      set({ lang });
    },
  }),
  "LanguageStore",
);
