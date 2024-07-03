//This middleware simply sets some required headers for using the Github APIm
const jwt = require('jsonwebtoken');

const setHeaders = function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next()
    /*
    // console.log(req.path)
    if (req.path === "/api/idm/login" || req.path.includes("/api/portal")) {
        next()
    } else if (req.path.includes("/api")) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (token == null) return res.sendStatus(401)

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            console.log(err)

            if (err) return res.sendStatus(403)

            req.user = user

            next()
        })
    } else {
        next()
    } */
}


module.exports = { setHeaders }