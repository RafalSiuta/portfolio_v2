import { getLocalizedValue } from './langProvider'

export function getHomeText(t) {
  return {
    subtitle: t('home.subtitle', 'design & code'),
    description: t(
      'home.description',
      "Hi I'm <strong>Rafa?</strong>, UI designer and frontend developer.<br /> Technologies are just tools that help us<br /> bring our beautiful <strong>ideas to life.</strong><br /> Check out my projects and let me know<br />how <strong>I can help?</strong>"
    ),
  }
}

export function getAboutText(t) {
  return {
    about: {
      title: t('about.title', 'about me'),
      description: t(
        'about.description',
        "<strong>UI designer</strong> and frontend developer<br/> with graphic design background <strong>based in ??d?,</strong><br/>central Poland."
      ),
    },
    service: {
      title: t('service.title', 'How can I help?'),
      services: t('service.services', []),
      edu: {
        title: t('service.edu.title', 'just call me rafi'),
        educations: t('service.edu.educations', []),
      },
    },
  }
}

export function getContactText(t) {
  return {
    title: t('contact.title', "let's talk"),
    form: {
      email: {
        placeholder: t('contact.form.0.email_placeholder', 'your email'),
        errorMessage: t('contact.form.0.email_error_message', 'Email is required'),
      },
      topic: {
        placeholder: t('contact.form.1.topic_placeholder', 'topic'),
        errorMessage: t('contact.form.1.topic_error_message', 'Topic is required'),
      },
      message: {
        placeholder: t('contact.form.2.message_placeholder', 'message'),
        errorMessage: t('contact.form.2.message_error_message', 'Message is required'),
      },
    },
    topicOptions: t('contact.topic_options', [
      'ui design',
      'brand design',
      'web dev',
      'mobile dev',
      'full service',
    ]),
    submitButton: t('contact.submit_button', 'just send it'),
    modalSuccess: {
      title: t('contact.modal_success.title', 'thank you'),
      subtitle: t('contact.modal_success.subtitle', 'email was send successfully'),
      message: t(
        'contact.modal_success.message',
        'Thank you for visiting and your time, I am very pleased, I will reply to your message as soon as possible :)'
      ),
      buttonText: t('contact.modal_success.buttonText', 'ok cool'),
    },
    modalError: {
      title: t('contact.modal_error.title', 'opsss'),
      subtitle: t('contact.modal_error.subtitle', 'some think went wrong'),
      message: t(
        'contact.modal_error.message',
        'possibly there is some error. check your form data and try again.'
      ),
      buttonText: t('contact.modal_error.buttonText', 'lets try again'),
    },
  }
}

export function getNavText(t) {
  return {
    menuOptions: t('nav.menu_options', ['home', 'projects', 'about', 'contact']),
    detailBack: t('nav.detail_back', 'go back'),
    detailCurrent: t('nav.detail_current', 'details'),
    r85Current: t('nav.r85_current', 'r85'),
  }
}

export function getProjectsText(t) {
  return {
    title: t('projects.title', 'my work'),
    toolsTitle: t('projects.tools_title', 'project tools...'),
    caseStudyButton: t('projects.case_study_button', 'case study'),
    pageCounter: t('projects.page_counter', 'project'),
  }
}

export function getDetailsText(t) {
  return {
    screen: t('details.screen', 'screen'),
    aboutProject: t('details.about_project', 'about'),
    role: t('details.role', 'my role'),
    screenshots: t('details.screenshots', 'screens & graphics'),
    tools: t('details.tools', 'project tools'),
    challanges: t('details.challanges', 'challanges'),
    projectsList: t('details.projects_list', 'other projects'),
    ctaButton: t('details.cta_button', "what's your idea?"),
    errorMessage: t('details.error_message', 'Project not found'),
  }
}

export function localizeProject(project, locale) {
  if (!project || typeof project !== 'object') return project

  return {
    ...project,
    title: getLocalizedValue(project.title, locale, ''),
    subtitle: getLocalizedValue(project.subtitle, locale, ''),
    description: getLocalizedValue(project.description, locale, ''),
    web_links: Array.isArray(project.web_links)
      ? project.web_links.map((item) => ({
          ...item,
          link_title: getLocalizedValue(item.link_title, locale, ''),
        }))
      : [],
    role: Array.isArray(project.role)
      ? project.role.map((item) => getLocalizedValue(item, locale, '')).filter(Boolean)
      : [],
    graphics: Array.isArray(project.graphics)
      ? project.graphics.map((item) => ({
          ...item,
          title: getLocalizedValue(item.title, locale, ''),
        }))
      : [],
    challanges: getLocalizedValue(project.challanges, locale, ''),
    solutions: Array.isArray(project.solutions)
      ? project.solutions.map((item) => getLocalizedValue(item, locale, '')).filter(Boolean)
      : [],
  }
}

export function localizeProjectsData(projects, locale) {
  if (!Array.isArray(projects)) return []
  return projects.map((project) => localizeProject(project, locale))
}
