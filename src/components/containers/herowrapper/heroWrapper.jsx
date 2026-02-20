import styles from './heroWrapper.module.css'

export default function HeroWrapper({ className, images, isLastSection, children, style, ...props }) {
  const combinedClassName = [styles.heroWrapper, className].filter(Boolean).join(' ')
  const backgroundStyle = images
    ? {
        '--hero-bg-desktop': `url(${images.desktop ?? ''})`,
        '--hero-bg-tablet': `url(${images.tablet ?? images.desktop ?? ''})`,
        '--hero-bg-mobile': `url(${images.mobile ?? images.tablet ?? images.desktop ?? ''})`,
      }
    : {}

  return (
    <section {...props} className={combinedClassName}>
      <div
        className={styles.heroSurface}
        style={{ ...backgroundStyle, ...style }}
      >
        {children}
      </div>
    </section>
  )
}
