import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (err, req, _, next) => {
  try {
    let accessToken = req.cookies?.accessToken || req.header("Authorization");

    accessToken =
      typeof accessToken === "string" ? accessToken.replace("Bearer ", "") : "";

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request!");
    }

    const decodedTokenInfo = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedTokenInfo?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // TODO: discuss about FE...
      throw new ApiError(401, "Invalid access token!");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token!");
  }
});
