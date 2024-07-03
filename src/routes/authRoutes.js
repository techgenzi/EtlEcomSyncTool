const controllers = require('../controllers/authController')
const router = require('express').Router()

router.post('/login', controllers.login)
router.post('/ping', controllers.pingUser)

module.exports = router;