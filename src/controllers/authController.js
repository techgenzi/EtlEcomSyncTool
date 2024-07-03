const { default: axios } = require('axios');


exports.login = async (req, res) => {
    /*let driver = new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build()
    driver.get("https://google.com") */
    // console.log(setPassword("Admin@123"))

    try {
        const user = await axios.post(process.env.IPSS_LOGIN_API, {
            username: req.body.username,
            password: req.body.password
        })

        return res.status(200).send(user.data);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.pingUser = async (req, res, next) => {
    try {
        const user = await axios.get(process.env.IPSS_PING_USER_API, {
            headers: {
                'Authorization': req.headers.authorization
            }
        })
        return res.status(200).send(user.data);
    } catch (error) {
        return res.status(401).send({ message: error.message });
    }
}