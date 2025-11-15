import { createContext, useContext, useMemo, useState } from 'react'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [pageCounter, setPageCounter] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollDirection, setScrollDirection] = useState('down')

  const value = useMemo(
    () => ({
      pageCounter,
      setPageCounter,
      scrollProgress,
      setScrollProgress,
      scrollDirection,
      setScrollDirection,
    }),
    [pageCounter, scrollProgress, scrollDirection]
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
