-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "placement" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "style" TEXT,
    "preferredDates" TEXT,
    "budget" TEXT,
    "references" TEXT,
    "uploads" JSONB,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deposit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "email" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "mode" TEXT,
    "metadata" JSONB,
    "bookingId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deposit_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Deposit" ("amount", "createdAt", "currency", "email", "id", "metadata", "mode", "paymentStatus", "sessionId") SELECT "amount", "createdAt", "currency", "email", "id", "metadata", "mode", "paymentStatus", "sessionId" FROM "Deposit";
DROP TABLE "Deposit";
ALTER TABLE "new_Deposit" RENAME TO "Deposit";
CREATE UNIQUE INDEX "Deposit_sessionId_key" ON "Deposit"("sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
