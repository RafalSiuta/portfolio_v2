import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import IconButton from '../../components/buttons/icon_button/icon_button'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import { getProjectLeadScreen, resolveProjectImage } from '../../utils/projects/projectImages'
import styles from './projectDetails.module.css'

export default function ProjectDetails() {
  const { projectId } = useParams()
  const { projectsList, heroImages } = useProjectsContext()
  const { lastSectionId } = useNavContext()
  const { returnToSection } = usePageTransitionContext()
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  const project = useMemo(
    () => projectsList.find((item) => item.id === projectId) ?? null,
    [projectsList, projectId]
  )

  const heroImage = useMemo(() => {
    return resolveProjectImage(
      getProjectLeadScreen(project),
      heroImages,
      isMobileViewport
    )
  }, [heroImages, isMobileViewport, project])

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 500)
    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const handleReturn = useCallback(() => {
    returnToSection(lastSectionId)
  }, [lastSectionId, returnToSection])

  return (
    <div className={styles.pageRoot}>
      <ParticlesBackground
        className="particles-overlay"
        style={{
          '--particles-align': 'stretch',
          '--particles-justify': 'flex-start',
        }}
      />
      <HeroWrapper className={styles.heroWrapper}>
        <SectionWrapper className={styles.wrapper}>
          <h1 className='strokeText'>{project?.title ?? 'Project not found'}</h1>
          <div className={styles.content}>
            <div className={styles.imageContainer}>
              <div className={styles.imageFrame} aria-hidden="true">
                <img src={heroImage} alt={project?.title ?? ''} />
              </div>
            </div>
          </div>
          <div className={styles.text_content}>
          
          {project?.subtitle ? <h2>{project.subtitle}</h2> : null}
          {project?.description ? <p>{project.description}</p> : null}
        </div>
        </SectionWrapper>

        <IconButton
          iconName="ArrowThinLeft"
          onClick={handleReturn}
          ariaLabel="Back to main page"
          hover="0deg"
          className={styles.backButton}
          iconClassName={styles.backIcon}
          style={{ '--icon-hover-shift': 'calc(var(--icon-button-width) * 0.18)' }}
        />
      </HeroWrapper>
    </div>
  )
}
