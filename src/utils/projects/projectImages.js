import { resolveProjectAssetUrl } from './projectAssets'

export function getProjectLeadScreen(project) {
  return project?.screens_list?.[0] ?? null
}

export function resolveProjectImage(imageSource, heroImages, isMobileViewport = false) {
  if (!imageSource) return ''

  const imageKey =
    typeof imageSource === 'string'
      ? imageSource
      : isMobileViewport
        ? imageSource.mobile ?? imageSource.desktop
        : imageSource.desktop ?? imageSource.mobile

  if (!imageKey) return ''

  return resolveProjectAssetUrl(imageKey, heroImages)
}
