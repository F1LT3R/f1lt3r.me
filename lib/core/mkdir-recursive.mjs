import fs from 'fs'

export default (dir) =>
    new Promise((resolve, reject) => {
        fs.mkdir(dir, { recursive: true }, (err, data) => {
            if (err) return reject(err)
            resolve(dir)
        })
    })
