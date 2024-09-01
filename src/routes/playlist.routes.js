import { Router } from 'express'
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeAVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = Router()
router.use(verifyToken)

router.route('/create-playlist').post(createPlaylist)
router.route('/get/user/playlist/:userId').get(getUserPlaylist)
router.route('/get/playlist/:playlistId').get(getPlaylistById)
router.route('/add/:playlistId/:videoIds').patch(addVideoToPlaylist)
router.route('/remove/:playlistId/:videoIds').patch(removeAVideoFromPlaylist)
router.route('/update-playlist/:playlistId').patch(updatePlaylist)
router.route('/delete-playlist/:playlistId').delete(deletePlaylist)

export default router