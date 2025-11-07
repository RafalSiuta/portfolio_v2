import ContentWrapper from '../../components/wrapper/content_wrapper'
import styles from './contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <ContentWrapper>
        <div className={styles.content}>
          <h1>contact</h1>
        </div>
      </ContentWrapper>
    </section>
  )
}

