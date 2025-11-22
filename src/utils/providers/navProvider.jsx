import { createContext, useContext, useMemo, useState } from 'react'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [pageCounter, setPageCounter] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('down')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const next = !prev
      if (next) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
      return next
    })
  }

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
    }),
    [pageCounter, scrollProgress, scrollDirection, isMenuOpen]
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
