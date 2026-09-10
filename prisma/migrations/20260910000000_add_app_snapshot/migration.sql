-- CreateTable
CREATE TABLE "AppSnapshot" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSnapshot_pkey" PRIMARY KEY ("id")
);
