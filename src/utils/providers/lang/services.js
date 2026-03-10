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
  }
}
