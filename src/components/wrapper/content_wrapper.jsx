import styles from './wrapper.module.css'

export default function ContentWrapper({ children, className = '', style: inlineStyle }) {
  const classes = [styles.wrapper, className].filter(Boolean).join(' ')
  return (
    <div className={classes} style={inlineStyle}>
      {children}
    </div>
  )
}
