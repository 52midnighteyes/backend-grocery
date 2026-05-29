import { prisma } from "../../libs/prisma/prisma.lib.js";

export const findUserByEmail = (email:string) => prisma.user.findUnique({where: {email}});

export const findUserById = (id:string) => prisma.user.findUnique({where: {id}, include: {role:true}});

export const findUserByReferralCode = (referralCode: string) => prisma.user.findUnique({where: {referralCode}});

export const findRoleByName = (name: string) => prisma.role.findFirst({where: {name}});

export const createUser = (name: string, email:string, roleId:string) => prisma.user.create({data: {name, email, roleId}});

export const updateUser = (id:string, data:Record<string, unknown>) => prisma.user.update({where: {id}, data});

export const createReferralHistory = (referrerId:string, referredId:string) => prisma.referralHistory.create({data: {referrerId, referredId}});

export const createRegisterToken = (token:string, expiresAt:Date) => prisma.registerToken.create({data: {token, expiresAt}});

export const findRegisterToken = (token:string) => prisma.registerToken.findFirst({where: {token, deletedAt: null}});

export const invalidateRegisterToken = (id:string) => prisma.registerToken.update({where: {id}, data:{deletedAt: new Date()}});

export const createForgotPasswordToken = (token:string, email:string, expiresAt:Date) => prisma.forgotPassword.create({data: {token, email, expiresAt}});

export const findForgotPasswordToken = (token:string) => prisma.forgotPassword.findFirst({where: {token, deletedAt:null}});

export const invalidateForgotPasswordToken = (id:string) => prisma.forgotPassword.update({where: {id}, data: {deletedAt: new Date()}});

export const findUserByEmailWithRole = (email: string) => prisma.user.findUnique({ where: { email }, include: { role: true } });
