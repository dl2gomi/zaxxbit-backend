const express = require('express');
const router = express.Router();

const { userController } = require('@/controllers/v1');
const { auth } = require('@/middlewares');

router.post('/register', userController.register); // /api/v1/users/register
router.post('/login', userController.login); // /api/v1/users/login
router.get('/info', auth, userController.info); // /api/v1/users/info
router.get('/balance', auth, userController.balance); // /api/v1/users/balance
router.post('/update', auth, userController.update); // /api/v1/users/update
router.post('/changepassword', auth, userController.change); // /api/v1/users/passwordchange
router.get('/tfa', auth, userController.tfaInfo); // /api/v1/users/tfa
router.post('/tfa', auth, userController.tfaCheck); // /api/v1/users/tfa

module.exports = router;
