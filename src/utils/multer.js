const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define el directorio base de destino
const baseDestination = path.join(__dirname, '..', 'public', 'uploads', 'images_products');

// Asegúrate de que el directorio base exista
if (!fs.existsSync(baseDestination)) {
  fs.mkdirSync(baseDestination, { recursive: true });
}

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determina el destino según el nombre del campo del archivo
    let destination;
    if (file.fieldname === 'smallImage') {
      destination = path.join(baseDestination, 'small');
    } else if (file.fieldname === 'mediumImage') {
      destination = path.join(baseDestination, 'medium');
    } else {
      destination = baseDestination; // Si no coincide con ningún nombre de campo específico
    }
    
    // Crea el directorio de destino si no existe
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    cb(null, destination);
  },
  
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
