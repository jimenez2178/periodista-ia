const express = require("express");
const { listHistoryForUser } = require("./history.service");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const items = await listHistoryForUser(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
