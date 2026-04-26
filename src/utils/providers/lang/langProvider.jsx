import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import plHome from '../../../assets/i18/pl/home.json'
import enHome from '../../../assets/i18/en/home.json'
import plAbout from '../../../assets/i18/pl/about.json'
import enAbout from '../../../assets/i18/en/about.json'
import plContact from '../../../assets/i18/pl/contact.json'
import enContact from '../../../assets/i18/en/contact.json'
import plNav from '../../../assets/i18/pl/nav.json'
import enNav from '../../../assets/i18/en/nav.json'
import plProjects from '../../../assets/i18/pl/projects.json'
import enProjects from '../../../assets/i18/en/projects.json'
import plDetails from '../../../assets/i18/pl/details.json'
import enDetails from '../../../assets/i18/en/details.json'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'r85_lang'
const SUPPORTED_LOCALES = ['pl', 'en']

const dictionaries = {
  pl: { ...plHome, ...plAbout, ...plContact, ...plNav, ...plProjects, ...plDetails },
  en: { ...enHome, ...enAbout, ...enContact, ...enNav, ...enProjects, ...enDetails },
}

const getInitialLocale = () => {
  if (typeof window === 'undefined') return 'pl'

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'pl' || saved === 'en') {
      return saved
    }
  } catch {
    return 'pl'
  }

  return 'pl'
}

const getValueByPath = (dict, path, fallback) => {
  if (!dict || !path) return fallback
  const parts = path.split('.')
  let node = dict
  for (const part of parts) {
    if (!node || typeof node !== 'object') return fallback
    node = node[part]
  }
  return (typeof node === 'string' || typeof node === 'number' || Array.isArray(node))
    ? node
    : fallback
}

export const isLocalizedValue = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return SUPPORTED_LOCALES.some((localeKey) => localeKey in value)
}

export const getLocalizedValue = (value, locale, fallback = '') => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (!isLocalizedValue(value)) return fallback

  const fallbackLocale = locale === 'pl' ? 'en' : 'pl'
  return value[locale] ?? value[fallbackLocale] ?? fallback
}

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(getInitialLocale)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale)
    }
  }, [locale])

  const toggleLocale = () => {
    setLocale((prev) => {
      const next = prev === 'pl' ? 'en' : 'pl'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        return next
      }
      return next
    })
  }

  const value = useMemo(() => {
    const dict = dictionaries[locale] || dictionaries.pl
    const t = (path, fallback = '') => getValueByPath(dict, path, fallback)
    const nextLocale = locale === 'pl' ? 'en' : 'pl'
    const localize = (content, fallback = '') => getLocalizedValue(content, locale, fallback)
    return { locale, nextLocale, setLocale, toggleLocale, t, dict, localize }
  }, [locale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useI18n must be used within a LanguageProvider')
  return context
}
