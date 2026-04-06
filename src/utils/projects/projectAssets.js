const projectAssetUrls = import.meta.glob('../../assets/data/image_data/**/*', {
  eager: true,
  import: 'default',
  query: '?url',
})

const projectSvgComponents = import.meta.glob('../../assets/data/image_data/**/*.svg', {
  eager: true,
  import: 'default',
})

function normalizeAssetPath(assetPath) {
  if (typeof assetPath !== 'string') return ''

  return assetPath
    .trim()
    .replace(/^\.?\//, '')
    .replace(/^src\//, '')
}

function getAssetCandidates(assetPath) {
  const normalizedPath = normalizeAssetPath(assetPath)
  if (!normalizedPath) return []

  return [
    `../../${normalizedPath}`,
    `../../src/${normalizedPath}`,
  ]
}

export function resolveProjectAssetUrl(assetPath, assetsMap = projectAssetUrls) {
  const candidates = getAssetCandidates(assetPath)
  if (!candidates.length) return ''

  for (const candidate of candidates) {
    if (assetsMap[candidate]) return assetsMap[candidate]
  }

  return ''
}

export function resolveProjectSvgComponent(assetPath, svgMap = projectSvgComponents) {
  const candidates = getAssetCandidates(assetPath)
  if (!candidates.length) return null

  for (const candidate of candidates) {
    if (svgMap[candidate]) return svgMap[candidate]
  }

  return null
}

export { projectAssetUrls, projectSvgComponents }
