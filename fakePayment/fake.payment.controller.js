const { setValue, getValue } = require("../tools/cachemanager.tool")

exports.ConfirmPayment = async (req, res) => {
    // const checkKey = req.body.checkKey
    await setValue("fakepayment", true);
    return res.status(200).send("Ok");
}

exports.GetPrice = async (req, res) => {
    const value = await getValue('payValue');
    if(!value){
        res.status(400).send({error: "No price", flag: false});
    }
    return res.send({flag: true, price: value + " RMB"})
}