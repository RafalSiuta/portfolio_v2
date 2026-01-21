import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SectionTitle from '../../components/headers/section_title/secctionTitle'
import styles from './about.module.css'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import ArtCanvas from '../../components/containers/art_canvas/art_canvas'

export default function About() {
  return (
    <ParticlesBackground id="about" >
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <article className={styles.welcome_text}>
            <h1 className='strokeText'>about me</h1>
            <p><strong>UI designer</strong> and frontend developer<br/> with graphic design background <strong>based in Łódź,</strong><br/> central Poland.</p>
          </article>
          <div className={styles.art_canvas}>
            <ArtCanvas />
          </div>
        </div>
      </SectionWrapper>
    </ParticlesBackground>
  )
}
