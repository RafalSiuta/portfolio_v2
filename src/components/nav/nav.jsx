import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './nav.module.css'
import TextButton from '../buttons/textbutton/textbutton'
import { useNavContext } from '../../utils/providers/navProvider'

const links = [
  { href: '#home', label: 'home' },
  { href: '#projects', label: 'projects' },
  { href: '#about', label: 'about' },
  { href: '#contact', label: 'contact' },
]

function Nav() {
  const menuRef = useRef(null)
  const indicatorRef = useRef(null)
  const linkRefs = useRef({})
  const [activeHash, setActiveHash] = useState(links[0].href)
  const { setPageCounter, setScrollProgress } = useNavContext()

  const setCounterFromHash = useCallback((hash) => {
    const index = links.findIndex((link) => link.href === hash)
    if (index !== -1) {
      setPageCounter(index)
    }
  }, [setPageCounter])

  useEffect(() => {
    const menuEl = menuRef.current
    const indicatorEl = indicatorRef.current
    const activeEl = linkRefs.current[activeHash]
    if (!menuEl || !indicatorEl || !activeEl) return

    const moveIndicator = () => {
      const linkRect = activeEl.getBoundingClientRect()
      const menuRect = menuEl.getBoundingClientRect()
      const x = linkRect.left - menuRect.left
      const width = linkRect.width
      gsap.to(indicatorEl, { x, width, duration: 0.3, ease: 'power3.out' })
    }

    moveIndicator()
    setCounterFromHash(activeHash)
    window.addEventListener('resize', moveIndicator)

    return () => {
      window.removeEventListener('resize', moveIndicator)
    }
  }, [activeHash, setCounterFromHash])

  useEffect(() => {
    const sectionIds = links.map(({ href }) => href.replace('#', ''))
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (!sections.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!visibleEntry) return
        const nextHash = `#${visibleEntry.target.id}`
        setActiveHash((prev) => {
          if (prev === nextHash) return prev
          setCounterFromHash(nextHash)
          return nextHash
        })
      },
      { threshold: 0.45 }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [setCounterFromHash])

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement
      const scrollHeight = doc.scrollHeight - doc.clientHeight
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      setScrollProgress(progress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [setScrollProgress])

  return (
    <header className={styles.container}>
      <nav className={styles.navigation} aria-label="Primary">
        <img src="/text_logo.svg" className={styles.logo} alt="Portfolio logo" />
        <div className={styles.menuList}>
          <ul className={styles.menu} ref={menuRef}>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  className={styles.link}
                  href={link.href}
                  aria-current={activeHash === link.href ? 'page' : undefined}
                  onClick={() => {
                    setActiveHash(link.href)
                    setCounterFromHash(link.href)
                  }}
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
    </header>
  )
}

export default Nav
