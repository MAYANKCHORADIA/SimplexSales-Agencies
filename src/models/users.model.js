import mongoose from 'mongoose';
import { Schema } from 'mongoose';


const userSchema = new Schema(
  {
    __id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    BusinessName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+91[6-9]\d{9}$/, 'Phone number must be a valid Indian mobile number with +91 country code'],
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    role : {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

export default User;


