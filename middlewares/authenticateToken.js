const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config()

function authenticateToken(request, response, next) {
    const token = request.headers["authorization"]
    if (token == null) return response.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err) => {
        console.log(err)
        if (err) return response.sendStatus(403)

        next()
    })
}

module.exports =
    authenticateToken