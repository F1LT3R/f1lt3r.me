export default (doc, templates, settings) =>
    new Promise(async (resolve, reject) => {
        const { attributes, file, html, pageDate, datetime, kind } = doc
        const { excerpt, permalink: relativePermalink } = attributes
        const { site, social } = settings

        // console.log({templates})
        // console.log(templates.index.base.fileDataUTF8)

        const atTime = chalk.yellow(datetime)
        const toPath = chalk.green.underline(`/${relativePermalink}`)
        console.log(`${atTime}: ${toPath}`)

        const permalink =
            doc.kind === 'home'
                ? `${site.baseurl}/`
                : `${site.baseurl}/${doc.kind}/${relativePermalink}`

        const base_template = handlebars.compile(templates.index.base_template.fileDataUTF8)
        const head_template = handlebars.compile(templates.index.head_template.fileDataUTF8)(
            Object.assign(
                {},
                { ...site },
                { ...attributes },
                {
                    SOCKETS: ENV === 'development',
                    ogtype: 'article',
                    excerpt,
                    permalink,
                },
            ),
        )
        const nav_template = handlebars.compile(templates.index.nav_template.fileDataUTF8)({})
        const header_template = handlebars.compile(templates.index.header_template.fileDataUTF8)({
            site,
        })
        const main_template = handlebars.compile(templates[kind].main_template.fileDataUTF8)({
            doc,
        })
        const footer_template = handlebars.compile(templates.index.footer_template.fileDataUTF8)({
            site,
            social,
        })

        const result = base_template({
            head_template,
            nav_template,
            header_template,
            main_template,
            footer_template,
            layout: doc.attributes.layout || doc.kind,
        })

        doc.outerHTML = result

        resolve(doc)
    })
