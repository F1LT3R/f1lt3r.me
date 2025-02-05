import fs from 'node:fs'
import path from 'node:path'

import settings from '../site-settings.json' with { type: 'json' }
import copyFiles from './core/copy-files.mjs'
import loadTemplates from './core/load-template.mjs'
import getMarkdownDocs from './core/get-markdown-docs.mjs'
import markdown from './markdown.mjs'
import embedDocInHTMLTemplate from './core/embed-doc-in-html-template.mjs'
import writeDocToHtml from './core/write-doc-to-html.mjs'
import copyDocFilesToDist from './core/copy-doc-files-to-dist.mjs'

const ENV = process.env.NODE_ENV

const kind = 'page'

export default (updateSingleDoc) =>
    new Promise((resolve, reject) => {
        const { build } = settings
        const dirSrc = build[`${kind}s_dir`].src

        copyFiles(build)
            .then(loadTemplates(build))
            .then((templates) => {
                console.log(templates)

                getMarkdownDocs(dirSrc, updateSingleDoc).then((results) => {
                    // console.log(results.pages)

                    for (const docDate in results.docs) {
                        const doc = results.docs[docDate]
                        // console.log(doc.body)
                        // console.log(doc);

                        const { body, file } = doc

                        markdown(body).then((html) => {
                            // Attach parsed markdown as html to page object
                            doc.html = html
                            embedDocInHTMLTemplate(doc, templates, settings)
                                .then((doc) => {
                                    writeDocToHtml(doc, build)
                                        .then(copyDocFilesToDist)
                                        .then((results) => {
                                            resolve()
                                        })
                                })
                                .catch(reject)
                            // console.log(html)
                        })
                    }
                    //console.log(JSON.stringify(results, null, 4))
                })
            })
            .catch(reject)
    })
