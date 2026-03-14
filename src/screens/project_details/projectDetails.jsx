import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ParticlesBackground from '../../components/containers/particles/particlesBackground'
import HeroWrapper from '../../components/containers/herowrapper/heroWrapper'
import IconButton from '../../components/buttons/icon_button/icon_button'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import styles from './projectDetails.module.css'

export default function ProjectDetails() {
  const { projectId } = useParams()
  const { projectsList } = useProjectsContext()
  const { lastSectionId } = useNavContext()
  const { returnToSection } = usePageTransitionContext()

  const project = useMemo(
    () => projectsList.find((item) => item.id === projectId) ?? null,
    [projectsList, projectId]
  )

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
        <div className={styles.content}>
          <h1>{project?.title ?? 'Project not found'}</h1>
          {project?.subtitle ? <h2>{project.subtitle}</h2> : null}
          {project?.description ? <p>{project.description}</p> : null}
        </div>
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
