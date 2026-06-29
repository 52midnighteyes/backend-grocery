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

export const findUserByGoogleId = (googleId: string) => prisma.user.findUnique({ where: { googleId }, include: { role: true } });

export const createGoogleUser = (name: string, email: string, googleId: string, roleId: string, referralCode: string) => prisma.user.create({data: { name, email, googleId, roleId, referralCode, isVerified: true },include: { role: true },});

export const findReferralHistoryByReferredId = (referredId: string) =>
    prisma.referralHistory.findUnique({
        where: { referredId },
        include: { referrer: true },
    });

export const getOrCreateReferralTemplate = () =>
    prisma.voucher.upsert({
        where: { code: "REF-FREE-DELIVERY" },
        create: {
            name: "Referral Reward - Free Delivery",
            code: "REF-FREE-DELIVERY",
            quantity: 9999999,
            discountType: "percentage",
            voucherType: "delivery",
            value: 100,
            startDate: new Date("2020-01-01"),
            endDate: null,
        },
        update: {},
    });

export const createUserVoucher = (userId: string, voucherId: string, expiresAt: Date) =>
    prisma.userVoucher.create({ data: { userId, voucherId, expiresAt } });

export const findUserVouchers = (userId: string) =>
    prisma.userVoucher.findMany({
        where: {
            userId,
            isUsed: false,
            deletedAt: null,
            voucher: { deletedAt: null },
            OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
            ],
        },
        include: {
            voucher: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    discountType: true,
                    voucherType: true,
                    value: true,
                    minimumTransaction: true,
                    endDate: true,
                },
            },
        },
        orderBy: { expiresAt: "asc" },
    });
