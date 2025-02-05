import fs from 'fs'

export default (file, group, zone) =>
    new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', function (err, fileDataUTF8) {
            if (err) return reject(err)
            return resolve({ file, fileDataUTF8, group, zone })
        })
    })
