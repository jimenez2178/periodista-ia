const multer = require("multer");

function errorHandler(err, req, res, next) {
  // Archivo por encima del tope de multer (25 MB): mensaje claro en vez de "error interno".
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error:
          "El archivo supera el máximo de 25 MB. Prueba con uno más liviano: comprime el PDF o exporta el audio en MP3.",
        code: "FILE_TOO_LARGE",
      });
    }
    return res.status(400).json({ error: "No pudimos leer el archivo enviado. Intenta de nuevo." });
  }

  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error interno del servidor" });
}

module.exports = errorHandler;
