import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import IconLink from '../buttons/icon_link/icon_link'
import styles from './footer.module.css'
import { useNavContext } from '../../utils/providers/navProvider'

const iconsList = [
  { link: '#', name: 'Play', label: 'Odtworz' },
  // { link: '#', name: 'Youtube', label: 'YouTube' },
  { link: 'https://github.com/RafalSiuta', name: 'Github', label: 'GitHub' },
  { link: '#', name: 'Linkedin', label: 'LinkedIn' },
]

function Footer() {
  const { isMenuOpen } = useNavContext()
  const containerRef = useRef(null)
  const [isTabletDown, setIsTabletDown] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)')
    const handleChange = (event) => setIsTabletDown(event.matches)
    setIsTabletDown(media.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

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
  }, [isMenuOpen, isTabletDown])

  return (
    <footer className={styles.footer} ref={containerRef}>
      <div className={styles.footerContainer}>
        <div className={styles.socialList}>
          {iconsList.map(({ link, name, label }) => (
            <IconLink key={name} link={link} iconName={name} label={label} />
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
