import readDir from './read-dir.mjs'
import readDocFile from './read-doc-file.mjs'
import getDocDetails from './get-doc-details.mjs'
import updateSearch from './update-search.mjs'

export default (dirSrc, kind, updateSingleDoc) =>
    new Promise((resolve, reject) => {
        console.log({ dirSrc, kind, updateSingleDoc })

        const readDirs = []
        const docs = {}

        const search = {
            tags: {},
            authors: {},
            words: {},
            dates: {},
            types: {},
        }

        readDir(dirSrc)
            .then(async ({ dir }) => {
                for (const docDir of dir) {
                    // updateSingleDoc to only process the post that was changed
                    if (updateSingleDoc && !updateSingleDoc.includes(docDir)) {
                        continue
                    }

                    const nextPromise = new Promise((resolve, reject) => {
                        /* prettier-ignore */
                        readDir(docDir)
						.then(files => readDocFile(files, kind))
						.then(({ file, fileDataUTF8 }) => getDocDetails(file, fileDataUTF8, kind))
						.then(resolve)
                        .catch(reject)
                    })
                    readDirs.push(nextPromise)
                }

                return Promise.allSettled(readDirs).then((results) => {
                    results.forEach(({ value: doc }) => {
                        console.log({ doc })

                        docs[doc.datetime] = doc

                        const {
                            attributes: { tags, authors, type },
                            datetime,
                            file,
                        } = doc

                        updateSearch(search.tags, tags, file)
                        updateSearch(search.authors, authors, file)
                        updateSearch(search.dates, [datetime], file)
                        updateSearch(search.types, [type], file)
                    })

                    resolve({ docs, search })
                })
            })
            .catch(reject)
    })
