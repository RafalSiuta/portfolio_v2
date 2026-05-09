import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './footerLink.module.css'

const FooterLink = forwardRef(function FooterLink({
  name,
  to,
  isLink = false,
  className = '',
  ...rest
}, ref) {
  const combinedClassName = [styles.footerLink, className].filter(Boolean).join(' ')

  if (isLink) {
    return (
      <Link ref={ref} to={to} className={combinedClassName} {...rest}>
        {name}
      </Link>
    )
  }

  return (
    <a
      ref={ref}
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className={combinedClassName}
      {...rest}
    >
      {name}
    </a>
  )
})

export default FooterLink
