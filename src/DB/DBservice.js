
export const create = async ({ model, query = {} } = {}) => {
    return await model.create(query)
}

export const findOne = async ({ model, filter = {}, populate = []} = {}) => {
    return await model.findOne(filter).populate(populate)
}

export const find = async ({ model, filter = {}, populate = [], skip = 0, limit = 100 } = {}) => {
    return await model.find(filter).populate(populate).skip(skip).limit(limit)
}

export const findByIdAndUpdate = async ({ model, id = {},update={},options= { new: true } ,populate = []} = {}) => {
    return await model.findByIdAndUpdate(id,update,options).populate(populate)
}

export const updateOne = async ({ model, filter = {}, update = {} } = {}) => {
    return await model.updateOne(filter, update)
}

export const deleteOne = async ({ model, filter = {} } = {}) => {
    return await model.deleteOne(filter)
}

export const deleteMany = async ({ model, filter = {} } = {}) => {
    return await model.deleteOne(filter)
}

export const findOneAndUpdate = async ({ model, filter = {}, update = {}, populate = [], options = { new: true }} = {}) => {
    return await model.findOneAndUpdate(filter, update, options).populate(populate)
}