import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router()
router.use(verifyToken)

router.route('/').get(healthcheck)

export default router