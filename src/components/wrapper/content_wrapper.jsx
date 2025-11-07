import styles from './wrapper.module.css'

export default function ContentWrapper({ children, style, className = '' }) {
  const classes = [styles.wrapper, className].filter(Boolean).join(' ')
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}
