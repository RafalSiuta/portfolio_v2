import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import styles from './contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <h1>contact</h1>
        </div>
      </SectionWrapper>
    </section>
  )
}
