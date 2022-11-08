const express = require('express');
const serverless = require('serverless-http');
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    const auth = { login: 'yourlogin', password: 'yourpassword' }
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    if (login && password && login === auth.login && password === auth.password) {
        return next()
    }
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).json(
        {
            "message": "Unauthorized",
            "status_code": 401,
            "type": "UNAUTHORIZED",
            "code": "UNAUTHORIZED"
        }
    )
})

app.get('/api/health', (req, res) => {
    res.json({"msg": "Todo piola"});
})

const invalidCodes = {
    '819wash': "The gift card has already been used",
    'FOWPV6YF3': "The gift card has already been used",
    'FOWP5Q2XU': "The gift card has already been used",
    'FOWP9Y68C': "The gift card has expired",
    'huntxo': "The gift card has expired",
    'improv': "The gift card has expired",
    'ACR41JA': "Unable to use ACR41JA gift card for your transaction",
    'ACR41JB': "Unable to use ACR41JA gift card for your transaction",
    'ACR41JC': "Unable to use ACR41JA gift card for your transaction",
    'PRLJ7T2DR': "The gift card only applies to @warbyparker.com clients",
    'PRJDASCA': "Cannot refund for more than"
}

const errorsOfBodyParams = (expected_params, body_params) => {
    let unexpected_keys = [];
    let missing_keys = [];
    Object.keys(body_params).forEach((_key)=>{
        if (!expected_params.includes(_key)){
            unexpected_keys.push(_key);
        }
    })
    expected_params.forEach((_key)=>{
        if (!Object.keys(body_params).includes(_key)){
            missing_keys.push(_key);
        }
    })
    const hasUnexpectedParams = unexpected_keys.length > 0
    const hasMissingParams = missing_keys.length > 0
    if (!hasUnexpectedParams || !hasMissingParams){
        return;
    }
    const unexpected_keys_message = hasUnexpectedParams ? "Unexpected keys: " + unexpected_keys.join() : null;
    const missing_keys_message = hasMissingParams ? "Missing keys: " + missing_keys.join() : null;
    const breakLine = hasUnexpectedParams && hasMissingParams ? "\n" : ''
    return `${unexpected_keys_message}${breakLine}${missing_keys_message}`
}
const giftcardUri = "/api/gift_card";

// Authorize gift card
app.post(`${giftcardUri}/authorize`, (req, res) => {
    const body = req.body;
    const expected_params = ["gift_card_code", "amount", "sales_order_id"]
    const parametersErrors = errorsOfBodyParams(expected_params, body)
    if(parametersErrors){
        return res.status(400).json({"error": {"message": parametersErrors}})
    }
    const code = body["gift_card_code"]
    const amount = body["amount"]
    if( amount <= 0){
        return res.status(400).json({"error": {"message": "Invalid authorize amount."}})
    }
    if (invalidCodes[code]) {
        return res.status(400).json({"error": {"message": invalidCodes[code]}})
    }
    return res.status(200).json({"transaction_id": "my_transaction_id"});
})

// Capture gift card
app.post(`${giftcardUri}/capture`, (req, res) => {
    const body = req.body;
    const expected_params = ["amount", "payment_id", "sales_order_id", "gift_card_code"]
    const parametersErrors = errorsOfBodyParams(expected_params, body)
    if(parametersErrors){
        return res.status(400).json({"error": {"message": parametersErrors}})
    }
    const code = body["gift_card_code"]
    const amount = body["amount"]
    if( amount <= 0){
        return res.status(400).json({"error": {"message": "Invalid capture amount."}})
    }
    if (invalidCodes[code]) {
        return res.status(400).json({"error": {"message": invalidCodes[code]}})
    }
    return res.status(200).json({"transaction_id": "my_transaction_id"});
})

// Refund gift card
app.post(`${giftcardUri}/refund`, (req, res) => {
    const body = req.body;
    const expected_params = ["gift_card_code", "amount", "sales_order_id", "payment_id"]
    const parametersErrors = errorsOfBodyParams(expected_params, body)
    if(parametersErrors){
        return res.status(400).json({"error": {"message": parametersErrors}})
    }
    const code = body["gift_card_code"]
    const amount = body["amount"]
    if( amount <= 0){
        return res.status(400).json({"error": {"message": "Invalid refund amount."}})
    }
    if (invalidCodes[code]) {
        return res.status(400).json({"error": {"message": invalidCodes[code]}})
    }
    return res.status(200).json({"transaction_id": "my_transaction_id"});
})

module.exports.handler = serverless(app);