import { useEffect, useMemo, useState } from 'react'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import projectsData from '../../assets/data/projects_data.json'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import TextLinkButton from '../../components/buttons/textlink_button/textLinkButton'
import IconButton from '../../components/buttons/icon_button/icon_button'
import SmallCard from '../../components/cards/small_card/smallCard'
import SectionTitle from '../../components/headers/section_title/secctionTitle'
import styles from './projects.module.css'

const projectsList = projectsData
const heroImages = import.meta.glob('../../assets/data/image_data/*', {
  eager: true,
  import: 'default'
})

export default function Projects() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const currentProject = projectsList[currentIndex] ?? {}

  const heroImage = useMemo(() => {
    if (!currentProject.hero_img) return ''
    const heroKey =
      typeof currentProject.hero_img === 'string'
        ? currentProject.hero_img
        : isMobileViewport
          ? currentProject.hero_img.mobile ?? currentProject.hero_img.desktop
          : currentProject.hero_img.desktop ?? currentProject.hero_img.mobile
    if (!heroKey) return ''
    const key = `../../${heroKey}`
    return heroImages[key] ?? ''
  }, [currentProject.hero_img, isMobileViewport])

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 500)
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    const logProjects = () => {
      projectsList.map(({ title, subtitle, description, hero_img, tools }) => {
        console.log('title:', title)
        console.log('subtitle:', subtitle)
        console.log('description:', description)
        console.log('hero_img:', hero_img)
        console.log('tools:', tools)
        return null
      })
    }

    logProjects()
  }, [])

  const prevProject = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === projectsList.length - 1 ? 0 : prevIndex + 1
    )
  }

  const nextProject = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projectsList.length - 1 : prevIndex - 1
    )
  }

  return (
    <ParticlesBackground id="projects" className={styles.section}>
      <SectionWrapper className={styles.wrapper}>
        <SectionTitle />
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <div className={styles.imageFrame} aria-hidden="true">
              <img src={heroImage} alt={currentProject.title ?? ''} />
            </div>
          </div>
          <div className={styles.textContainer}>
            <h2>{currentProject.title}</h2>
            <h4>{currentProject.subtitle}</h4>
            <p className={`description ${styles.descriptionClamp}`}>
              {currentProject.description}
            </p>
            <div className={styles.divider} aria-hidden="true" />
            <p className="description">project tools...</p>
            <div className={styles.chipRow}>
              {currentProject.tools?.map(({ tool_name }) => (
                <ChipButton key={tool_name} text={tool_name} onClick={() => {}} />
              ))}
            </div>
            <div className={styles.linkRow}>
              <TextLinkButton
                name="case study"
                to="/projects"
                iconName="ArrowRight"
                className="description"
              />
            </div>
          </div>
        </div>
        <div className={styles.projectCardsContainer}>
          <div className={styles.navButtonsContainer}>
            <IconButton
              iconName="ArrowThinLeft"
              onClick={nextProject}
              className={styles.navButtonLeft}
              iconClassName={styles.navIconLeft}
              style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
            />
            <IconButton
              iconName="ArrowThinRight"
              onClick={prevProject}
              className={styles.navButtonRight}
              iconClassName={styles.navIconRight}
              style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
            />
          </div>
          <div className={styles.cardsContainer}>
            {projectsList.map(({ title }, index) => (
              <SmallCard key={title ?? index} label={title} />
            ))}
          </div>
        </div>
      </SectionWrapper>
    </ParticlesBackground>
  )
}
