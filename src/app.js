import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import ApiResponse from "./utils/ApiResponse.js";

const app = express();

/*==============
==Middlewares==
==============*/
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: "",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

// express.urlencoded is used to encode url, extended property is used to encode url in depth or nested level
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());

//  Handle invalid request
app.use((req, res) => {
  // Invalid request
  res.status(404).json(
    new ApiResponse(
      404,
      {
        success: false,
        message:
          "Uh-oh! It seems you've wandered off course. Let's steer you back to safety",
      },
      "Uh-oh! It seems you've wandered off course. Let's steer you back to safety"
    )
  );
});

/*==============
==Import Routes==
==============*/
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";

/*==============
Routes Decelaration
==============*/
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/videos", videoRouter);

export default app;
