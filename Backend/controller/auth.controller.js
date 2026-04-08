import userModel from "../model/user.model.js";
import generateToken from "../utils/generateToken.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function buildAuthPayload(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}


export async function register(req, res) {
    try {
        const { name, email, password, role, location } = req.body;
        const isUserExist = await userModel.findOne({
            email
        });
        if (isUserExist) {
            return errorResponse(res, {
                statusCode: 400,
                message: "User with this email already exists",
            });
        }

        const safeRole = role === "provider" ? "provider" : "user";

        const user = await userModel.create({
            name,
            email,
            password,
            role: safeRole,
            location: location || "",
            isVerified: true,
        });

        const authPayload = buildAuthPayload(user);
        const token = generateToken(authPayload);

        return successResponse(res, {
            statusCode: 201,
            message: "User registered successfully",
            data: {
                token,
                user: authPayload,
            },
        });


    } catch (error) {
        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            if (duplicateField === "email") {
                return errorResponse(res, {
                    statusCode: 409,
                    message: "User with this email already exists",
                });
            }

            if (duplicateField === "username") {
                return errorResponse(res, {
                    statusCode: 409,
                    message: "Legacy username index conflict detected. Please retry registration.",
                });
            }

            return errorResponse(res, {
                statusCode: 409,
                message: "Duplicate value conflict",
            });
        }

        console.error("Error in user registration", error);
        return errorResponse(res, {
            statusCode: 500,
            message: "Internal Server Error",
            errors: error.message,
        });
    }
}


export async function login(req, res) {
    const {email , password} = req.body;
    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return errorResponse(res, {
                statusCode: 400,
                message: "Invalid email or password",
            });
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return errorResponse(res, {
                statusCode: 400,
                message: "Invalid email or password",
            });
        }

        if (!user.isVerified){
            return errorResponse(res, {
                statusCode: 400,
                message: "Email not verified. Please verify your email to login.",
            });
        }

        const authPayload = buildAuthPayload(user);
        const token = generateToken(authPayload);

        return successResponse(res, {
            message: "Login successful",
            data: {
                token,
                user: authPayload,
            },
        });
    } catch (error) {
        console.error("Error in user login", error);
        return errorResponse(res, {
            statusCode: 500,
            message: "Internal Server Error",
            errors: error.message,
        });
    }
}

export async function getMe(req, res){
    const userId = req.user.id;
    const user = await userModel.findById(userId).select("-password");
    if (!user){
        return errorResponse(res, {
            statusCode: 404,
            message: "User not found",
        });
    }

    return successResponse(res, {
        message: "User details fetched succesfully",
        data: {
            user,
        },
    });
}