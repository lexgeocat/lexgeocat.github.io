import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export default function jsonldPlugin() {
  return {
    name: 'lexgeocat:jsonld',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        const root = join(dirname(fileURLToPath(import.meta.url)), '..')
        const organization = JSON.parse(
          readFileSync(join(root, 'scripts/jsonld/organization.json'), 'utf8'),
        )
        const website = JSON.parse(
          readFileSync(join(root, 'scripts/jsonld/website.json'), 'utf8'),
        )
        const tags = [
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            children: JSON.stringify(organization),
            injectTo: 'head',
          },
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            children: JSON.stringify(website),
            injectTo: 'head',
          },
        ]
        return tags
      },
    },
  }
}
