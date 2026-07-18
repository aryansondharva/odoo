import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/password.utils.js";
import { sendPasswordResetEmail } from "../utils/email.utils.js";

const prisma = new PrismaClient();
const resetSecret = () => process.env.JWT_RESET_SECRET || process.env.JWT_SECRET;

const createResetToken = (user) => jwt.sign(
  { userId: user.id, email: user.email, passwordHash: user.password, purpose: "password-reset" },
  resetSecret(),
  { expiresIn: "1h" },
);

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = createResetToken(user);
      try { await sendPasswordResetEmail(user.email, user.name, token); }
      catch (error) { console.error("Unable to send password reset email", error); }
    }
    res.json({ status: "success", message: "If the email exists, a password reset link has been sent." });
  } catch (error) { next(error); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, resetSecret());
    if (decoded.purpose !== "password-reset") throw Object.assign(new Error("Invalid reset token"), { statusCode: 400 });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: decoded.userId } });
    if (user.email !== decoded.email || user.password !== decoded.passwordHash) throw Object.assign(new Error("Reset token has already been used"), { statusCode: 400 });
    await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(newPassword) } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    res.json({ status: "success", message: "Password has been reset successfully" });
  } catch (error) { next(error); }
};
