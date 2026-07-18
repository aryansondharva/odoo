import { PrismaClient } from '@prisma/client'
import { hashPassword, comparePassword } from '../utils/password.utils.js'

const prisma = new PrismaClient()

export const getProfile = async (req, res, next) => {
  try {
    const user = req.user

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({
      status: 'success',
      data: userProfile,
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      avatar,
    } = req.body
    const user = req.user

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already in use',
          error: 'Validation Error',
        })
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({
      status: 'success',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = req.user

    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
    })

    const isValid = await comparePassword(oldPassword, userWithPassword.password)
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect',
        error: 'Validation Error',
      })
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    res.json({
      status: 'success',
      data: {
        message: 'Password changed successfully',
      },
    })
  } catch (error) {
    next(error)
  }
}
