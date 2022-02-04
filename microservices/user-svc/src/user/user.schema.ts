/* eslint-disable @typescript-eslint/no-unused-vars */
import * as mongoose from "mongoose";
import { UnauthorizedException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { User } from "./user.interface";
import * as validator from "validator";
import { Role } from "src/guards/role.enum";
import { HttpStatus } from "@nestjs/common";
import { ResponseHandlerService } from "src/helper/response-handler.service";
const responseHandlerService = new ResponseHandlerService();

export const UserSchema = new mongoose.Schema<User>(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Role,
      default: Role.User,
    },
    status: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (!user.password) {
    next();
  }
  // Make sure not to rehash pwd if already hashed
  if (!user.isModified("password")) return next();

  // Generate a salt and use it to hash the user
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.checkPassword = async function (attempt) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMatch = false;

  try {
    const isMatch = await bcrypt.compare(attempt, user.password);
    return isMatch;
  } catch (e) {
    await responseHandlerService.response(
      "Unauthorized",
      HttpStatus.UNAUTHORIZED,
      null
    );
  }
};
