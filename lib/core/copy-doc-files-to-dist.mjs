import path from 'path'

import copydir from 'copy-dir'

import isMarkdownDoc from './is-markdown-doc.mjs'
import mkdirRecursive from './mkdir-recursive.mjs'

export default ({ doc, distDocPermalink, kind }) =>
    new Promise((resolve, reject) => {
        console.log({ distDocPermalink, kind })

        const { file } = doc

        const srcDir = path.parse(file).dir

        const options = {
            utimes: true, // keep add time and modify time
            mode: true, // keep file mode
            cover: true, // cover file when exists, default is true

            // Don't copy over the markdown page file
            filter: (stat, filepath) => {
                if (stat === 'file' && isMarkdownDoc(filepath, kind)) {
                    return false
                }

                return true
            },
        }

        const copyPageDirPromise = () =>
            new Promise((resolve, reject) => {
                mkdirRecursive(distDocPermalink)
                    .then(() => {
                        copydir(srcDir, distDocPermalink, options, function (err) {
                            if (err) return reject(err)
                            resolve(doc)
                        })
                    })
                    .catch(reject)
            })

        copyPageDirPromise().then(resolve).catch(reject)
    })
