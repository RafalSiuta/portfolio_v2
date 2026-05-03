import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { matchPath, useLocation } from 'react-router-dom'
import styles from './nav.module.css'
import TextButton from '../../buttons/textbutton/textbutton'
import { useNavContext } from '../../../utils/providers/navProvider'
import navLinks from '../../../utils/constants/navLinks'
import MenuBtn from '../../buttons/nav_button/navButton'
import Logo from '../../buttons/logo/logo'
import { useI18n } from '../../../utils/providers/lang/langProvider'
import { getNavText } from '../../../utils/providers/lang/services'
import { usePageTransitionContext } from '../../../utils/providers/pageTransitionProvider'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

function Nav() {
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const desktopLogoRef = useRef(null)
  const mobileLogoRef = useRef(null)
  const langButtonRef = useRef(null)
  const indicatorRef = useRef(null)
  const navDividerRef = useRef(null)
  const navRootRef = useRef(null)
  const linkRefs = useRef({})
  const menuItemRefs = useRef([])
  const menuTextRefs = useRef([])
  const activeIndexRef = useRef(0)
  const lastDirectionRef = useRef(1)
  const hasPlayedDesktopIntroRef = useRef(false)
  const shouldAnimateLocaleChangeRef = useRef(false)
  const lastLocaleRef = useRef(null)
  const isProgrammaticScrollRef = useRef(false)
  const scrollEndHandlerRef = useRef(null)
  const indicatorUpdateFrameRef = useRef(null)
  const [activeKey, setActiveKey] = useState(navLinks[0].href)
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
    lastSectionId,
  } = useNavContext()
  const { locale, nextLocale, toggleLocale, t } = useI18n()
  const { isDetailRoute, curtainRevealKey, navigateToDetail, returnToSection } = usePageTransitionContext()
  const navText = getNavText(t)
  const location = useLocation()
  const [isSmallHorizontal, setIsSmallHorizontal] = useState(false)
  const currentMode = isDetailRoute ? 'detail' : 'landing'
  const isProjectDetailRoute = !!matchPath('/projects/:projectId', location.pathname)
  const getDetailLabel = () => {
    if (isProjectDetailRoute) return navText.detailCurrent
    if (matchPath('/r85', location.pathname)) return navText.subpageCurrent.r85
    if (matchPath('/policy', location.pathname)) return navText.subpageCurrent.policy
    if (matchPath('/qa', location.pathname)) return navText.subpageCurrent.qa
    if (matchPath('/video', location.pathname)) return navText.subpageCurrent.video
    return navText.subpageCurrent.errorPage
  }
  const detailLabel = getDetailLabel()
  const detailItems = [
    {
      key: 'detail-back',
      label: navText.detailBack,
      type: 'button',
    },
    {
      key: 'detail-current',
      label: detailLabel,
      type: 'label',
      isActive: true,
    },
  ]

  if (lastLocaleRef.current === null) {
    lastLocaleRef.current = locale
  } else if (lastLocaleRef.current !== locale) {
    shouldAnimateLocaleChangeRef.current = true
    lastLocaleRef.current = locale
  }

  menuTextRefs.current.length = currentMode === 'landing' ? navLinks.length : detailItems.length
  const handleLogoClick = useCallback(() => {
    const currentSectionId = navLinks[pageCounter]?.href.replace('#', '') || 'home'
    navigateToDetail('/r85', { fromSectionId: currentSectionId })
  }, [navigateToDetail, pageCounter])

  const handleLogoKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleLogoClick()
    }
  }, [handleLogoClick])
  const toggleMenuAndBlur = () => {
    buttonRef.current?.blur()
    toggleMenu()
  }

  const closeMenuOverlay = useCallback(() => {
    if (!isSmallHorizontal) return
    setIsMenuOpen(false)
    document.body.style.overflow = ''
  }, [isSmallHorizontal, setIsMenuOpen])

  const updateIndicatorPosition = useCallback(({ immediate = false, localeRefresh = false } = {}) => {
    const menuEl = menuRef.current
    const indicatorEl = indicatorRef.current
    const activeEl = linkRefs.current[activeKey]
    if (!menuEl || !indicatorEl || !activeEl) return

    const linkRect = activeEl.getBoundingClientRect()
    const menuRect = menuEl.getBoundingClientRect()
    const duration = immediate ? 0 : localeRefresh ? 0.42 : 0.3
    const ease = localeRefresh ? 'expo.out' : 'power3.out'

    if (isSmallHorizontal) {
      const y = linkRect.top - menuRect.top
      const height = linkRect.height
      if (localeRefresh && !immediate) {
        gsap.set(indicatorEl, { transformOrigin: '50% 50%' })
      }
      gsap.to(indicatorEl, {
        x: 0,
        y,
        height,
        width: 'var(--layout-stroke)',
        scaleY: 1,
        duration,
        ease,
        overwrite: 'auto',
      })
      return
    }

    const x = linkRect.left - menuRect.left
    const width = linkRect.width
    if (localeRefresh && !immediate) {
      gsap.set(indicatorEl, {
        scaleX: 0.72,
        transformOrigin: '50% 50%',
      })
    }
    gsap.to(indicatorEl, {
      x,
      y: 0,
      width,
      height: 'calc(var(--layout-stroke, 0.125rem) * 3)',
      scaleX: 1,
      duration,
      ease,
      overwrite: 'auto',
    })
  }, [activeKey, isSmallHorizontal])

  const scheduleIndicatorUpdate = useCallback(({ immediate = false, localeRefresh = false } = {}) => {
    if (indicatorUpdateFrameRef.current) {
      window.cancelAnimationFrame(indicatorUpdateFrameRef.current)
    }

    indicatorUpdateFrameRef.current = window.requestAnimationFrame(() => {
      indicatorUpdateFrameRef.current = null
      updateIndicatorPosition({ immediate, localeRefresh })
    })
  }, [updateIndicatorPosition])

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

  useEffect(() => () => {
    if (indicatorUpdateFrameRef.current) {
      window.cancelAnimationFrame(indicatorUpdateFrameRef.current)
      indicatorUpdateFrameRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    const logoEl = isSmallHorizontal ? mobileLogoRef.current : desktopLogoRef.current
    const langButtonEl = langButtonRef.current
    const menuItemEls = menuItemRefs.current.filter(Boolean)
    const dividerEl = navDividerRef.current
    const indicatorEl = indicatorRef.current

    if (!logoEl || !langButtonEl || !menuItemEls.length) return undefined

    const setSharedInitialState = () => {
      gsap.set([logoEl, langButtonEl], {
        autoAlpha: 0,
        scale: 0.5,
        yPercent: -50,
        transformOrigin: '50% 50%',
      })
      gsap.set(logoEl, {
        scale: 0.2,
      })
      gsap.set(menuItemEls, {
        autoAlpha: 0,
        scale: 0.92,
        yPercent: -18,
        transformOrigin: '50% 50%',
      })
    }

    const animateSharedItems = (timeline) => {
      timeline
        .to(logoEl, {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.56,
          ease: 'power3.out',
          overwrite: 'auto',
        })
        .to(langButtonEl, {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.46,
          ease: 'power3.out',
          overwrite: 'auto',
        }, '<50%')
        .to(menuItemEls, {
          autoAlpha: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: 'auto',
        }, '<50%')
    }

    if (isSmallHorizontal) {
      if (!isMenuOpen) {
        gsap.killTweensOf([logoEl, langButtonEl, ...menuItemEls])
        setSharedInitialState()
        return undefined
      }

      setSharedInitialState()
      const timeline = gsap.timeline()
      animateSharedItems(timeline)

      return () => {
        timeline.kill()
      }
    }

    if (hasPlayedDesktopIntroRef.current || !dividerEl || !indicatorEl) {
      gsap.set([logoEl, langButtonEl, ...menuItemEls], {
        clearProps: 'opacity,visibility,scale,transform,transformOrigin,willChange',
      })
      if (dividerEl) {
        gsap.set(dividerEl, {
          clearProps: 'transform,transformOrigin,willChange',
        })
      }
      if (indicatorEl) {
        gsap.set(indicatorEl, {
          clearProps: 'opacity,visibility,scale,transform,transformOrigin,willChange',
        })
      }
      return undefined
    }

    setSharedInitialState()
    gsap.set(dividerEl, {
      scaleX: 0,
      transformOrigin: '0% 50%',
    })
    gsap.set(indicatorEl, {
      autoAlpha: 0,
      scaleX: 0,
      transformOrigin: '50% 50%',
    })

    const timeline = gsap.timeline({
      onComplete: () => {
        hasPlayedDesktopIntroRef.current = true
      },
    })
    animateSharedItems(timeline)
    timeline
      .to(dividerEl, {
        scaleX: 1,
        duration: 0.54,
        ease: 'power3.out',
        overwrite: 'auto',
      }, '>-0.08')
      .to(indicatorEl, {
        autoAlpha: 1,
        scaleX: 1,
        duration: 0.34,
        ease: 'power3.out',
        overwrite: 'auto',
      })

    return () => {
      timeline.kill()
    }
  }, [currentMode, isMenuOpen, isSmallHorizontal])

  useEffect(() => {
    updateIndicatorPosition()
    window.addEventListener('resize', updateIndicatorPosition)

    return () => {
      window.removeEventListener('resize', updateIndicatorPosition)
    }
  }, [updateIndicatorPosition])

  useLayoutEffect(() => {
    if (!shouldAnimateLocaleChangeRef.current) return

    scheduleIndicatorUpdate({ localeRefresh: true })
  }, [locale, scheduleIndicatorUpdate])

  useLayoutEffect(() => {
    if (!shouldAnimateLocaleChangeRef.current) return undefined

    shouldAnimateLocaleChangeRef.current = false

    const menuTextEls = menuTextRefs.current.filter(Boolean)
    if (!menuTextEls.length) return undefined
    if (isSmallHorizontal && !isMenuOpen) return undefined

    gsap.killTweensOf(menuTextEls)
    gsap.set(menuTextEls, {
      autoAlpha: 0,
      yPercent: 65,
    })

    const timeline = gsap.timeline()
    timeline.to(menuTextEls, {
      autoAlpha: 1,
      yPercent: 0,
      duration: 0.42,
      ease: 'power3.out',
      stagger: 0.055,
      overwrite: 'auto',
    })

    return () => {
      timeline.kill()
      gsap.set(menuTextEls, {
        clearProps: 'opacity,visibility,transform,willChange',
      })
    }
  }, [currentMode, isMenuOpen, isSmallHorizontal, locale, navText])

  useLayoutEffect(() => {
    if (currentMode !== 'detail') return undefined
    if (isSmallHorizontal && !isMenuOpen) return undefined

    const logoEl = isSmallHorizontal ? mobileLogoRef.current : desktopLogoRef.current
    const langButtonEl = langButtonRef.current
    const dividerEl = navDividerRef.current
    const indicatorEl = indicatorRef.current
    const menuItemEls = menuItemRefs.current.filter(Boolean)

    if (!logoEl || !langButtonEl || !dividerEl || !indicatorEl || !menuItemEls.length) {
      return undefined
    }

    gsap.killTweensOf([logoEl, langButtonEl, dividerEl, indicatorEl, ...menuItemEls])
    gsap.set([logoEl, langButtonEl], {
      autoAlpha: 0,
      scale: 0.5,
      yPercent: -50,
      transformOrigin: '50% 50%',
    })
    gsap.set(menuItemEls, {
      autoAlpha: 0,
      scale: 0.92,
      yPercent: -18,
      transformOrigin: '50% 50%',
    })
    gsap.set(dividerEl, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: '0% 50%',
    })
    gsap.set(indicatorEl, {
      autoAlpha: 0,
      scaleX: 0.72,
      transformOrigin: '50% 50%',
    })

    const timeline = gsap.timeline()
    timeline
      .to(logoEl, {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
        duration: 0.52,
        ease: 'power3.out',
        overwrite: 'auto',
      })
      .to(langButtonEl, {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
        duration: 0.44,
        ease: 'power3.out',
        overwrite: 'auto',
      }, '<50%')
      .to(menuItemEls, {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
        duration: 0.38,
        ease: 'power3.out',
        stagger: 0.06,
        overwrite: 'auto',
      }, '<55%')
      .to(dividerEl, {
        opacity: 1,
        scaleX: 1,
        duration: 0.38,
        ease: 'power3.out',
        overwrite: 'auto',
      }, '<0.02')
      .to(indicatorEl, {
        autoAlpha: 1,
        scaleX: 1,
        duration: 0.34,
        ease: 'expo.out',
        overwrite: 'auto',
      }, '<0.04')

    return () => {
      timeline.kill()
    }
  }, [curtainRevealKey, currentMode, isMenuOpen, isSmallHorizontal])

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
  }, [activeKey, isSmallHorizontal])

  useEffect(() => {
    if (currentMode !== 'landing') return
    const nextLink = navLinks[pageCounter]
    if (!nextLink) return
    setActiveKey((prev) => (prev === nextLink.href ? prev : nextLink.href))
  }, [currentMode, pageCounter])

  useEffect(() => {
    if (currentMode !== 'detail') return
    setActiveKey('detail-current')
  }, [currentMode, detailLabel])

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
      setActiveKey(link.href)

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
      closeMenuOverlay()
    })
  }, [animateProgressToFull, animateProgressToZero, closeMenuOverlay, pageCounter, setPageCounter, smoother])

  const handleReturnClick = useCallback(() => {
    closeMenuOverlay()
    returnToSection(lastSectionId)
  }, [closeMenuOverlay, lastSectionId, returnToSection])

  const handleLocaleToggle = useCallback(() => {
    toggleLocale()
  }, [toggleLocale])

  useEffect(() => {
    if (currentMode !== 'landing') return
    if (location.pathname !== '/') return
    if (!smoother) return

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
      setActiveKey(navLinks[initialIndex].href)
    }

    const setActiveIndex = (nextIndex) => {
      if (nextIndex === activeIndexRef.current) return
      activeIndexRef.current = nextIndex
      setPageCounter(nextIndex)
      setActiveKey(navLinks[nextIndex].href)
    }

    const sectionTriggers = ids
      .map((id, index) => {
        const el = document.getElementById(id)
        if (!el) return null

        return ScrollTrigger.create({
          trigger: el,
          start: () => `top top+=${getNavOffset()}`,
          end: () => `bottom top+=${getNavOffset()}`,
          onEnter: () => {
            if (isProgrammaticScrollRef.current) return
            setActiveIndex(index)
          },
          onEnterBack: () => {
            if (isProgrammaticScrollRef.current) return
            setActiveIndex(index)
          },
          onUpdate: (self) => {
            lastDirectionRef.current = self.direction
            if (self.isActive && activeIndexRef.current === index) {
              setScrollProgress(Math.round(self.progress * 100))
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
  }, [currentMode, location.pathname, smoother, setPageCounter, setScrollProgress, setScrollDirection])


  const containerClassName = isSmallHorizontal
    ? `${styles.container} ${isMenuOpen ? styles.menuOpen : styles.menuClosed}`
    : styles.container

  return (
    <header className={containerClassName} ref={navRootRef}>
      <nav className={styles.navigation} aria-label="Primary">
        {!isSmallHorizontal && (
          <Logo
            ref={desktopLogoRef}
            isSubpage={currentMode === 'detail'}
            onClick={handleLogoClick}
            onKeyDown={handleLogoKeyDown}
            role="button"
            tabIndex={0}
            ariaLabel="Open r85 project"
          />
        )}
        <div className={styles.menuList}>
          {isSmallHorizontal && (
            <Logo
              ref={mobileLogoRef}
              className={styles.mobileLogo}
              isSubpage={currentMode === 'detail'}
              onClick={handleLogoClick}
              onKeyDown={handleLogoKeyDown}
              role="button"
              tabIndex={0}
              ariaLabel="Open r85 project"
            />
          )}
          <ul className={styles.menu} ref={menuRef}>
            {currentMode === 'landing' ? (
              navLinks.map((link, index) => {
                const label = navText.menuOptions?.[index] ?? link.label
                return (
                  <li
                    key={link.href}
                    ref={(el) => {
                      menuItemRefs.current[index] = el
                    }}
                  >
                    <a
                      className={styles.link}
                      href={link.href}
                      aria-current={activeKey === link.href ? 'page' : undefined}
                      onClick={(event) => handleNavClick(event, link, index)}
                      ref={(el) => {
                        if (el) {
                          linkRefs.current[link.href] = el
                        } else {
                          delete linkRefs.current[link.href]
                        }
                      }}
                    >
                      <span
                        className={styles.linkLabel}
                        ref={(el) => {
                          menuTextRefs.current[index] = el
                        }}
                      >
                        {label}
                      </span>
                    </a>
                  </li>
                )
              })
            ) : (
              detailItems.map((item, index) => (
                <li
                  key={item.key}
                  ref={(el) => {
                    menuItemRefs.current[index] = el
                  }}
                >
                  {item.type === 'button' ? (
                    <TextButton
                      className={styles.link}
                      onClick={handleReturnClick}
                    >
                      <span
                        className={styles.linkLabel}
                        ref={(el) => {
                          menuTextRefs.current[index] = el
                          if (el) {
                            linkRefs.current[item.key] = el
                          } else {
                            delete linkRefs.current[item.key]
                          }
                        }}
                      >
                        {item.label}
                      </span>
                    </TextButton>
                  ) : (
                    <span
                      className={`${styles.link} ${styles.activeLabel}`}
                      aria-current={item.isActive ? 'page' : undefined}
                      ref={(el) => {
                        if (el) {
                          linkRefs.current[item.key] = el
                        } else {
                          delete linkRefs.current[item.key]
                        }
                      }}
                    >
                      <span
                        className={styles.linkLabel}
                        ref={(el) => {
                          menuTextRefs.current[index] = el
                        }}
                      >
                        {item.label}
                      </span>
                    </span>
                  )}
                </li>
              ))
            )}
            <span className={styles.indicator} ref={indicatorRef} aria-hidden="true" />
          </ul>
          <span className={styles.langButtonShell} ref={langButtonRef}>
            <TextButton className={styles.langButton} onClick={handleLocaleToggle}>
              {nextLocale}
            </TextButton>
          </span>
        </div>
      </nav>
      <div className={styles.divider} ref={navDividerRef} aria-hidden="true" />
      <MenuBtn toogle={toggleMenuAndBlur} buttonRef={buttonRef} isOpen={isMenuOpen}/>
    </header>
  )
}

export default Nav
