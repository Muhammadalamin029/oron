import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitizes admin-authored HTML (Privacy/Terms/Returns copy, the contact
 * page's map embed) before it's passed to dangerouslySetInnerHTML. These
 * strings come from the public, unauthenticated GET /settings/:key endpoint,
 * so anything the admin panel lets an admin type into a settings field ends
 * up rendered, unescaped, in every visitor's browser — this is the boundary
 * that stops a compromised/phished admin session from becoming stored XSS
 * against the whole site.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return ""
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
      "a", "h2", "h3", "h4", "span", "iframe",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "class",
      "src", "width", "height", "frameborder", "allowfullscreen", "loading",
    ],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  })
}
