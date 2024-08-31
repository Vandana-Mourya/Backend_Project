import { Router } from 'express'
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeAVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const routes = Router()
routes.use(verifyToken)

routes.route('/create-playlist').post(createPlaylist)
routes.route('/get/user/playlist/:userId').get(getUserPlaylist)
routes.route('/get/playlist/:playlistId').get(getPlaylistById)
routes.route('/add/:playlistId/:videoIds').patch(addVideoToPlaylist)
routes.route('/remove/:playlistId/:videoIds').patch(removeAVideoFromPlaylist)
routes.route('/update-playlist/:playlistId').patch(updatePlaylist)
routes.route('/delete-playlist/:playlistId').delete(deletePlaylist)

export default routes