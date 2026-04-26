import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import navLinks from '../constants/navLinks'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const location = useLocation()
  const [pageCounter, setPageCounter] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('down')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const sectionIds = useMemo(() => navLinks.map((link) => link.href.replace('#', '')), [])
  const sectionCount = sectionIds.length
  const [lastSectionId, setLastSectionId] = useState(() => {
    if (typeof window === 'undefined') {
      return sectionIds[0] ?? 'home'
    }
    return window.sessionStorage.getItem('lastSectionId') || sectionIds[0] || 'home'
  })

  const [smoother, setSmoother] = useState(null)

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const next = !prev
      document.body.style.overflow = next ? 'hidden' : ''
      return next
    })
  }

  const rememberLastSection = useCallback((id) => {
    if (!id) return
    setLastSectionId(id)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('lastSectionId', id)
    }
  }, [])

  const scrollToSectionId = useCallback((sectionId, { immediate = false, updatePageCounter = true } = {}) => {
    if (!sectionId) return false

    const targetIndex = sectionIds.findIndex((id) => id === sectionId)
    const targetSection = document.getElementById(sectionId)
    if (!targetSection) return false

    if (smoother) {
      smoother.scrollTo(targetSection, !immediate, 'top top')
    } else {
      targetSection.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'start' })
    }

    if (updatePageCounter && targetIndex >= 0) {
      setPageCounter(targetIndex)
    }

    rememberLastSection(sectionId)
    return true
  }, [rememberLastSection, sectionIds, smoother, setPageCounter])

  const scrollToSection = useCallback((index) => {
    if (!sectionCount) return
    const wrappedIndex = (index + sectionCount) % sectionCount
    const sectionId = sectionIds[wrappedIndex]
    scrollToSectionId(sectionId)
  }, [scrollToSectionId, sectionCount, sectionIds])

  useEffect(() => {
    if (location.pathname !== '/') return
    const link = navLinks[pageCounter]
    if (!link) return
    const id = link.href.replace('#', '')
    rememberLastSection(id)
    window.history.replaceState(null, '', `/#${id}`)
  }, [pageCounter, location.pathname, rememberLastSection])

  useEffect(() => {
    const isEditableTarget = (target) => {
      if (!target) return false
      const tag = target.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
    }

    const handleKeyDown = (event) => {
      if (location.pathname !== '/') return
      if (isMenuOpen) return
      if (event.defaultPrevented) return
      if (isEditableTarget(event.target)) return

      const activeEl = document.activeElement
      if (activeEl && typeof activeEl.blur === 'function') {
        activeEl.blur()
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        scrollToSection(pageCounter + 1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        scrollToSection(pageCounter - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen, location.pathname, pageCounter, scrollToSection])


  const value = useMemo(
    () => ({
      pageCounter,
      setPageCounter,
      scrollProgress,
      setScrollProgress,
      scrollDirection,
      setScrollDirection,
      isMenuOpen,
      setIsMenuOpen,
      toggleMenu,

      smoother,
      setSmoother,
      scrollToSectionId,

      lastSectionId,
      setLastSectionId,
      rememberLastSection,
    }),
    [pageCounter, scrollProgress, scrollDirection, isMenuOpen, smoother, scrollToSectionId, lastSectionId, rememberLastSection]
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNavContext() {
  const context = useContext(NavContext)
  if (!context) {
    throw new Error('useNavContext must be used within a NavProvider')
  }
  return context
}

