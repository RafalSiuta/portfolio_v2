import { useEffect, useState, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import IconLink from '../buttons/icon_link/icon_link'
import styles from './footer.module.css'
import { useNavContext } from '../../utils/providers/navProvider'
import navLinks from '../../utils/constants/navLinks'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'

const iconsList = [
  { link: '#', name: 'Play', label: 'Odtworz' },
  
  // { link: '#', name: 'Youtube', label: 'YouTube' },
  { link: 'https://github.com/RafalSiuta', name: 'Github', label: 'GitHub' },
  
  { link: 'https://linkedin.com/in/rafal-siuta-3023ba323', name: 'Linkedin', label: 'LinkedIn' },
  
]

function Footer({ variant = 'floating' }) {
  const { isMenuOpen, pageCounter } = useNavContext()
  const { isDetailFooterVisible } = usePageTransitionContext()
  const [isTabletDown, setIsTabletDown] = useState(false)
  const iconRefs = useRef([])
  const socialAnimationRef = useRef(null)
  const previousSocialVisibilityRef = useRef(null)
  const lastIndex = useMemo(() => Math.max(navLinks.length - 1, 0), [])
  const isInline = variant === 'inline'
  const isDetail = variant === 'detail'
  const isAlwaysVisible = isInline
  const shouldShowSocial = isTabletDown
    ? isAlwaysVisible || isMenuOpen || (isDetail && isDetailFooterVisible)
    : isAlwaysVisible || (isDetail && isDetailFooterVisible) || pageCounter === 0 || pageCounter === lastIndex
  const [isSocialListVisible, setIsSocialListVisible] = useState(shouldShowSocial)

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

  iconRefs.current.length = iconsList.length

  return (
    <footer
      className={[
        styles.footer,
        isInline ? styles.footerInline : '',
        isDetail ? styles.footerDetail : '',
        isTabletDown && isSocialListVisible ? styles.footerMobileVisible : '',
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
