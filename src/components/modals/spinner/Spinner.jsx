import styles from './spinner.module.css'

export default function Spinner({ className }) {
  const classes = [styles.spinner, className].filter(Boolean).join(' ')
  return (
    <div className={classes} aria-label="Loading" role="status">
      <div className={styles.spinnerRing} />
    </div>
  )
}
