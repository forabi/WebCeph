const { Router } = require('express');

const router = new Router();

router.post('/', (req, res) => {
  // @TODO
  console.log(req.body);
  res.send(201);
});

module.exports = router;
