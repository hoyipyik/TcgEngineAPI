const { setValue } = require("../tools/cachemanager.tool")

exports.ConfirmPayment = async (req, res) => {
    // const checkKey = req.body.checkKey
    await setValue("fakepayment", true);
}