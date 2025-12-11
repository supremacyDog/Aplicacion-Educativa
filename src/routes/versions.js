const express = require("express");
const router = express.Router();
const versionController = require("../controllers/versionController");
const { isAuthenticated, isProfessor } = require("../middleware/auth");

// Historial de versiones
router.get(
  "/topic/:topicId/history",
  isAuthenticated,
  versionController.getVersionHistory
);

// Obtener versión específica por ID
router.get(
  "/topic/:topicId/version/:versionId",
  isAuthenticated,
  versionController.getVersionById
);

// Obtener versión por número
router.get(
  "/topic/:topicId/version-num/:versionNum",
  isAuthenticated,
  versionController.getVersionByNumber
);

// Comparar dos versiones
router.get(
  "/topic/:topicId/compare/:version1/:version2",
  isAuthenticated,
  versionController.compareVersions
);

// Restaurar versión (solo profesores)
router.post(
  "/topic/:topicId/restore/:versionId",
  isProfessor,
  versionController.restoreVersion
);

// Notificaciones
router.get(
  "/notifications",
  isAuthenticated,
  versionController.getNotifications
);
router.patch(
  "/notifications/:notificationId/read",
  isAuthenticated,
  versionController.markAsRead
);
router.patch(
  "/notifications/read-all",
  isAuthenticated,
  versionController.markAllAsRead
);

module.exports = router;
