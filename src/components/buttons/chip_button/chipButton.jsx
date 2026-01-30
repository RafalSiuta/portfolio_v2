import styles from './chipButton.module.css'

export default function ChipButton({ onClick, text }) {
  const displayText =
    typeof text === 'string'
      ? text.length > 30
        ? `${text.slice(0, 30)}..`
        : text
      : String(text ?? '')

  return (
    <button type="button" className={styles.chipButton} onClick={onClick}>
      <span className={styles.label}>{displayText}</span>
    </button>
  )
}
