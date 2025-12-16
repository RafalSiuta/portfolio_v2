import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SectionTitle from '../../components/headers/section_title/secctionTitle'
import styles from './about.module.css'

export default function About() {
  return (
    <section id="about" className={styles.section}>
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <h1 className='strokeText'>about</h1>
        </div>
      </SectionWrapper>
    </section>
  )
}
