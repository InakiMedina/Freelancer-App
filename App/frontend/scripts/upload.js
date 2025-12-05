const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Crear carpetas si no existen
const folders = ['uploads/avatars', 'uploads/portfolio', 'uploads/projects', 'uploads/temp'];
folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

// 2. Configurar dónde guardar cada tipo de archivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'uploads/temp/';
    
    if (file.fieldname === 'avatar') {
      folder = 'uploads/avatars/';
    } else if (file.fieldname === 'images') {
      folder = 'uploads/portfolio/';
    } else if (file.fieldname === 'attachment') {
      folder = 'uploads/projects/';
    }
    
    cb(null, folder);
  },
  
  filename: function (req, file, cb) {
    // Crear nombre único: fecha + número random + extensión
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// 3. Configurar límites y tipos permitidos
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 10 // Máximo 10 archivos por petición
  },
  fileFilter: function (req, file, cb) {
    // Aceptar solo imágenes y PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, PNG, GIF) y PDFs'));
    }
  }
});

module.exports = upload;
