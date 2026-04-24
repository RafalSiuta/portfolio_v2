// Convert string with simple inline HTML into a shape usable by dangerouslySetInnerHTML.
export const toHtml = (value = '') => {
  const text = String(value ?? '')
  const shouldRemoveBreaks =
    typeof window !== 'undefined' && window.innerWidth < 500

  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br />')
    .replace(/<br\s*\/?>/gi, shouldRemoveBreaks ? ' ' : '<br />')
    .replace(/<strong\s*\/>/gi, '</strong>')
    .replace(/<\s*\/\s*strong\s*>/gi, '</strong>')
  return { __html: normalized }
}
