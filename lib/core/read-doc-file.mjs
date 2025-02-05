import isMarkdownDoc from './is-markdown-doc.mjs'

export default ({ file: files }, kind) =>
    new Promise((resolve, reject) => {
        for (const file of files) {
            if (isMarkdownDoc(file, kind)) {
                fs.readFile(file, 'utf8', function (err, fileDataUTF8) {
                    if (err) return reject(err)
                    return resolve({ file, fileDataUTF8 })
                })
            }
        }
    })
