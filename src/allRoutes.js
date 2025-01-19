const authRouter = require('./authRoutes');
// const orderRouter = require('./orderRoutes');
// const reportRouter = require('./reportRoutes');
const express = require('express');


const router = express.Router();

// Rota de autenticação

router.use( authRouter);
// router.use( orderRouter);
// router.use( reportRouter);

module.exports = router;



