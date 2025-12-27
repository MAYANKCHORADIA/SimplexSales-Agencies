import { Router } from 'express';
import {
	changeCurrentPassword,
	forgotPasswordRequest,
	getCurrentUser,
	loginUser,
	loginAdmin,
	logoutUser,
	refreshAccessToken,
	registerUser,
	resendEmailVerification,
	resetForgotPassword,
	verifyEmail,
} from '../controllers/auth.controllers.js';
import { validate } from '../middleware/validator.middleware.js';
import {
	userChangeCurrentPasswordValidator,
	userForgotPasswordValidator,
	userLoginValidator,
	userRegisterValidator,
	userResetForgotPasswordValidator,
} from '../validator/index.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// unsecured routes
router.route('/register').post(userRegisterValidator(), validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, loginUser);
router.route('/admin/login').post(userLoginValidator(), validate, loginAdmin);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/refresh-token').post(refreshAccessToken);
router
	.route('/forgot-password')
	.post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
	.route('/reset-password/:resetToken')
	.post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// secure routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').post(verifyJWT, getCurrentUser);
router
	.route('/change-password')
	.post(
		verifyJWT,
		userChangeCurrentPasswordValidator(),
		validate,
		changeCurrentPassword,
	);
router
	.route('/resend-email-verification')
	.post(verifyJWT, resendEmailVerification);

export default router;

