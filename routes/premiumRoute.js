import { Router } from 'express';
import { authenticate } from '../middleware/authentication.js';
import { purchasepremium, updateTransactionStatus, updateFailedTransactionStatus, checkPremium } from '../controllers/purchaseController.js';
import { createFile, oldReports, showLeaderBoard,downloadOldFile } from '../controllers/premiumFeaturesController.js';

const router = Router();


 router.get("/premiummembership", authenticate, purchasepremium);
 router.get("/checkpremium",authenticate,checkPremium);
 router.post("/updatetransactionstatus",authenticate,updateTransactionStatus);
 router.post("/updatefailedtransactionstatus",authenticate,updateFailedTransactionStatus);
 router.get("/showleaderboard",showLeaderBoard);
router.get('/download',authenticate, createFile);
router.get('/oldReports',authenticate,oldReports)
router.get('/downloadold',authenticate,downloadOldFile);
export default router;