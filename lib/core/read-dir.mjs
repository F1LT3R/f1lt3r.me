import fs from 'fs'
import path from 'path'

const readTypes = {
    1: 'file',
    2: 'dir',
    3: 'link',
}

export default (dir) =>
    new Promise((resolve, reject) => {
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {
            if (err) return reject(console.error(err))

            const result = {
                root: path.resolve(dir),
                file: [],
                dir: [],
            }

            for (const file of files) {
                const num = file[Object.getOwnPropertySymbols(file)[0]]
                const validEnum = Object.keys(readTypes).includes(String(num))
                if (!validEnum) continue

                const type = readTypes[num]
                result[type].push(path.resolve(dir, file.name))
            }

            resolve(result)
        })
    })
