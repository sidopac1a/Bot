const express = require('express');
const router = express.Router();
router.get('/status', (req, res) => res.json({ ok: true, admin: true }));
module.exports = router;
