export const  pagination = async ({ page = 1, model, populate = [] } = {}) => {
    let _page = page * 1 || 1
    if (_page < 1) page = 1
    const limit = 2
    const skip = (_page - 1) * limit
    const data = await model.find({}).limit(limit).skip(skip).populate([])
    return {data,_page}
}