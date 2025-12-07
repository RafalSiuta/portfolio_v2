import styles from './chipButton.module.css'

export default function ChipButton({ onClick, text }) {
  return (
    <button type="button" className={styles.chipButton} onClick={onClick}>
      <span className={styles.label}>{text}</span>
    </button>
  )
}
