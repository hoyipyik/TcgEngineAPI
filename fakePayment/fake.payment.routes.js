const FakePaymentController = require('./fake.payment.controller');

exports.route = (app) => {
    app.post("/fakepayment/confirm", [
        FakePaymentController.ConfirmPayment,
    ])
}