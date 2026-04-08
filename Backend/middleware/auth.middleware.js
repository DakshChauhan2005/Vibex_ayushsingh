import jwt from "jsonwebtoken"
import { errorResponse } from "../utils/apiResponse.js";




export function authUser(req, res ,next){
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return errorResponse(res, {
            statusCode: 401,
            message: "Unauthorized. No token provided.",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        return next();

    } catch (error) {
        return errorResponse(res, {
            statusCode: 401,
            message: "Unauthorized. Invalid token.",
        });
    }

}