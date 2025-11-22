import ContentWrapper from '../../components/wrapper/content_wrapper'
import styles from './projects.module.css'

export default function Projects() {
  return (
    <section id="projects" className={styles.section}>
      <ContentWrapper style={{ alignItems: 'flex-center', textAlign: 'center' }}>
        <div className={styles.content}>
          <h1>projects</h1>
        </div>
      </ContentWrapper>
    </section>
  )
}

