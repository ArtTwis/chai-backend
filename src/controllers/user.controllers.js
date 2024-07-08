import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { isValidEmail } from "../utils/validate.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { cookiesOptions } from "../constants.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token!"
    );
  }
};

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

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist!");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file must required!");
  }

  const avatarURL = await uploadFileOnCloudinary(avatarLocalPath);

  if (!avatarURL) {
    throw new ApiError(400, "Avatar file must required!");
  }

  let coverImageLocalPath = null;
  let coverImageURL = null;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

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
    .json(new ApiResponse(201, createdUser, "User registered successfully.."));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email must required!");
  }

  if (email) {
    if (!isValidEmail(email)) {
      throw new ApiError(404, "Please provide valid email address!");
    }
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) throw new ApiError(404, "User doesn't exist!");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials!");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookiesOptions)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully.."
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from the document..
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse(200, {}, "User logout successfully.."));
});
