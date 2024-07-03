const controllers = require('../controllers/portalController')

const router = require('express').Router()

router.get('/test', controllers.testUrl)
router.get('/ping-api', controllers.pingApi)
router.get('/last-synced', controllers.lastSynced)
router.get('/system-check', controllers.systemCheck)
router.get('/sync-data', controllers.syncData)
router.get('/get-access-token', controllers.getACcessToken)
router.get('/', controllers.openPortal)


module.exports = router;