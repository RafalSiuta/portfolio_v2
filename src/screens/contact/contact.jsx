import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SectionTitle from '../../components/headers/section_title/secctionTitle'
import styles from './contact.module.css'

export default function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
           <h1 className='strokeText'>let's talk...</h1>
        </div>
      </SectionWrapper>
    </section>
  )
}
