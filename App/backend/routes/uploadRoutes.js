const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Importar modelos
const User = require('../models/User');
const Project = require('../models/Project');

// SERVIR ARCHIVOS ESTÁTICOS
router.use('/files', express.static(path.join(__dirname, '../uploads')));

//1. SUBIR AVATAR (LOCAL)
router.post('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se seleccionó ninguna imagen' 
      });
    }

    // Información del archivo subido
    const fileInfo = {
      filename: req.file.filename,
      path: req.file.path, // Ruta completa en servidor
      url: `/uploads/avatars/${req.file.filename}`, // URL para acceder
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    // 1. Guardar en MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: fileInfo,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    // 2. Responder con éxito
    res.json({
      success: true,
      message: 'Avatar subido correctamente',
      fileInfo: fileInfo,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Si hay error, eliminar el archivo subido
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error eliminando archivo:', err);
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al subir avatar',
      error: error.message 
    });
  }
});

//2. SUBIR PORTFOLIO (LOCAL)
router.post('/portfolio', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se seleccionaron imágenes' 
      });
    }

    // Procesar cada archivo
    const portfolioItems = req.files.map(file => ({
      title: req.body.titles ? req.body.titles[req.files.indexOf(file)] : `Proyecto ${req.files.indexOf(file) + 1}`,
      description: req.body.descriptions ? req.body.descriptions[req.files.indexOf(file)] : '',
      filename: file.filename,
      path: file.path,
      url: `/uploads/portfolio/${file.filename}`,
      category: req.body.category || 'general',
      createdAt: new Date()
    }));

    // Guardar en MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { portfolio: { $each: portfolioItems } },
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: `${req.files.length} imagen(es) agregadas al portafolio`,
      portfolioItems: portfolioItems,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Eliminar archivos subidos en caso de error
    if (req.files) {
      req.files.forEach(file => {
        if (file.path) {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error eliminando archivo:', err);
          });
        }
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al subir portafolio' 
    });
  }
});

//3. ELIMINAR ARCHIVO
router.delete('/file/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;
    
    // Buscar el archivo en el usuario
    const user = await User.findById(userId);
    
    // Buscar en portfolio
    const portfolioItem = user.portfolio.find(item => item.filename === filename);
    let filePath = '';
    
    if (portfolioItem) {
      filePath = portfolioItem.path;
      // Eliminar de MongoDB
      await User.findByIdAndUpdate(
        userId,
        { $pull: { portfolio: { filename: filename } } }
      );
    } 
    // Buscar en avatar
    else if (user.profileImage && user.profileImage.filename === filename) {
      filePath = user.profileImage.path;
      // Eliminar de MongoDB
      await User.findByIdAndUpdate(
        userId,
        { $unset: { profileImage: "" } }
      );
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'Archivo no encontrado' 
      });
    }
    
    // Eliminar archivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar archivo' 
    });
  }
});

//4. OBTENER ARCHIVOS DE USUARIO
router.get('/user/:id/files', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .select('profileImage portfolio')
      .lean(); // Convertir a objeto simple
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    res.json({
      success: true,
      profileImage: user.profileImage,
      portfolio: user.portfolio || []
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener archivos' 
    });
  }
});

module.exports = router;
