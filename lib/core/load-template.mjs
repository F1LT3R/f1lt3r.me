import path from 'path'

import readTemplateFile from './read-template-file.mjs'

export default (build) =>
    new Promise((resolve, reject) => {
        const { templates: templateGroups } = build

        // console.log(templateGroups);
        const templateFilePromises = []

        for (const groupName in templateGroups) {
            const group = templateGroups[groupName]

            for (const zone in group) {
                // console.log(groupName, zone)
                const template = group[zone]
                const templateFilepath = path.resolve('.', template)
                // console.log(templateFile)
                templateFilePromises.push(readTemplateFile(templateFilepath, groupName, zone))
            }
        }

        Promise.all(templateFilePromises)
            .then((templateFiles) => {
                const templates = Object.assign({}, { templateGroups })

                templateFiles.forEach((template) => {
                    if (!templates[template.group]) {
                        templates[template.group] = {}
                    }
                    templates[template.group][template.zone] = template
                })
                resolve(templates)
            })
            .catch(reject)
    })
