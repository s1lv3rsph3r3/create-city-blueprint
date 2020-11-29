/* Middleware functions take params [req, res, next] */

module.exports = (function start() {
  const authenticateConsole = (req, res, next) => {
    const body = req.body;
    if(body.username === 'admin' && body.password === 'password'){
      console.log('AUTH - Middleware');
      next();
    }else{
      console.log('AUTH - Failed');
      res.status(401).json({message : 'Request not authorised'});
    }
  };

  return {
    authenticateConsole,
  };
}());
