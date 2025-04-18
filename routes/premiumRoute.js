const express = require('express');
const { authenticate } = require('../middleware/authentication');
const { purchasepremium, updateTransactionStatus, updateFailedTransactionStatus, checkPremium } = require('../controllers/purchaseController');
const { showLeaderBoard, downloadfile, oldReports } = require('../controllers/premiumFeaturesController');

const router = express.Router();


// router.get("/premiummembership", authenticate, purchasepremium);
// router.get("/checkpremium",authenticate,checkPremium);
// router.post("/updatetransactionstatus",authenticate,updateTransactionStatus);
// router.post("/updatefailedtransactionstatus",authenticate,updateFailedTransactionStatus);
// router.get("/showleaderboard",showLeaderBoard);
// router.get('/download',authenticate, downloadfile);
// router.get('/oldReports',authenticate,oldReports)
module.exports = router;