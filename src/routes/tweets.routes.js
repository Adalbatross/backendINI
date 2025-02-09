import {Router} from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweets.controller.js";

import { verifyJWT} from "../middlewares/auth.middleware.js"
import { upload} from "../middlewares/multer.middleware.js"

const router = Router()
router.use(verifyJWT)

router
.route("/")
.post(upload.none(),createTweet)

router
.route("/user/:userId")
.get(getUserTweets)
router
.route("/tweetsId")
.patch(updateTweet)
.delete(deleteTweet)

export default router