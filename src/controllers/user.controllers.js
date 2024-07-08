import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { isValidEmail } from "../utils/validate.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  if (!isValidEmail(email)) {
    throw new ApiError(404, "Please provide valid email address!");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist!");
  }

  console.log("req.files :>>", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file must required!");
  }

  const avatarURL = await uploadFileOnCloudinary(avatarLocalPath);

  if (!avatarURL) {
    throw new ApiError(400, "Avatar file must required!");
  }

  const coverImageURL = null;
  if (coverImageLocalPath) {
    coverImageURL = await uploadFileOnCloudinary(coverImageLocalPath);
  }

  const UserResponse = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    avatar: avatarURL.url,
    coverImage: coverImageURL?.url || "",
    password,
  });

  const createdUser = await User.findById(UserResponse._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering a User, Try Again!"
    );
  }

  return res
    .status(201)
    .json(ApiResponse(201, createdUser, "User registered successfully.."));
});
