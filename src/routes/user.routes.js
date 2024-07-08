import { Router } from "express";
import {
  loginUser,
  logoutUser,
  reGenerateAccessToken,
  registerUser,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwtToken } from "../middlewares/auth.middleware.js";

const router = Router();

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

export default router;
