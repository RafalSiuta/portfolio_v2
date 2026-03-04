import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import plHome from '../../../assets/i18/pl/home.json'
import enHome from '../../../assets/i18/en/home.json'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'r85_lang'

const dictionaries = {
  pl: plHome,
  en: enHome,
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

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('pl')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'pl' || saved === 'en') {
        setLocale(saved)
      }
    } catch {}
  }, [])

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
      } catch {}
      return next
    })
  }

  const value = useMemo(() => {
    const dict = dictionaries[locale] || dictionaries.pl
    const t = (path, fallback = '') => getValueByPath(dict, path, fallback)
    const nextLocale = locale === 'pl' ? 'en' : 'pl'
    return { locale, nextLocale, setLocale, toggleLocale, t, dict }
  }, [locale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useI18n must be used within a LanguageProvider')
  return context
}
