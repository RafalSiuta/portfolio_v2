import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './nav.module.css'
import TextButton from '../buttons/textbutton/textbutton'

const links = [
  { href: '#home', label: 'home', isCurrent: true },
  { href: '#projects', label: 'projects' },
  { href: '#about', label: 'about' },
  { href: '#contact', label: 'contact' },
]

function Nav() {
  const menuRef = useRef(null)
  const indicatorRef = useRef(null)

  useEffect(() => {
    const menuEl = menuRef.current
    const indicatorEl = indicatorRef.current
    if (!menuEl || !indicatorEl) return

    const links = Array.from(menuEl.querySelectorAll('a'))
    let currentEl = menuEl.querySelector("a[aria-current='page']") || links[0]

    const moveTo = (el) => {
      if (!el) return
      const linkRect = el.getBoundingClientRect()
      const menuRect = menuEl.getBoundingClientRect()
      const x = linkRect.left - menuRect.left
      const width = linkRect.width
      gsap.to(indicatorEl, { x, width, duration: 0.3, ease: 'power3.out' })
    }

    moveTo(currentEl)

    const onEnter = (e) => moveTo(e.currentTarget)
    const onLeave = () => moveTo(currentEl)
    const onClick = (e) => {
      const el = e.currentTarget
      links.forEach((a) => a.removeAttribute('aria-current'))
      el.setAttribute('aria-current', 'page')
      currentEl = el
      moveTo(currentEl)
    }

    links.forEach((a) => {
      a.addEventListener('mouseenter', onEnter)
      a.addEventListener('focus', onEnter)
      a.addEventListener('click', onClick)
    })
    menuEl.addEventListener('mouseleave', onLeave)

    const onResize = () => moveTo(currentEl)
    window.addEventListener('resize', onResize)

    return () => {
      links.forEach((a) => {
        a.removeEventListener('mouseenter', onEnter)
        a.removeEventListener('focus', onEnter)
        a.removeEventListener('click', onClick)
      })
      menuEl.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

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
                  aria-current={link.isCurrent ? 'page' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <span className={styles.indicator} ref={indicatorRef} aria-hidden="true" />
          </ul>
          <TextButton>pl</TextButton>
        </div>
      </nav>
    </header>
  )
}

export default Nav
