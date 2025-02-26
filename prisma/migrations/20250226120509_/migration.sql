/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('WORKING', 'BREAK', 'MEETING', 'VACATION', 'SICK_LEAVE', 'REMOTE');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('INTERN', 'JUNIOR', 'MIDDLE', 'MIDDLE_PLUS', 'SENIOR');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'ADMIN_DEPARTMENT', 'ADMIN', 'CEO');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ATTESTATION', 'PRESENTATION', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- DropTable
DROP TABLE "Example";

-- CreateTable
CREATE TABLE "users" (
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "telegram" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "avatar" TEXT,
    "patronymic" TEXT,
    "password" TEXT NOT NULL,
    "dateBirth" TIMESTAMP(3),
    "education" TEXT,
    "courses" TEXT,
    "dateStart" TIMESTAMP(3),
    "departmentId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "post" TEXT,
    "grade" "Grade",
    "gender" TEXT,
    "dateAttestation" TIMESTAMP(3),
    "timeZone" TEXT,
    "role" "Role",
    "statusOnboarding" TEXT,
    "isActive" BOOLEAN,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_statuses" (
    "uuid" TEXT NOT NULL,
    "userUUID" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'WORKING',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),

    CONSTRAINT "user_statuses_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "certificates" (
    "uuid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "departments" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headUUID" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_competences" (
    "uuid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "competenceId" TEXT,
    "level" INTEGER,
    "score" INTEGER,
    "isEndorsements" BOOLEAN,

    CONSTRAINT "user_competences_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "competences" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,

    CONSTRAINT "competences_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "events" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'ATTESTATION',
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "link" TEXT,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "user_departments" (
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "eventId" TEXT,

    CONSTRAINT "user_departments_pkey" PRIMARY KEY ("userId","departmentId")
);

-- CreateTable
CREATE TABLE "_UserEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_key" ON "users"("telegram");

-- CreateIndex
CREATE UNIQUE INDEX "users_statusId_key" ON "users"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "user_statuses_uuid_key" ON "user_statuses"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_statuses_userUUID_key" ON "user_statuses"("userUUID");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_uuid_key" ON "certificates"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "departments_uuid_key" ON "departments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_competences_uuid_key" ON "user_competences"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_competences_userId_key" ON "user_competences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "competences_uuid_key" ON "competences"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "competences_departmentId_key" ON "competences"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "events_uuid_key" ON "events"("uuid");

-- CreateIndex
CREATE INDEX "_UserEvents_B_index" ON "_UserEvents"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_statuses" ADD CONSTRAINT "user_statuses_userUUID_fkey" FOREIGN KEY ("userUUID") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_competences" ADD CONSTRAINT "user_competences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_competences" ADD CONSTRAINT "user_competences_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "competences"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competences" ADD CONSTRAINT "competences_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEvents" ADD CONSTRAINT "_UserEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "events"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEvents" ADD CONSTRAINT "_UserEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
