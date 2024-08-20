const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.list);
router.post('/add', customerController.save);
router.get('/edit/:id', customerController.edit); // Ruta para obtener el formulario de edición
router.post('/update/:id', customerController.update); // Ruta para actualizar el cliente
router.get('/delete/:id', customerController.delete);

module.exports = router;
