import settings from '../site-settings.json' with { type: 'json' }
import copyFiles from './core/copy-files.mjs'
import loadTemplates from './core/load-templates.mjs'
import getMarkdownDocs from './core/get-markdown-docs.mjs'
import markdown from './markdown.mjs'
import embedDocInHTMLTemplate from './core/embed-doc-in-html-template.mjs'
import writeDocToHtml from './core/write-doc-to-html.mjs'
import copyDocFilesToDist from './core/copy-doc-files-to-dist.mjs'

const ENV = process.env.NODE_ENV

const kind = 'post'

export default (updateSingleDoc) =>
    new Promise((resolve, reject) => {
        const { build } = settings
        const buildKind = build[`${kind}s_dir`]
        const { src, dist } = buildKind

        console.log({ src, dist })

        copyFiles(build)
            .then(() => loadTemplates(build))
            .then(({ templates }) => {
                getMarkdownDocs(src, kind, updateSingleDoc).then((results) => {
                    for (const docDate in results.docs) {
                        const doc = results.docs[docDate]
                        const { body, file } = doc

                        markdown(body).then((html) => {
                            // Attach parsed markdown as html to page object
                            doc.html = html
                            embedDocInHTMLTemplate(doc, templates, kind, settings)
                                .then((doc) =>
                                    writeDocToHtml(doc, dist)
                                        .then(({ doc, distDocPermalink }) =>
                                            copyDocFilesToDist({
                                                doc,
                                                distDocPermalink,
                                                kind,
                                            }),
                                        )
                                        .then((results) => {
                                            resolve()
                                        }),
                                )
                                .catch(reject)
                        })
                    }
                    //console.log(JSON.stringify(results, null, 4))
                })
            })
            .catch(reject)
    })
