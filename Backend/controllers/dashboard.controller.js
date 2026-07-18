import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStats = async (req, res, next) => {
  try {
    const user = req.user;

    const totalUsers = await prisma.user.count();

    res.json({
      status: "success",
      data: {
        totalUsers,
        currentUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();

    res.json({
      status: "success",
      data: {
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
