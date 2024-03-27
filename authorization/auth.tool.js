const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const config = require('../config.js');
const UserModel = require('../users/users.model');

//-----验证------

var AuthTool = {};

// 验证JWT的有效性
AuthTool.isValidJWT = (req, res, next) => {

    if (!req.headers['authorization'])
        return res.status(401).send();

    try {
        // 验证访问令牌
        let authorization = req.headers['authorization'];
        req.jwt = jwt.verify(authorization, config.jwt_secret);

        // 验证过期时间
        const nowSeconds = Math.round(Number(new Date()) / 1000);
        const expiration = req.jwt.iat + config.jwt_expiration;
        if(nowSeconds > expiration)
            return res.status(403).send({error: "过期"});

    } catch (err) {
        return res.status(403).send({error: "无效令牌"});
    }

    return next();
};

// 验证登录的有效性
AuthTool.isLoginValid = async(req, res, next) => {

    if (!req.body || !req.body.password) 
        return res.status(400).send({error: '无效参数'});

    // 需要用户名或电子邮件，但不需要两者都有
    if (!req.body.email && !req.body.username) 
        return res.status(400).send({error: '无效参数'});

    var user = null;
    
    if(req.body.email)
        user = await UserModel.getByEmail(req.body.email);
    else if(req.body.username)
        user = await UserModel.getByUsername(req.body.username);
    if(!user)
        return res.status(404).send({error: "无效用户名或密码"});

    let validPass = AuthTool.validatePassword(user, req.body.password);
    if(!validPass)
        return res.status(400).send({error: '无效用户名或密码'});

    if(user.permission_level <= 0)
        return res.status(403).send({error: "您的帐户已被禁用，请联系工作人员。"});

    req.login = {
        userId: user.id,
        username: user.username,
        email: user.email,
        permission_level: user.permission_level,
        validation_level: user.validation_level,
        provider: req.body.email ? 'email' : 'username',
    };

    return next();
};

// 验证刷新令牌的有效性
AuthTool.isRefreshValid = async(req, res, next) => {

    if (!req.body || !req.body.refresh_token)
        return res.status(400).send();

    if (!req.headers['authorization'])
        return res.status(401).send();
	
	if (typeof req.body.refresh_token !== "string")
        return res.status(400).send();

    try {
        // 验证访问令牌
        let authorization = req.headers['authorization'];
        req.jwt = jwt.verify(authorization, config.jwt_secret);

        // 验证过期时间
        const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
        const expiration = req.jwt.iat + config.jwt_refresh_expiration;
        if(nowUnixSeconds > expiration)
            return res.status(403).send({error: "令牌已过期"});

        // 验证刷新令牌
        let refresh_token = req.body.refresh_token;
        let hash = crypto.createHmac('sha512', req.jwt.refresh_key).update(req.jwt.userId + config.jwt_secret).digest("base64");
        if (hash !== refresh_token)
            return res.status(403).send({error: '无效刷新令牌'});
		
		// 验证数据库中的刷新密钥
        var user = await UserModel.getById(req.jwt.userId);
        if(!user)
            return res.status(404).send({error: "无效用户"});
		
		if(user.refresh_key !== req.jwt.refresh_key)
            return res.status(403).send({error: '无效刷新密钥'});

    } catch (err) {
        return res.status(403).send({error: "无效令牌"});
    }
    // hihi
    req.login = req.jwt;
    delete req.login.iat; // 删除先前的iat以生成新的
    return next();
};

// 哈希密码
AuthTool.hashPassword = (password) => {
    let saltNew = crypto.randomBytes(16).toString('base64');
    let hashNew = crypto.createHmac('sha512', saltNew).update(password).digest("base64");
    let newPass = saltNew + "$" + hashNew;
    return newPass;
}

// 验证密码
AuthTool.validatePassword = (user, password) =>
{
    let passwordFields = user.password.split('$');
    let salt = passwordFields[0];
    let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
    return hash === passwordFields[1];
}

//--- 权限 -----

// 检查用户权限等级
AuthTool.isPermissionLevel = (required_permission) => {
    return (req, res, next) => {
        let user_permission_level = parseInt(req.jwt.permission_level);
        if (user_permission_level >= required_permission) {
            return next();
        } else {
            return res.status(403).send({error: "拒绝访问"});
        }
    };
};

// 检查是否是相同用户或具有指定权限
AuthTool.isSameUserOr = (required_permission) => {
    return (req, res, next) => {
        let user_permission_level = parseInt(req.jwt.permission_level);
        let userId = req.params.userId || "";
        let same_user = (req.jwt.userId === userId || req.jwt.username.toLowerCase() === userId.toLowerCase());
        if (userId && same_user) {
            return next();
        } else {
            if (user_permission_level >= required_permission) {
                return next();
            } else {
                return res.status(403).send({error: "拒绝访问"});
            }
        }
    };
};

module.exports = AuthTool;
