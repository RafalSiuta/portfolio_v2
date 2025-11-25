import ContentWrapper from '../../components/wrapper/content_wrapper'
import styles from './about.module.css'

export default function About() {
  return (
    <section id="about" className={styles.section}>
      <ContentWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <h1>about</h1>
        </div>
      </ContentWrapper>
    </section>
  )
}
