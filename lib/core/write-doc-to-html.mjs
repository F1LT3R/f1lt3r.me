import path from 'path'

import writeHtml from './write-html.mjs'

export default (doc, dist) =>
    new Promise((resolve, reject) => {
        const {
            attributes: { permalink },
            outerHTML,
        } = doc

        const distDir = path.relative('.', dist)
        const distPagePermalink = path.resolve(distDir, permalink)
        const distPageIndex = path.join(distPagePermalink, 'index.html')

        doc.distDir = distPagePermalink

        writeHtml(outerHTML, distPagePermalink, distPageIndex)
            .then(() => resolve(doc))
            .catch(reject)
    })
