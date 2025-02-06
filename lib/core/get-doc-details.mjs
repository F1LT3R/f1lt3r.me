import path from 'path'

import frontmatter from 'front-matter'

import prettyDate from './pretty-date.mjs'
import prettyUpdateDates from './pretty-update-dates.mjs'

export default (file, fileDataUTF8, kind) =>
    new Promise((resolve, reject) => {
        let details
        let datetime
        let postdate
        let updated

        try {
            details = frontmatter(fileDataUTF8)

            if (kind === 'post') {
                datetime = path.parse(file).dir.split('/').slice(-1)[0].slice(0, 16)
            }

            if (kind === 'page') {
                datetime = details.attributes.date
            }

            console.log({ datetime })

            // `datetime`, eg: 2024-02-08-22-00
            postdate = prettyDate(datetime)
            updated = prettyUpdateDates(details.attributes.updated, true)
        } catch (err) {
            return reject(err)
        }

        const result = Object.assign({ file, datetime, postdate, ...details, updated })
        resolve(result)
    })
