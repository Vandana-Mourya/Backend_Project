import { Router } from "express";
import { createComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import { verifyToken } from '../middlewares/auth.middleware.js'


const router = Router()
router.use(verifyToken)

router.route('/:videoId').post(createComment)
router.route('/get-comments/:videoId').get(getAllComments)
router.route('/update-comment/:commentId').patch(updateComment)
router.route('/delete-comment/:commentId').delete(deleteComment)

export default router