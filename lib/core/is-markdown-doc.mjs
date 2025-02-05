import path from 'path'

// kind = post or page with trailing underscore in filename
export default (filepath, kind) => {
    const { ext, name } = path.parse(filepath)

    if (ext === '.md' && name.slice(0, 5) === `${kind}_`) {
        return true
    }

    return false
}
