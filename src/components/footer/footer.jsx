import { useEffect, useRef, useState, useMemo } from 'react'
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
  const containerRef = useRef(null)
  const socialListRef = useRef(null)
  const [isTabletDown, setIsTabletDown] = useState(false)
  const lastIndex = useMemo(() => Math.max(navLinks.length - 1, 0), [])
  const isInline = variant === 'inline'
  const isDetail = variant === 'detail'
  const isAlwaysVisible = isInline
  const shouldShowSocial = isTabletDown
    ? isAlwaysVisible || isMenuOpen || (isDetail && isDetailFooterVisible)
    : isAlwaysVisible || (isDetail && isDetailFooterVisible) || pageCounter === 0 || pageCounter === lastIndex

  useEffect(() => {
    if (isAlwaysVisible) return undefined

    const media = window.matchMedia('(max-width: 1024px)')
    const handleChange = (event) => setIsTabletDown(event.matches)
    setIsTabletDown(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [isAlwaysVisible])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (isAlwaysVisible) {
      gsap.set(el, { clearProps: 'all' })
      return
    }

    if (!isTabletDown) {
      gsap.set(el, { clearProps: 'all' })
      return
    }

    if (isMenuOpen) {
      gsap.set(el, { display: 'flex' })
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      )
    } else {
      gsap.to(el, {
        opacity: 0,
        y: 24,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => gsap.set(el, { display: 'none' }),
      })
    }
  }, [isAlwaysVisible, isMenuOpen, isTabletDown])

  useEffect(() => {
    const listEl = socialListRef.current
    if (!listEl) return
    const items = Array.from(listEl.children)
    if (!items.length) return

    gsap.killTweensOf(items)
    gsap.set(listEl, { pointerEvents: shouldShowSocial ? 'all' : 'none' })

    if (shouldShowSocial) {
      gsap.fromTo(
        items,
        { autoAlpha: 0, scale: 0.8 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.08 },
        }
      )
      return
    }

    gsap.to(items, {
      autoAlpha: 0,
      scale: 0.8,
      duration: 0.5,
      ease: 'power2.in',
      stagger: { each: 0.08, from: 'end' },
    })
  }, [shouldShowSocial])

  return (
    <footer
      className={[
        styles.footer,
        isInline ? styles.footerInline : '',
        isDetail ? styles.footerDetail : '',
      ].filter(Boolean).join(' ')}
      ref={containerRef}
    >
      <div
        className={[
          styles.footerContainer,
          isInline ? styles.footerContainerInline : '',
          isDetail ? styles.footerContainerDetail : '',
        ].filter(Boolean).join(' ')}
      >
        <div className={styles.socialList} ref={socialListRef}>
          {iconsList.map(({ link, name, label }) => (
            <IconLink key={name} link={link} iconName={name} label={label} />
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
