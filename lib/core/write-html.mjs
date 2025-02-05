import fs from 'fs'

import mkdirRecursive from './mkdir-recursive.mjs'

export default (html, fileDir, filePath) =>
    new Promise((resolve, reject) => {
        mkdirRecursive(fileDir)
            .then(() => {
                fs.writeFile(filePath, html, (err) => {
                    if (err) return reject(err)
                    resolve(filePath)
                })
            })
            .catch(reject)
    })
