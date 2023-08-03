const { hashPassword } = require('../authorization/auth.tool');
const { memoryCache } = require('../server');

exports.getValue = async (key) => {
    return await (await memoryCache).get(key)
}

exports.setValue = async (key, value) => {
    await (await memoryCache).set(key, value)
    // console.log(key, value)
}

exports.delValue = async (key) => {
   await (await memoryCache).del(key)
}

exports.keyGenerator = (userId) => {
    const timeStamp = new Date().getTime()
    const rawKey = userId + timeStamp
    return hashPassword(rawKey)
}