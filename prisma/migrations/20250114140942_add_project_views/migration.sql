-- CreateTable
CREATE TABLE "ProjectViews" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectViews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectViews_slug_key" ON "ProjectViews"("slug");
