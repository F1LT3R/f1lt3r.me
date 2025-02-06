import path from 'path'

import writeHtml from './write-html.mjs'

export default (doc, dist) =>
    new Promise((resolve, reject) => {
        const {
            attributes: { permalink },
            outerHTML,
        } = doc

        const distDir = path.relative('.', dist)
        const distDocPermalink = path.resolve(distDir, permalink)
        const distDocIndex = path.join(distDocPermalink, 'index.html')

        console.log({ distDocPermalink })

        return writeHtml(outerHTML, distDocPermalink, distDocIndex)
            .then(resolve({ doc, distDocPermalink }))
            .catch(reject)
    })
