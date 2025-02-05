import path from 'path'

import copyDir from 'copy-dir'

import mkdirRecursive from './mkdir-recursive.mjs'

export default (build) =>
    new Promise((resolve, reject) => {
        const options = {
            utimes: true, // keep add time and modify time
            mode: true, // keep file mode
            cover: true, // cover file when exists, default is true
        }

        const copyFilePromises = []

        build.copy_files.forEach((batch) => {
            const from = path.resolve('.', batch.src)
            const to = path.resolve('.', batch.dist)

            const nextPromise = new Promise((resolve, reject) => {
                mkdirRecursive(to)
                    .then(() => {
                        copyDir(from, to, options, function (err) {
                            if (err) return reject(err)
                            resolve({ from, to })
                        })
                    })
                    .catch((err) => reject(err))
            })
            copyFilePromises.push(nextPromise)
        })

        Promise.all(copyFilePromises).then(resolve).catch(reject)
    })
