// This file stores functions on payment
const AlipaySdk = require('alipay-sdk').default;
const config = require('../config');
const { patch } = require('../users/users.model');
const { setValue, getValue, delValue } = require('./cachemanager.tool');
// TypeScript，可以使用 import AlipaySdk from 'alipay-sdk';
// 普通公钥模式
const alipaySdk = new AlipaySdk({
  appId: config.app_id,
  keyType: config.key_type, // 默认值。请与生成的密钥格式保持一致，参考平台配置一节
  privateKey: config.private_key,
  alipayPublicKey: config.alipay_public_key,
});

exports.paymentHandler = async (user, userId, addedCoinsNum, cacheKey) => {
    // const result = await alipaySdk.exec('alipay.open.public.qrcode.create');
    // console.log(result)
    await setValue(cacheKey + "_fakepayment", false);
    while(true){
        if(await getValue(cacheKey + "_fakepayment")){
            await delValue(cacheKey + "_fakepayment");
            console.log('money gotten');
            break;
        }
        await sleep(0.5);
    }
    await coinAdder(user, userId, addedCoinsNum)
    await setValue(cacheKey, true)
}

const coinAdder = async (user, userId, addedCoinsNum) => {
    const newCoins = user.coins + addedCoinsNum;
    const upgradedData = {...user};
    upgradedData.coins = newCoins;
    // console.log(upgradedData);
    const result = await patch(userId, upgradedData);
    // console.log("coin add", result);
    return {result, newCoins};
}

const sleep = async (second) => {
    return new Promise(resolve => setTimeout(resolve, second * 1000));
}