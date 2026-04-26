import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import styles from './contact.module.css'
import contactDesktop from '../../assets/images/contact.jpg'
import contactTablet from '../../assets/images/contact_M.jpg'
import contactMobile from '../../assets/images/contact_S.jpg'
import FormContainer from '../../components/forms/form_container/formContainer'
import { useI18n } from '../../utils/providers/lang/langProvider'
import { getContactText } from '../../utils/providers/lang/services'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'

const CONTACT_SECTION_INDEX = navLinks.findIndex((link) => link.href === '#contact')
const CONTACT_REENTRY_DELAY_MS = 180

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

const isBrowserRefreshNavigation = () => typeof window !== 'undefined' && window.performance
  ?.getEntriesByType?.('navigation')
  ?.some((entry) => entry.entryType === 'navigation' && entry.type === 'reload')

export default function Contact() {
  const {
    pageCounter,
    setPageCounter,
    scrollProgress,
    setScrollProgress,
    scrollDirection,
    setScrollDirection,
    smoother,
  } = useNavContext()
  const { t, locale } = useI18n()
  const contactText = getContactText(t)
  const contentRef = useRef(null)
  const headingRef = useRef(null)
  const fieldWindowRefs = useRef([])
  const placeholderRefs = useRef([])
  const submitButtonRef = useRef(null)
  const pageCounterRef = useRef(pageCounter)
  const scrollProgressRef = useRef(scrollProgress)
  const scrollDirectionRef = useRef(scrollDirection)
  const initialHashRef = useRef(typeof window !== 'undefined' ? window.location.hash : '')
  const lastLocaleRef = useRef(locale)
  const shouldAnimateLocaleChangeRef = useRef(false)
  const shouldReplayContactRefreshRef = useRef(isBrowserRefreshNavigation())
  const contactAnimationRef = useRef({
    isReady: false,
    wasActive: false,
    hasAnimatedThisVisit: false,
    hasAnimatedOnce: false,
    hasInitialTriggerPlayed: false,
    delayedCall: null,
    animateIn: () => {},
    animateOut: () => {},
    animateLocaleIn: () => {},
    reset: () => {},
  })
  const hasBootstrappedContactEntryRef = useRef(false)
  const formAnimationRefs = useMemo(() => ({
    windowRefs: fieldWindowRefs,
    placeholderRefs,
    submitButtonRef,
  }), [])

  if (lastLocaleRef.current !== locale) {
    shouldAnimateLocaleChangeRef.current = true
    lastLocaleRef.current = locale
  }

  pageCounterRef.current = pageCounter
  scrollProgressRef.current = scrollProgress
  scrollDirectionRef.current = scrollDirection
  fieldWindowRefs.current.length = 3
  placeholderRefs.current.length = 3

  useLayoutEffect(() => {
    if (initialHashRef.current !== '#contact' && window.location.hash !== '#contact') return

    pageCounterRef.current = CONTACT_SECTION_INDEX
    scrollDirectionRef.current = 'down'

    setPageCounter(CONTACT_SECTION_INDEX)
    setScrollProgress(100)
    setScrollDirection('down')
    window.history.replaceState(null, '', '/#contact')
  }, [setPageCounter, setScrollDirection, setScrollProgress])

  const isContactInViewport = useCallback(() => {
    const contentEl = contentRef.current
    if (!contentEl) return false

    const rect = contentEl.getBoundingClientRect()
    return rect.top < window.innerHeight * 0.78
      && rect.bottom > window.innerHeight * 0.22
  }, [])

  const evaluateContactAnimationState = useCallback(() => {
    const animation = contactAnimationRef.current
    if (!animation.isReady) return

    const isContactHash = window.location.hash === '#contact' || initialHashRef.current === '#contact'
    const isContactActive = isContactHash
      ? isContactInViewport()
      : pageCounterRef.current === CONTACT_SECTION_INDEX
    const currentScrollDirection = scrollDirectionRef.current

    if (!isContactActive) {
      animation.delayedCall?.kill()
      animation.delayedCall = null

      if (animation.wasActive) {
        animation.hasAnimatedThisVisit = false
        animation.animateOut(currentScrollDirection === 'down' ? 'down' : 'up')
      }

      animation.wasActive = false
      return
    }

    animation.wasActive = true

    if (animation.hasAnimatedThisVisit || animation.delayedCall) {
      return
    }

    animation.delayedCall = gsap.delayedCall(
      animation.hasAnimatedOnce ? CONTACT_REENTRY_DELAY_MS / 1000 : 0,
      () => {
        animation.animateIn({ isReentry: animation.hasAnimatedOnce })
        animation.hasAnimatedThisVisit = true
        animation.hasAnimatedOnce = true
        animation.delayedCall = null
      }
    )
  }, [isContactInViewport])

  useGSAP(() => {
    const contentEl = contentRef.current
    const headingEl = headingRef.current
    const getFieldWindowEls = () => fieldWindowRefs.current.filter(Boolean)
    const getPlaceholderEls = () => placeholderRefs.current.filter(Boolean)
    const getSubmitButtonEl = () => submitButtonRef.current

    if (!contentEl || !headingEl) return undefined

    const splitState = {
      heading: null,
      placeholders: new Map(),
    }
    const splitInstances = []
    let activeTimeline = null
    let rebuildFrame = null
    let refreshFrame = null
    let initialTrigger = null

    const getHeadingLines = () => splitState.heading?.lines ?? []
    const getPlaceholderLines = () => Array
      .from(splitState.placeholders.values())
      .flatMap((split) => split?.lines ?? [])

    const getTextTargets = () => [
      ...getHeadingLines(),
      ...getPlaceholderLines(),
    ].filter(Boolean)

    const killMotion = () => {
      activeTimeline?.kill()
      activeTimeline = null
      gsap.killTweensOf([
        ...getTextTargets(),
        ...getFieldWindowEls(),
        getSubmitButtonEl(),
      ].filter(Boolean))
    }

    const clearDelayedCall = () => {
      contactAnimationRef.current.delayedCall?.kill()
      contactAnimationRef.current.delayedCall = null
    }

    const setTextInitialState = (targets) => {
      if (!targets.length) return

      gsap.set(targets, {
        transformPerspective: 900,
        transformOrigin: '50% 50% -140px',
        rotationX: -95,
        yPercent: 110,
        opacity: 0,
        willChange: 'transform, opacity',
      })
    }

    const setInitialState = () => {
      setTextInitialState(getHeadingLines())
      setTextInitialState(getPlaceholderLines())
      gsap.set(getFieldWindowEls(), {
        opacity: 0,
        yPercent: 18,
        willChange: 'transform, opacity',
      })
      if (getSubmitButtonEl()) {
        gsap.set(getSubmitButtonEl(), {
          opacity: 0,
          scale: 0.88,
          yPercent: 12,
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity',
        })
      }
    }

    const setVisibleState = () => {
      gsap.set(getHeadingLines(), {
        rotationX: 0,
        yPercent: 0,
        opacity: 1,
        willChange: 'transform, opacity',
      })
      gsap.set(getPlaceholderLines(), {
        rotationX: 0,
        yPercent: 0,
        opacity: 1,
        willChange: 'transform, opacity',
      })
      gsap.set(getFieldWindowEls(), {
        opacity: 1,
        yPercent: 0,
        willChange: 'transform, opacity',
      })
      if (getSubmitButtonEl()) {
        gsap.set(getSubmitButtonEl(), {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          willChange: 'transform, opacity',
        })
      }
    }

    const animateIn = ({ isReentry = false } = {}) => {
      killMotion()
      const fieldWindowEls = getFieldWindowEls()
      const placeholderLines = getPlaceholderLines()
      const submitButtonEl = getSubmitButtonEl()
      activeTimeline = gsap.timeline({ delay: isReentry ? 0.14 : 0 })

      activeTimeline
        .to(getHeadingLines(), {
          rotationX: 0,
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: 'auto',
        })
        .to(fieldWindowEls, {
          opacity: 1,
          yPercent: 0,
          duration: 0.56,
          ease: 'power3.out',
          stagger: 0.1,
          overwrite: 'auto',
        }, '<0.24')
        .to(placeholderLines, {
          rotationX: 0,
          yPercent: 0,
          opacity: 1,
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.06,
          overwrite: 'auto',
        }, '<0.28')

      if (submitButtonEl) {
        activeTimeline.to(submitButtonEl, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.46,
          ease: 'back.out(1.7)',
          overwrite: 'auto',
        }, 0.72)
      }
    }

    const animateOut = (direction) => {
      killMotion()
      const yPercent = direction === 'down' ? -24 : 24
      const fieldWindowEls = getFieldWindowEls()
      const placeholderLines = getPlaceholderLines()
      const submitButtonEl = getSubmitButtonEl()

      activeTimeline = gsap.timeline()

      if (submitButtonEl) {
        activeTimeline.to(submitButtonEl, {
          opacity: 0,
          scale: 0.88,
          yPercent,
          duration: 0.26,
          ease: 'power2.in',
          overwrite: 'auto',
        })
      }

      activeTimeline
        .to(placeholderLines.slice().reverse(), {
          rotationX: direction === 'down' ? 85 : -85,
          yPercent: direction === 'down' ? -110 : 110,
          opacity: 0,
          duration: 0.32,
          ease: 'power2.in',
          stagger: 0.035,
          overwrite: 'auto',
        }, submitButtonEl ? '<0.04' : 0)
        .to(fieldWindowEls.slice().reverse(), {
          opacity: 0,
          yPercent,
          duration: 0.28,
          ease: 'power2.in',
          stagger: 0.055,
          overwrite: 'auto',
        }, '<0.06')
        .to(getHeadingLines(), {
          rotationX: direction === 'down' ? 85 : -85,
          yPercent: direction === 'down' ? -110 : 110,
          opacity: 0,
          duration: 0.38,
          ease: 'power2.in',
          stagger: 0.04,
          overwrite: 'auto',
        }, '<0.08')
    }

    const animateLocaleIn = () => {
      killMotion()
      const textTargets = getTextTargets()
      const fieldWindowEls = getFieldWindowEls()
      const submitButtonEl = getSubmitButtonEl()

      gsap.set(fieldWindowEls, {
        opacity: 1,
        yPercent: 0,
        willChange: 'transform, opacity',
      })
      setTextInitialState(textTargets)
      if (submitButtonEl) {
        gsap.set(submitButtonEl, {
          opacity: 0,
          scale: 0.92,
          yPercent: 10,
        })
      }

      activeTimeline = gsap.timeline()
      activeTimeline.to(textTargets, {
        rotationX: 0,
        yPercent: 0,
        opacity: 1,
        duration: 0.64,
        ease: 'power3.out',
        stagger: 0.055,
        overwrite: 'auto',
      })

      if (submitButtonEl) {
        activeTimeline.to(submitButtonEl, {
          opacity: 1,
          scale: 1,
          yPercent: 0,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: 'auto',
        }, '<0.18')
      }
    }

    const rebuildAnimation = () => {
      rebuildFrame = null
      killMotion()
      clearDelayedCall()

      const isContactHash = window.location.hash === '#contact' || initialHashRef.current === '#contact'
      const isContactActive = pageCounterRef.current === CONTACT_SECTION_INDEX
        || (isContactHash && isContactInViewport())
      const shouldReplayInitialAnimation = shouldReplayContactRefreshRef.current
        && isContactActive
      const shouldAnimateLocaleChange = shouldAnimateLocaleChangeRef.current
        && contactAnimationRef.current.hasAnimatedOnce
        && isContactActive
      const shouldKeepVisibleState = contactAnimationRef.current.hasAnimatedOnce
        && contactAnimationRef.current.hasInitialTriggerPlayed
        && isContactActive
        && !shouldReplayInitialAnimation
        && !shouldAnimateLocaleChange

      shouldAnimateLocaleChangeRef.current = false

      if (shouldAnimateLocaleChange) {
        gsap.set(getFieldWindowEls(), {
          opacity: 1,
          yPercent: 0,
          willChange: 'transform, opacity',
        })
        setTextInitialState(getTextTargets())
        if (getSubmitButtonEl()) {
          gsap.set(getSubmitButtonEl(), {
            opacity: 0,
            scale: 0.92,
            yPercent: 10,
            transformOrigin: '50% 50%',
            willChange: 'transform, opacity',
          })
        }
      } else if (shouldReplayInitialAnimation) {
        setInitialState()
      } else if (shouldKeepVisibleState) {
        setVisibleState()
      } else {
        setInitialState()
      }

      contactAnimationRef.current.isReady = true
      contactAnimationRef.current.hasAnimatedThisVisit = shouldKeepVisibleState || shouldAnimateLocaleChange
      if (shouldReplayInitialAnimation) {
        contactAnimationRef.current.hasInitialTriggerPlayed = true
        contactAnimationRef.current.hasAnimatedOnce = true
        contactAnimationRef.current.wasActive = true
      }
      contactAnimationRef.current.animateIn = animateIn
      contactAnimationRef.current.animateOut = animateOut
      contactAnimationRef.current.animateLocaleIn = animateLocaleIn
      contactAnimationRef.current.reset = () => {
        killMotion()
        clearDelayedCall()
        setInitialState()
      }

      initialTrigger?.kill()
      initialTrigger = ScrollTrigger.create({
        trigger: contentEl,
        start: 'top 78%',
        end: 'bottom 22%',
        once: true,
        onEnter: () => {
          if (contactAnimationRef.current.hasInitialTriggerPlayed || contactAnimationRef.current.hasAnimatedThisVisit) {
            return
          }
          contactAnimationRef.current.hasInitialTriggerPlayed = true
          contactAnimationRef.current.hasAnimatedThisVisit = true
          contactAnimationRef.current.hasAnimatedOnce = true
          contactAnimationRef.current.wasActive = true
          animateIn({ isReentry: false })
        },
      })

      if (initialTrigger.isActive && !contactAnimationRef.current.hasInitialTriggerPlayed) {
        contactAnimationRef.current.hasInitialTriggerPlayed = true
        contactAnimationRef.current.hasAnimatedThisVisit = true
        contactAnimationRef.current.hasAnimatedOnce = true
        contactAnimationRef.current.wasActive = true
        animateIn({ isReentry: false })
      }

      if (shouldAnimateLocaleChange) {
        contactAnimationRef.current.hasInitialTriggerPlayed = true
        contactAnimationRef.current.hasAnimatedOnce = true
        contactAnimationRef.current.wasActive = true
      }

      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = null
        ScrollTrigger.refresh()

        if (shouldReplayInitialAnimation) {
          shouldReplayContactRefreshRef.current = false
          contactAnimationRef.current.hasAnimatedThisVisit = true
          animateIn({ isReentry: false })
        } else if (shouldAnimateLocaleChange) {
          contactAnimationRef.current.hasAnimatedThisVisit = true
          animateLocaleIn()
        } else if (!contactAnimationRef.current.hasInitialTriggerPlayed) {
          evaluateContactAnimationState()
        }
      })
    }

    const scheduleRebuild = () => {
      if (rebuildFrame) {
        window.cancelAnimationFrame(rebuildFrame)
      }
      rebuildFrame = window.requestAnimationFrame(rebuildAnimation)
    }

    splitInstances.push(
      SplitText.create(headingEl, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          splitState.heading = self
          scheduleRebuild()
        },
      })
    )

    getPlaceholderEls().forEach((placeholderEl, index) => {
      splitInstances.push(
        SplitText.create(placeholderEl, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            splitState.placeholders.set(index, self)
            scheduleRebuild()
          },
        })
      )
    })

    return () => {
      if (rebuildFrame) {
        window.cancelAnimationFrame(rebuildFrame)
      }
      if (refreshFrame) {
        window.cancelAnimationFrame(refreshFrame)
      }
      contactAnimationRef.current.isReady = false
      contactAnimationRef.current.wasActive = false
      contactAnimationRef.current.hasAnimatedThisVisit = false
      contactAnimationRef.current.hasInitialTriggerPlayed = false
      contactAnimationRef.current.animateIn = () => {}
      contactAnimationRef.current.animateOut = () => {}
      contactAnimationRef.current.animateLocaleIn = () => {}
      contactAnimationRef.current.reset = () => {}
      initialTrigger?.kill()
      clearDelayedCall()
      killMotion()
      splitInstances.forEach((instance) => instance.revert())
    }
  }, {
    dependencies: [
      locale,
      contactText.title,
      contactText.form.email.placeholder,
      contactText.form.topic.placeholder,
      contactText.form.message.placeholder,
      contactText.submitButton,
      evaluateContactAnimationState,
      isContactInViewport,
    ],
    revertOnUpdate: true,
  })

  useEffect(() => {
    const isContactEntry = initialHashRef.current === '#contact'
      && pageCounterRef.current === CONTACT_SECTION_INDEX
      && scrollProgress >= 90
    if (!isContactEntry) return undefined
    if (hasBootstrappedContactEntryRef.current) return undefined

    let attempt = 0
    let frameId = null
    let delayedCall = null
    let hasAlignedContactScroll = false

    const alignContactScroll = () => {
      if (hasAlignedContactScroll) return

      const contactSection = document.getElementById('contact')
      if (!contactSection) return

      hasAlignedContactScroll = true

      if (smoother) {
        smoother.scrollTo(contactSection, false, 'top top')
      } else {
        contactSection.scrollIntoView({ behavior: 'auto', block: 'start' })
      }

      ScrollTrigger.refresh()
    }

    const scheduleNextCheck = () => {
      attempt += 1
      if (attempt > 14) return

      delayedCall = gsap.delayedCall(attempt < 4 ? 0.06 : 0.12, () => {
        frameId = window.requestAnimationFrame(runContactEntryCheck)
      })
    }

    const runContactEntryCheck = () => {
      frameId = null
      delayedCall = null

      const animation = contactAnimationRef.current
      alignContactScroll()

      if (!animation.isReady) {
        scheduleNextCheck()
        return
      }

      ScrollTrigger.refresh()

      hasBootstrappedContactEntryRef.current = true
      animation.delayedCall?.kill()
      animation.delayedCall = null
      animation.reset()
      animation.wasActive = true
      animation.hasInitialTriggerPlayed = true
      animation.hasAnimatedThisVisit = true
      animation.hasAnimatedOnce = true
      animation.animateIn({ isReentry: false })
    }

    frameId = window.requestAnimationFrame(runContactEntryCheck)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      delayedCall?.kill()
    }
  }, [scrollProgress, smoother])

  useEffect(() => {
    evaluateContactAnimationState()
  }, [evaluateContactAnimationState, pageCounter, scrollDirection, scrollProgress])

  return (
    <HeroWrapper
      id="contact"
      className={styles.section}
      images={{
        desktop: contactDesktop,
        tablet: contactTablet,
        mobile: contactMobile,
      }}
      isLastSection={true}
    >
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content} ref={contentRef}>
          <h1 key={`${locale}-contact-heading`} className="strokeText" ref={headingRef}>{contactText.title}</h1>
          <FormContainer key={`${locale}-contact-form`} animationRefs={formAnimationRefs} />
        </div>
      </SectionWrapper>
    </HeroWrapper>
  )
}
