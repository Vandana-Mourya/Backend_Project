import { Router } from "express";
import { createComment } from "../controllers/comment.controller.js";
import { verifyToken } from '../middlewares/auth.middleware.js'


const routes = Router()
routes.use(verifyToken)

routes.route('/:videoId').post(createComment)

export default routes