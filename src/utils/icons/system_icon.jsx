import * as Icons from './icons_list.js'

const SystemIcon = ({ name, className = '', ...rest }) => {
  const IconComponent = Icons[name]

  if (!IconComponent) {
    console.warn(`Ikona "${name}" nie zostala znaleziona.`)
    return null
  }

  return <IconComponent className={className} {...rest} />
}

export default SystemIcon
