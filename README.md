# Auth Boilerplate Backend

Backend boilerplate sederhana untuk mulai project baru dengan stack TypeScript, Express, Prisma, dan PostgreSQL.

Project ini sudah dibersihin dari domain aplikasi lama dan sekarang fokus ke fondasi auth saja. Setup package tetap dipertahankan, middleware inti tetap ada, Nodemailer Gmail tetap aktif, dan setup Cloudinary masih tersedia kalau nanti mau dipakai lagi.

## Isi Project Sekarang

- auth register
- login
- refresh token via cookie
- logout
- verify account via email
- forgot password
- reset password via token
- update password untuk user login
- request validation dengan Zod
- centralized error handler
- JWT bearer token middleware
- role guard middleware
- multer image middleware
- setup Cloudinary

## Stack

- TypeScript
- Express 5
- Prisma
- PostgreSQL
- Neon Prisma Adapter
- Zod
- JWT
- Argon2
- Nodemailer
- Cloudinary
- Multer

## Endpoint Aktif

Base route auth:

```txt
/api/auth
```

Daftar endpoint:

- `GET /`
- `GET /api/auth/token/:token`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `POST /api/auth/verify/:token`
- `POST /api/auth/update-password`
- `POST /api/auth/request-forgot-password`
- `POST /api/auth/forgot-password/:token`
- `POST /api/auth/resend-verification-email`

## Auth Notes

- access token dikirim sebagai bearer token
- refresh token disimpan di cookie `httpOnly`
- frontend harus kirim `credentials: "include"` untuk endpoint refresh token dan logout
- password di-hash pakai Argon2 + pepper
- refresh token dan reset token di-hash sebelum disimpan ke database
- email verification dan forgot password memakai template Handlebars

Contoh refresh token request:

```ts
fetch("http://localhost:8080/api/auth/refresh-token", {
  method: "POST",
  credentials: "include",
});
```

## Database Model

Schema Prisma sekarang sengaja disederhanakan jadi model minimum:

- `User`
- `RefreshToken`
- `PasswordResetToken`

Kalau nanti mau mulai fitur baru, schema ini bisa kamu kembangin dari base ini.

## Environment Variables

File contoh env ada di [`.env.example`](./.env.example).

Variabel yang dipakai saat ini:

```env
DATABASE_URL=
DATABASE_DIRECT_URL=
PORT=8080
JWT_SECRET=
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
REFRESH_TOKEN_SECRET=
NODEMAILER_EMAIL=
NODEMAILER_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=
VERIFY_TOKEN_SECRET=
RESET_TOKEN_SECRET=
PEPPER=
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run check`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`

## Cara Jalanin

1. Install dependency:

```bash
npm install
```

2. Copy env dari example lalu isi value yang dibutuhkan.

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Jalankan migration:

```bash
npm run prisma:migrate
```

5. Start development server:

```bash
npm run dev
```

## Struktur Folder

```txt
src/
  app.ts
  server.ts
  class/
  config/
  constant/
  helper/
  libs/
    cloudinary/
    mailer/
    prisma/
  middlewares/
    tokenVerification/
  models/
  modules/
    auth/
    user/
  templates/
    emails/
prisma/
  schema.prisma
  migrations/
```

## Catatan

- `package.json` dan setup package sengaja tidak diubah.
- `.env` asli tidak disentuh.
- Cloudinary setup masih ada, walaupun belum dipakai endpoint mana pun.
- Kalau Prisma schema berubah, jalankan `npm run prisma:generate` lagi.
