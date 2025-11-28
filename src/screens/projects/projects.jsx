import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import styles from './projects.module.css'

export default function Projects() {
  return (
    <ParticlesBackground id="projects" className={styles.section}>
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <h1>projects</h1>
        </div>
      </SectionWrapper>
    </ParticlesBackground>
  )
}
