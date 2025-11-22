import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './nav.module.css'
import TextButton from '../buttons/textbutton/textbutton'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'
import MenuBtn from '../buttons/nav_button/navButton'

function Nav() {
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const indicatorRef = useRef(null)
  const linkRefs = useRef({})
  const [activeHash, setActiveHash] = useState(navLinks[0].href)
  const lastScrollYRef = useRef(0)
  const {
    pageCounter,
    setPageCounter,
    setScrollProgress,
    scrollProgress,
    setScrollDirection,
    isMenuOpen,
    setIsMenuOpen,
    toggleMenu,
  } = useNavContext()
  const [isSmallHorizontal, setIsSmallHorizontal] = useState(false)
  const toggleMenuAndBlur = () => {
    buttonRef.current?.blur()
    toggleMenu()
  }

  useEffect(() => {
    const updateBreakpoint = () => {
      const breakpoint = 1194
      setIsSmallHorizontal(window.innerWidth <= breakpoint)
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  useEffect(() => {
    if (!isSmallHorizontal) {
      setIsMenuOpen(false)
      document.body.style.overflow = ''
    }
  }, [isSmallHorizontal, setIsMenuOpen])

  useEffect(() => {
    const menuEl = menuRef.current
    const indicatorEl = indicatorRef.current
    const activeEl = linkRefs.current[activeHash]
    if (!menuEl || !indicatorEl || !activeEl) return

    const moveIndicator = () => {
      const linkRect = activeEl.getBoundingClientRect()
      const menuRect = menuEl.getBoundingClientRect()
      const x = linkRect.left - menuRect.left

      if (isSmallHorizontal) {
        const y = linkRect.top - menuRect.top
        const height = linkRect.height
        gsap.to(indicatorEl, { x: 0, y, height, width: '0.1875rem', duration: 0.3, ease: 'power3.out' })
        return
      }

      const width = linkRect.width
      gsap.to(indicatorEl, { x, y: 0, width, height: '0.125rem', duration: 0.3, ease: 'power3.out' })
    }

    moveIndicator()
    window.addEventListener('resize', moveIndicator)

    return () => {
      window.removeEventListener('resize', moveIndicator)
    }
  }, [activeHash, isSmallHorizontal])

  useEffect(() => {
    const nextLink = navLinks[pageCounter]
    if (!nextLink) return
    setActiveHash((prev) => (prev === nextLink.href ? prev : nextLink.href))
  }, [pageCounter])

  const animateProgressToFull = useCallback((onComplete) => {
    setScrollDirection('down')
    const proxy = { value: scrollProgress }
    gsap.to(proxy, {
      value: 100,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => setScrollProgress(Math.round(proxy.value)),
      onComplete,
    })
  }, [scrollProgress, setScrollDirection, setScrollProgress])

  const animateProgressToZero = useCallback(() => {
    const proxy = { value: 100 }
    gsap.to(proxy, {
      value: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onUpdate: () => setScrollProgress(Math.round(proxy.value)),
    })
  }, [setScrollProgress])

  const handleNavClick = useCallback((event, link, index) => {
    event.preventDefault()
    const sectionId = link.href.replace('#', '')
    const targetSection = document.getElementById(sectionId)
    const isSamePage = index === pageCounter

    animateProgressToFull(() => {
      if (!isSamePage) {
        setPageCounter(index)
        setActiveHash(link.href)
      }
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (isSamePage) {
        animateProgressToZero()
      }
      if (isSmallHorizontal) {
        setIsMenuOpen(false)
        document.body.style.overflow = ''
      }
    })
  }, [animateProgressToFull, animateProgressToZero, pageCounter, setActiveHash, setPageCounter, isSmallHorizontal, setIsMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const direction = currentY >= lastScrollYRef.current ? 'down' : 'up'
      lastScrollYRef.current = currentY
      setScrollDirection(direction)

      const currentLink = navLinks[pageCounter]
      if (!currentLink) {
        setScrollProgress(0)
        return
      }

      const sectionId = currentLink.href.replace('#', '')
      const currentSection = document.getElementById(sectionId)
      if (!currentSection) {
        setScrollProgress(0)
        return
      }

      const sectionRect = currentSection.getBoundingClientRect()
      const sectionTop = sectionRect.top + window.scrollY
      const sectionHeight = currentSection.offsetHeight || 1
      const rawProgress = (window.scrollY - sectionTop) / sectionHeight
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1)
      const percentProgress = Math.round(clampedProgress * 100)
      setScrollProgress(percentProgress)

      if (direction === 'down' && percentProgress >= 100) {
        const nextIndex = Math.min(pageCounter + 1, navLinks.length - 1)
        if (nextIndex !== pageCounter) {
          setPageCounter(nextIndex)
        }
      }

      if (direction === 'up' && percentProgress <= 0) {
        const prevIndex = Math.max(pageCounter - 1, 0)
        if (prevIndex !== pageCounter) {
          setPageCounter(prevIndex)
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pageCounter, setScrollProgress, setPageCounter])

  const containerClassName = isSmallHorizontal
    ? `${styles.container} ${isMenuOpen ? styles.menuOpen : styles.menuClosed}`
    : styles.container

  return (
    <header className={containerClassName}>
      <nav className={styles.navigation} aria-label="Primary">
        <img src="/text_logo.svg" className={styles.logo} alt="Portfolio logo" />
        <div className={styles.menuList}>
          <ul className={styles.menu} ref={menuRef}>
            {navLinks.map((link, index) => (
              <li key={link.href}>
                <a
                  className={styles.link}
                  href={link.href}
                  aria-current={activeHash === link.href ? 'page' : undefined}
                  onClick={(event) => handleNavClick(event, link, index)}
                  ref={(el) => {
                    if (el) {
                      linkRefs.current[link.href] = el
                    } else {
                      delete linkRefs.current[link.href]
                    }
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <span className={styles.indicator} ref={indicatorRef} aria-hidden="true" />
          </ul>
          <TextButton className={styles.langButton}>pl</TextButton>
        </div>
      </nav>
      <MenuBtn toogle={toggleMenuAndBlur} buttonRef={buttonRef} isOpen={isMenuOpen}/>
    </header>
  )
}

export default Nav
