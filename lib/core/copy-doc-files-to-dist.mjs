import isMarkdownDoc from './is-markdown-doc.mjs'

export default (doc) =>
    new Promise((resolve, reject) => {
        const { distDir, file } = doc

        const srcDir = path.parse(file).dir
        doc.srcDir = srcDir

        const options = {
            utimes: true, // keep add time and modify time
            mode: true, // keep file mode
            cover: true, // cover file when exists, default is true

            // Don't copy over the markdown page file
            filter: (stat, filepath, filename) => {
                if (stat === 'file' && isMarkdownDoc(filepath, doc.kind)) {
                    return false
                }

                return true
            },
        }

        const copyPageDirPromise = () =>
            new Promise((resolve, reject) => {
                mkdirRecursive(distDir)
                    .then(() => {
                        copydir(srcDir, distDir, options, function (err) {
                            if (err) return reject(err)
                            resolve(page)
                        })
                    })
                    .catch(reject)
            })

        copyPageDirPromise().then(resolve).catch(reject)
    })
