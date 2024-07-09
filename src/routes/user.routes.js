import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  reGenerateAccessToken,
  registerUser,
  updateAccountDetials,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

/*
================
UnSecured Routes
================
*/

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

/*
================
=Secured Routes=
================
*/

router.route("/logout").post(verifyJwtToken, logoutUser);

router.route("/refresh-token").post(reGenerateAccessToken);

router.route("/change-password").post(verifyJwtToken, changeCurrentPassword);

router.route("/user").get(verifyJwtToken, getCurrentUser);

router.route("/user").patch(verifyJwtToken, updateAccountDetials);

router
  .route("/avatar")
  .patch(verifyJwtToken, upload.single("avatar"), updateUserAvatar);

router
  .route("/coverImage")
  .patch(verifyJwtToken, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:username").get(verifyJwtToken, getUserChannelProfile);

router.route("/watchHistory").get(verifyJwtToken, getWatchHistory);

/*
================
==Export router=
================
*/

export default router;
