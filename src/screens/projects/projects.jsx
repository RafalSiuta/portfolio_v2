import { useEffect, useMemo, useRef, useState } from 'react'
import SectionWrapper from '../../components/containers/wrapper/sectionWrapper'
import ChipButton from '../../components/buttons/chip_button/chipButton'
import TextLinkButton from '../../components/buttons/textlink_button/textLinkButton'
import IconButton from '../../components/buttons/icon_button/icon_button'
import SmallCard from '../../components/cards/small_card/smallCard'
import { useProjectsContext } from '../../utils/providers/projectsProvider'
import { useNavContext } from '../../utils/providers/navProvider'
import { usePageTransitionContext } from '../../utils/providers/pageTransitionProvider'
import { getProjectLeadScreen, resolveProjectImage } from '../../utils/projects/projectImages'
import styles from './projects.module.css'

export default function Projects() {
  const { projectsList, heroImages } = useProjectsContext()
  const { rememberLastSection } = useNavContext()
  const { navigateToDetail } = usePageTransitionContext()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const currentProject = projectsList[currentIndex] ?? {}
  const swipeAreaRef = useRef(null)
  const touchStartRef = useRef({ x: 0, y: 0 })

  const heroImage = useMemo(() => {
    return resolveProjectImage(
      getProjectLeadScreen(currentProject),
      heroImages,
      isMobileViewport
    )
  }, [currentProject, heroImages, isMobileViewport])

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 500)
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    const logProjects = () => {
      projectsList.map(({ title, subtitle, description, screens_list, tools }) => {
        // console.log('title:', title)
        // console.log('subtitle:', subtitle)
        // console.log('description:', description)
        // console.log('screens_list:', screens_list)
        // console.log('tools:', tools)
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

  const isProjectActive = (projectId) =>
    !!projectId && projectId === currentProject?.id

  const handleCardClick = (index) => {
    setCurrentIndex(index)
  }

  const handleCaseStudyClick = (event) => {
    event.preventDefault()
    if (!currentProject?.id) return
    rememberLastSection('projects')
    navigateToDetail(`/projects/${currentProject.id}`, { fromSectionId: 'projects' })
  }

  useEffect(() => {
    if (!isMobileViewport || !swipeAreaRef.current) return
    const touchThreshold = 50

    const handleTouchStart = (event) => {
      const touch = event.changedTouches?.[0]
      if (!touch) return
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (event) => {
      const touch = event.changedTouches?.[0]
      if (!touch) return
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      if (Math.abs(deltaX) < touchThreshold || Math.abs(deltaX) < Math.abs(deltaY)) return

      setCurrentIndex((prevIndex) => {
        if (deltaX < 0) {
          return prevIndex === projectsList.length - 1 ? 0 : prevIndex + 1
        }
        return prevIndex === 0 ? projectsList.length - 1 : prevIndex - 1
      })
    }

    const node = swipeAreaRef.current
    node.addEventListener('touchstart', handleTouchStart, { passive: true })
    node.addEventListener('touchend', handleTouchEnd)

    return () => {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobileViewport, projectsList.length])

  return (
    <section id="projects" className={styles.section}>
      <SectionWrapper className={styles.wrapper}>
        <h1 className='strokeText'>my work</h1>
        <div className={styles.content} ref={swipeAreaRef}>
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
                to={currentProject?.id ? `/projects/${currentProject.id}` : '/'}
                iconName="ArrowThinRight"
                className="description"
                onClick={handleCaseStudyClick}
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
            {projectsList.map(({ title, id }, index) => (
              <SmallCard
                key={id ?? index}
                label={title}
                isActive={isProjectActive(id)}
                onClick={() => handleCardClick(index)}
              />
            ))}
          </div>
        </div>
      </SectionWrapper>
    </section>
  )
}
