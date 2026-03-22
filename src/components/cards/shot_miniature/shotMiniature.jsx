import styles from './shotMiniature.module.css'

function ShotMiniature({
  src = '',
  alt = '',
  isActive = false,
  onClick,
}) {
  const className = `${styles.container} ${isActive ? styles.active : ''}`.trim()

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className={styles.imageFrame} aria-hidden="true">
        <img src={src} alt={alt} />
      </div>
    </button>
  )
}

export default ShotMiniature
