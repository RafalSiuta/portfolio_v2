import { createContext, useContext, useMemo } from 'react'
import projectsData from '../../assets/data/projects_data.json'

const ProjectsContext = createContext(null)

const projectsList = projectsData
const heroImages = import.meta.glob('../../assets/data/image_data/**/*', {
  eager: true,
  import: 'default',
})

export function ProjectsProvider({ children }) {
  const value = useMemo(() => ({ projectsList, heroImages }), [])
  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjectsContext() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider')
  }
  return context
}
