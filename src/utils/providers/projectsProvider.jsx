import { createContext, useContext, useMemo } from 'react'
import projectsData from '../../assets/data/projects_data.json'
import { useI18n } from './lang/langProvider'
import { localizeProjectsData } from './lang/services'

const ProjectsContext = createContext(null)

const heroImages = import.meta.glob('../../assets/data/image_data/**/*', {
  eager: true,
  import: 'default',
})

export function ProjectsProvider({ children }) {
  const { locale } = useI18n()
  const projectsList = useMemo(() => localizeProjectsData(projectsData, locale), [locale])
  const value = useMemo(() => ({ projectsList, heroImages }), [projectsList])
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjectsContext() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider')
  }
  return context
}
