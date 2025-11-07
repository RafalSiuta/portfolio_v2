import styles from './home.module.css'
import ContentWrapper from '../../components/wrapper/content_wrapper'

function Home() {
  return (
    
      <section
        className={styles.heroContent}
        id="home"
        
      >
        <ContentWrapper style={{ alignItems: 'flex-start', textAlign: 'left' }}>
        <h1>ui ux designer</h1>
        <h2>design & code</h2>
        <p>
          Hi I’m <strong>Rafał</strong>, UI designer and frontend developer.<br/> Technologies are just
          a tools that help us<br/> bring our beautiful <strong>ideas</strong> to life.<br/> Check out my
          projects and let me know how <strong>I can help</strong>.
        </p>
        </ContentWrapper>
      </section>
    
  )
}

export default Home

