// Convert string with simple inline HTML into a shape usable by dangerouslySetInnerHTML.
export const toHtml = (value = '') => {
  const text = String(value ?? '')
  const normalized = text.replace(/<strong\s*\/>/gi, '</strong>')
  return { __html: normalized }
}
