import { Router } from "express";
import { createComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import { verifyToken } from '../middlewares/auth.middleware.js'


const routes = Router()
routes.use(verifyToken)

routes.route('/:videoId').post(createComment)
routes.route('/get-comments/:videoId').get(getAllComments)
routes.route('/update-comment/:commentId').patch(updateComment)
routes.route('/delete-comment/:commentId').delete(deleteComment)

export default routes