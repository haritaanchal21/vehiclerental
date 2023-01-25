const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
// const vehicleController = require('../controllers/vehicleControllers');
// const stationController = require('../controllers/stationControllers');
// const inventoryController = require('../controllers/inventoryControllers');

// User routes
router.post('/api/users', userController.register);
router.put('/api/users/verify', userController.verify);

// // Vehicle routes
// router.post('/api/vehicles', vehicleController.create);
// router.put('/api/vehicles/:id', vehicleController.update);
// router.delete('/api/vehicles/:id', vehicleController.delete);

// // Station routes
// router.post('/api/stations', stationController.create);
// router.put('/api/stations/:id', stationController.update);
// router.delete('/api/stations/:id', stationController.delete);

// // Inventory routes
// router.put('/api/inventory', inventoryController.update);
// router.get('/api/stations/:id/vehicles', inventoryController.getVehicles)

module.exports = router;
