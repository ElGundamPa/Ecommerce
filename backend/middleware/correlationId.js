const { v4: uuid } = require('uuid');

function correlationId() {
  return (req, res, next) => {
    // Obtener correlation ID del header entrante o generar uno nuevo
    const incoming = req.headers['x-correlation-id'];
    req.cid = incoming || uuid();
    
    // Establecer el header en la respuesta
    res.setHeader('x-correlation-id', req.cid);
    
    // Si existe un logger global, se podría añadir el cid al contexto aquí
    // Por ejemplo: req.logger = logger.child({ correlationId: req.cid });
    
    next();
  };
}

module.exports = { correlationId };
