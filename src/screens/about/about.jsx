import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import SectionTitle from '../../components/headers/section_title/secctionTitle'
import styles from './about.module.css'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import ArtCanvas from '../../components/containers/art_canvas/art_canvas'
import { gsap } from 'gsap'
import IconLink from '../../components/buttons/icon_link/icon_link'

const iconsList = [
  { link: '', name: 'LDZ', label: 'Łódź' },
  { link: '#', name: 'Play', label: 'Odtworz' },
  { link: 'https://github.com/RafalSiuta', name: 'Github', label: 'GitHub' },
  { link: 'https://linkedin.com/in/rafal-siuta-3023ba323', name: 'Linkedin', label: 'LinkedIn' },
]

export default function About() {
  return (
    <ParticlesBackground id="about" >
      <SectionWrapper className={styles.wrapper}>
        <div className={styles.content}>
          <article className={styles.welcome_text}>
            <h1 className='strokeText'>about me</h1>
            <p><strong>UI designer</strong> and frontend developer<br/> with graphic design background <strong>based in Łódź,</strong> central Poland.</p>
            <div className={styles.socialList}>
              {iconsList.map(({ link, name, label }) => (
                <IconLink key={name} link={link} iconName={name} label={label} />
              ))}
            </div>
          </article>
          <div className={styles.art_canvas}>
            <ArtCanvas />
          </div>
        </div>
      </SectionWrapper>
    </ParticlesBackground>
  )
}
