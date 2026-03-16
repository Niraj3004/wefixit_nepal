import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model";
import { verifyToken } from "../utils/jwt";
import { ROLES } from "../constants/role";
import { MESSAGES } from "../constants/messages";

// Derive RoleType from the ROLES constant values
type RoleType = (typeof ROLES)[keyof typeof ROLES];

export interface IExtendRequest extends Request {
  user?: IUser;
}

class AuthMiddleware {
  static async isAuthenticated(
    req: IExtendRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      // Check if the Authorization header exists and has the Bearer prefix
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: MESSAGES.TOKEN_NOT_PROVIDED,
        });
        return;
      }

      // Strip "Bearer " prefix to get the raw token
      const token = authHeader.split(" ")[1]!;

      // Verify Token
      const decoded = verifyToken(token);

      if (!decoded || typeof decoded === "string" || !decoded.id) {
        res.status(403).json({
          success: false,
          message: MESSAGES.INVALID_OR_EXPIRED_TOKEN,
        });
        return;
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: MESSAGES.USER_NOT_FOUND,
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static restrictTo(...allowedRoles: RoleType[]) {
    return (req: IExtendRequest, res: Response, next: NextFunction) => {
      const userRole = req.user?.role as RoleType;
      console.log("User Role:", userRole);

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
        });
        return;
      }

      next();
    };
  }
}

export default AuthMiddleware;
