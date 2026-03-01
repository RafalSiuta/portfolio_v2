import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import navLinks from '../constants/navLinks'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [pageCounter, setPageCounter] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('down')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const sectionIds = useMemo(() => navLinks.map((link) => link.href.replace('#', '')), [])
  const sectionCount = sectionIds.length
  //todo fix scroll to contact section and pagecounter que order

  // ✅ nowość: referencja do ScrollSmoother
  const [smoother, setSmoother] = useState(null)

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const next = !prev
      document.body.style.overflow = next ? 'hidden' : ''
      return next
    })
  }

  const scrollToSection = useCallback((index) => {
    if (!sectionCount) return
    const wrappedIndex = (index + sectionCount) % sectionCount
    const sectionId = sectionIds[wrappedIndex]
    const targetSection = document.getElementById(sectionId)
    if (!targetSection) return

    if (smoother) {
      smoother.scrollTo(targetSection, true, 'top top')
    } else {
      targetSection.scrollIntoView({ block: 'start' })
    }
    setPageCounter(wrappedIndex)
  }, [sectionCount, sectionIds, smoother, setPageCounter])
  useEffect(() => {
    const link = navLinks[pageCounter]
    if (!link) return
    const id = link.href.replace('#', '')
    window.history.replaceState(null, '', `/#${id}`)
  }, [pageCounter])

  useEffect(() => {
    const isEditableTarget = (target) => {
      if (!target) return false
      const tag = target.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
    }

    const handleKeyDown = (event) => {
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
  }, [isMenuOpen, pageCounter, scrollToSection])


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

      // ✅ expose
      smoother,
      setSmoother,
    }),
    [pageCounter, scrollProgress, scrollDirection, isMenuOpen, smoother]
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNavContext() {
  const context = useContext(NavContext)
  if (!context) throw new Error('useNavContext must be used within a NavProvider')
  return context
}

