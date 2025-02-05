import fs from 'fs'

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
