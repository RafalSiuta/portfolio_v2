import { useEffect, useState, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import IconLink from '../buttons/icon_link/icon_link'
import FooterLink from '../buttons/footer_link/footerLink'
import styles from './footer.module.css'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'

const footerLinks = [
  { to: '/r85', name: "copyrights'26", isLink:true },
  { to: 'mailto:r85unit@gmail.com', name: 'r85unit@gmail.com' },
  { to: '/policy', name: 'privacy policy', isLink: true },
  { to: '/qa', name: 'q&a', isLink: true },
  { to: 'https://buymeacoffee.com/r85apps', name: 'buy me a coffe' },
  { to: '/r85', name: 'r85studio', isLink: true },
  { to: 'https://play.google.com/store/apps/details?id=org.r85.calendar_todo', name: 'google playstore' },
]

const iconsList = [
  { link: '#', name: 'Play', label: 'Odtworz' },
  { link: 'https://github.com/RafalSiuta', name: 'Github', label: 'GitHub' },
  
  { link: 'https://linkedin.com/in/rafal-siuta-3023ba323', name: 'Linkedin', label: 'LinkedIn' },
  
]

function Footer({ variant = 'floating' }) {
  const { isMenuOpen, pageCounter } = useNavContext()
  const { isDetailFooterVisible } = usePageTransitionContext()
  const [isTabletDown, setIsTabletDown] = useState(false)
  const iconRefs = useRef([])
  const footerLinkRefs = useRef([])
  const socialAnimationRef = useRef(null)
  const footerLinksAnimationRef = useRef(null)
  const previousSocialVisibilityRef = useRef(null)
  const previousFooterLinksVisibilityRef = useRef(null)
  const lastIndex = useMemo(() => Math.max(navLinks.length - 1, 0), [])
  const isInline = variant === 'inline'
  const isDetail = variant === 'detail'
  const isAlwaysVisible = isInline
  const shouldShowSocial = isDetail
    ? isDetailFooterVisible
    : isTabletDown
      ? isAlwaysVisible || isMenuOpen
      : isAlwaysVisible || pageCounter === 0 || pageCounter === lastIndex
  const [isSocialListVisible, setIsSocialListVisible] = useState(shouldShowSocial)
  const shouldShowFooterLinks = isDetail
    ? false
    : isTabletDown
      ? isAlwaysVisible || isMenuOpen
      : isAlwaysVisible || pageCounter === lastIndex
  const [isFooterLinksVisible, setIsFooterLinksVisible] = useState(shouldShowFooterLinks)

  useEffect(() => {
    if (isAlwaysVisible) return undefined

    const media = window.matchMedia('(max-width: 1024px)')
    const handleChange = (event) => setIsTabletDown(event.matches)
    setIsTabletDown(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [isAlwaysVisible])

  useEffect(() => {
    const iconEls = iconRefs.current.filter(Boolean)
    if (!iconEls.length) return undefined

    const previousSocialVisibility = previousSocialVisibilityRef.current
    const isInitialRender = previousSocialVisibility === null
    previousSocialVisibilityRef.current = shouldShowSocial

    socialAnimationRef.current?.kill()
    socialAnimationRef.current = null
    gsap.killTweensOf(iconEls)

    if (shouldShowSocial) {
      setIsSocialListVisible(true)
      gsap.set(iconEls, {
        visibility: 'visible',
        pointerEvents: 'auto',
        transformOrigin: '50% 50%',
      })

      if (isInitialRender) {
        gsap.set(iconEls, { opacity: 1, scale: 1 })
      } else {
        socialAnimationRef.current = gsap.fromTo(iconEls, {
          opacity: 0,
          scale: 0.82,
        }, {
          opacity: 1,
          scale: 1,
          duration: 0.34,
          ease: 'back.out(1.7)',
          stagger: 0.06,
          overwrite: 'auto',
        })
      }
    } else if (isInitialRender) {
      setIsSocialListVisible(false)
      gsap.set(iconEls, {
        opacity: 0,
        scale: 0.82,
        visibility: 'hidden',
        pointerEvents: 'none',
        transformOrigin: '50% 50%',
      })
    } else {
      gsap.set(iconEls, {
        visibility: 'visible',
        pointerEvents: 'none',
        transformOrigin: '50% 50%',
      })

      socialAnimationRef.current = gsap.to(iconEls.slice().reverse(), {
        opacity: 0,
        scale: 0.82,
        duration: 0.3,
        ease: 'power2.in',
        stagger: 0.08,
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(iconEls, {
            visibility: 'hidden',
            pointerEvents: 'none',
          })
          socialAnimationRef.current = null
          setIsSocialListVisible(false)
        },
      })
    }

    return () => {
      socialAnimationRef.current?.kill()
      socialAnimationRef.current = null
      gsap.killTweensOf(iconEls)
    }
  }, [shouldShowSocial])

  useEffect(() => {
    const linkEls = footerLinkRefs.current.filter(Boolean)
    if (!linkEls.length) return undefined

    const previousFooterLinksVisibility = previousFooterLinksVisibilityRef.current
    const isInitialRender = previousFooterLinksVisibility === null
    previousFooterLinksVisibilityRef.current = shouldShowFooterLinks

    footerLinksAnimationRef.current?.kill()
    footerLinksAnimationRef.current = null
    gsap.killTweensOf(linkEls)

    if (shouldShowFooterLinks) {
      setIsFooterLinksVisible(true)
      gsap.set(linkEls, {
        visibility: 'visible',
        pointerEvents: 'auto',
      })

      if (isInitialRender) {
        gsap.set(linkEls, { opacity: 1, y: 0 })
      } else {
        footerLinksAnimationRef.current = gsap.fromTo(linkEls, {
          opacity: 0,
          y: 8,
        }, {
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: 'power2.out',
          stagger: 0.04,
          overwrite: 'auto',
        })
      }
    } else if (isInitialRender) {
      setIsFooterLinksVisible(false)
      gsap.set(linkEls, {
        opacity: 0,
        y: 8,
        visibility: 'hidden',
        pointerEvents: 'none',
      })
    } else {
      gsap.set(linkEls, {
        visibility: 'visible',
        pointerEvents: 'none',
      })

      footerLinksAnimationRef.current = gsap.to(linkEls.slice().reverse(), {
        opacity: 0,
        y: 8,
        duration: 0.22,
        ease: 'power2.in',
        stagger: 0.03,
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(linkEls, {
            visibility: 'hidden',
            pointerEvents: 'none',
          })
          footerLinksAnimationRef.current = null
          setIsFooterLinksVisible(false)
        },
      })
    }

    return () => {
      footerLinksAnimationRef.current?.kill()
      footerLinksAnimationRef.current = null
      gsap.killTweensOf(linkEls)
    }
  }, [shouldShowFooterLinks])

  iconRefs.current.length = iconsList.length
  footerLinkRefs.current.length = footerLinks.length

  return (
    <footer
      className={[
        styles.footer,
        isInline ? styles.footerInline : '',
        isDetail ? styles.footerDetail : '',
        isTabletDown && (isSocialListVisible || isFooterLinksVisible) ? styles.footerMobileVisible : '',
      ].filter(Boolean).join(' ')}
    >
      <div
        className={[
          styles.footerContainer,
          isInline ? styles.footerContainerInline : '',
          isDetail ? styles.footerContainerDetail : '',
        ].filter(Boolean).join(' ')}
      >
        <div
          className={[
            styles.footerLinks,
            isFooterLinksVisible ? styles.footerLinksVisible : styles.footerLinksHidden,
          ].join(' ')}
        >
          {footerLinks.map(({ to, name, isLink = false }, index) => (
            <FooterLink
              key={name}
              ref={(node) => {
                footerLinkRefs.current[index] = node
              }}
              to={to}
              name={name}
              isLink={isLink}
            />
          ))}
        </div>
        <div
          className={[
            styles.socialList,
            isSocialListVisible ? styles.socialListVisible : styles.socialListHidden,
          ].join(' ')}
        >
          {iconsList.map(({ link, name, label }, index) => (
            <IconLink
              key={name}
              ref={(node) => {
                iconRefs.current[index] = node
              }}
              link={link}
              iconName={name}
              label={label}
              className={styles.footerIconLink}
            />
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
