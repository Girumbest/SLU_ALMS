-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "checkOutEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
