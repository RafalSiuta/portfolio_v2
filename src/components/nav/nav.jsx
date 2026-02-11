import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './nav.module.css'
import TextButton from '../buttons/textbutton/textbutton'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'
import MenuBtn from '../buttons/nav_button/navButton'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

function Nav() {
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const indicatorRef = useRef(null)
  const navDividerRef = useRef(null)
  const navRootRef = useRef(null)
  const linkRefs = useRef({})
  const activeIndexRef = useRef(0)
  const lastDirectionRef = useRef(1)
  const isProgrammaticScrollRef = useRef(false)
  const scrollEndHandlerRef = useRef(null)
  const [activeHash, setActiveHash] = useState(navLinks[0].href)
  const {
    pageCounter,
    setPageCounter,
    setScrollProgress,
    scrollProgress,
    setScrollDirection,
    isMenuOpen,
    setIsMenuOpen,
    toggleMenu,
    smoother,
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
        gsap.to(indicatorEl, { x: 0, y, height, width: 'var(--layout-stroke)', duration: 0.3, ease: 'power3.out' })
        return
      }

      const width = linkRect.width
      gsap.to(indicatorEl, { x, y: 0, width, height: 'calc(var(--layout-stroke, 0.125rem) * 3)', duration: 0.3, ease: 'power3.out' })
    }

    moveIndicator()
    window.addEventListener('resize', moveIndicator)

    return () => {
      window.removeEventListener('resize', moveIndicator)
    }
  }, [activeHash, isSmallHorizontal])

  useEffect(() => {
    const indicatorEl = indicatorRef.current
    const dividerEl = navDividerRef.current
    const menuEl = menuRef.current
    if (!indicatorEl || !dividerEl || !menuEl) return

    const alignIndicatorToDivider = () => {
      if (isSmallHorizontal) {
        indicatorEl.style.bottom = ''
        return
      }

      const dividerRect = dividerEl.getBoundingClientRect()
      const menuRect = menuEl.getBoundingClientRect()
      const indicatorHeight = indicatorEl.getBoundingClientRect().height 
        || parseFloat(window.getComputedStyle(indicatorEl).height)
        || 0
      const dividerCenterY = dividerRect.top + (dividerRect.height / 2)
      const bottomOffset = menuRect.bottom - dividerCenterY - (indicatorHeight / 2)
      indicatorEl.style.bottom = `${bottomOffset}px`
    }

    alignIndicatorToDivider()
    window.addEventListener('resize', alignIndicatorToDivider)

    return () => {
      window.removeEventListener('resize', alignIndicatorToDivider)
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
      activeIndexRef.current = index
      setPageCounter(index)
      setActiveHash(link.href)

      // if (targetSection) {
      //   // targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })


      // }
      if (targetSection) {
          isProgrammaticScrollRef.current = true
          if (scrollEndHandlerRef.current) {
            ScrollTrigger.removeEventListener('scrollEnd', scrollEndHandlerRef.current)
            scrollEndHandlerRef.current = null
          }
          const onScrollEnd = () => {
            isProgrammaticScrollRef.current = false
            ScrollTrigger.removeEventListener('scrollEnd', onScrollEnd)
            scrollEndHandlerRef.current = null
          }
          scrollEndHandlerRef.current = onScrollEnd
          ScrollTrigger.addEventListener('scrollEnd', onScrollEnd)
          if (smoother) {
            smoother.scrollTo(targetSection, true, 'top top')
          } else {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
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
    if (!smoother) return

    const THRESHOLD = 0.6
    const BACK_THRESHOLD = 0.4

    const getNavOffset = () => {
      const navEl = navRootRef.current
      if (!navEl) return 0
      return navEl.getBoundingClientRect().height + 4
    }

    const ids = navLinks.map((link) => link.href.replace('#', ''))
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    const navOffset = getNavOffset()
    const initialIndex = sections.findIndex((section) => {
      const rect = section.getBoundingClientRect()
      return rect.top - navOffset <= 0 && rect.bottom - navOffset > 0
    })
    if (initialIndex >= 0) {
      activeIndexRef.current = initialIndex
      setPageCounter(initialIndex)
      setActiveHash(navLinks[initialIndex].href)
    }

    const sectionTriggers = ids
      .map((id, index) => {
        const el = document.getElementById(id)
        if (!el) return null

        return ScrollTrigger.create({
          trigger: el,
          start: () => `top top+=${getNavOffset()}`,
          end: () => `+=${el.offsetHeight || 1}`,
          onUpdate: (self) => {
            const dir = self.direction
            lastDirectionRef.current = dir

            if (self.isActive && activeIndexRef.current === index) {
              setScrollProgress(Math.round(self.progress * 100))
            }

            if (isProgrammaticScrollRef.current) return

            if (dir === 1 && self.progress >= THRESHOLD && activeIndexRef.current === index) {
              const nextIndex = Math.min(index + 1, navLinks.length - 1)
              if (nextIndex !== activeIndexRef.current) {
                activeIndexRef.current = nextIndex
                setPageCounter(nextIndex)
                setActiveHash(navLinks[nextIndex].href)
              }
            }

            if (dir === -1 && self.progress <= BACK_THRESHOLD && activeIndexRef.current === index) {
              const prevIndex = Math.max(index - 1, 0)
              if (prevIndex !== activeIndexRef.current) {
                activeIndexRef.current = prevIndex
                setPageCounter(prevIndex)
                setActiveHash(navLinks[prevIndex].href)
              }
            }
          },
        })
      })
      .filter(Boolean)

    const globalST = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        lastDirectionRef.current = self.direction
        setScrollDirection(self.direction === 1 ? 'down' : 'up')
      },
    })

    ScrollTrigger.refresh()

    return () => {
      sectionTriggers.forEach((t) => t.kill())
      globalST.kill()
      if (scrollEndHandlerRef.current) {
        ScrollTrigger.removeEventListener('scrollEnd', scrollEndHandlerRef.current)
        scrollEndHandlerRef.current = null
      }
    }
  }, [smoother, setPageCounter, setScrollProgress, setScrollDirection, setActiveHash])

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const currentY = window.scrollY
  //     const direction = currentY >= lastScrollYRef.current ? 'down' : 'up'
  //     lastScrollYRef.current = currentY
  //     setScrollDirection(direction)

  //     const scrollY = window.scrollY
  //     let progressIndex = 0
  //     let progressSection = null
  //     let progressSectionTop = 0
  //     let progressSectionHeight = 1

  //     for (let i = 0; i < navLinks.length; i += 1) {
  //       const sectionId = navLinks[i].href.replace('#', '')
  //       const section = document.getElementById(sectionId)
  //       if (!section) continue
  //       const top = section.getBoundingClientRect().top + scrollY
  //       if (scrollY >= top) {
  //         progressIndex = i
  //         progressSection = section
  //         progressSectionTop = top
  //         progressSectionHeight = section.offsetHeight || 1
  //       }
  //     }

  //     if (!progressSection) {
  //       setScrollProgress(0)
  //       return
  //     }

  //     const rawProgress = (scrollY - progressSectionTop) / progressSectionHeight
  //     const clampedProgress = Math.min(Math.max(rawProgress, 0), 1)
  //     const percentProgress = Math.round(clampedProgress * 100)
  //     setScrollProgress(percentProgress)

  //     const progressThreshold = 60
  //     const prevThreshold = 100 - progressThreshold

  //     if (direction === 'down' && percentProgress >= progressThreshold) {
  //       const nextIndex = Math.min(progressIndex + 1, navLinks.length - 1)
  //       if (nextIndex !== pageCounter) {
  //         setPageCounter(nextIndex)
  //       }
  //     }

  //     if (direction === 'up' && percentProgress <= prevThreshold) {
  //       const prevIndex = Math.max(progressIndex - 1, 0)
  //       if (prevIndex !== pageCounter) {
  //         setPageCounter(prevIndex)
  //       }
  //     }
  //   }

  //   handleScroll()
  //   window.addEventListener('scroll', handleScroll, { passive: true })

  //   return () => {
  //     window.removeEventListener('scroll', handleScroll)
  //   }
  // }, [pageCounter, setScrollProgress, setPageCounter])

  const containerClassName = isSmallHorizontal
    ? `${styles.container} ${isMenuOpen ? styles.menuOpen : styles.menuClosed}`
    : styles.container

  return (
    <header className={containerClassName} ref={navRootRef}>
      <nav className={styles.navigation} aria-label="Primary">
        {!isSmallHorizontal && (
          <img src="/logo.svg" className={styles.logo} alt="Portfolio logo" />
        )}
        <div className={styles.menuList}>
          {isSmallHorizontal && (
            <img
              src="/logo.svg"
              className={`${styles.logo} ${styles.mobileLogo}`}
              alt="Portfolio logo"
            />
          )}
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
      <div className={styles.divider} ref={navDividerRef} aria-hidden="true" />
      <MenuBtn toogle={toggleMenuAndBlur} buttonRef={buttonRef} isOpen={isMenuOpen}/>
    </header>
  )
}

export default Nav
