-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_boards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "background_img" TEXT,
    "font_family" TEXT,
    "background_color" TEXT,
    "title_color" TEXT,
    "open_date" DATETIME,
    "bg_music" TEXT,
    "post_colors" TEXT,
    "background_video" TEXT,
    "bg_music_extension" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_boards" ("background_color", "background_img", "background_video", "bg_music", "bg_music_extension", "created_at", "font_family", "id", "open_date", "post_colors", "title", "title_color", "type", "updated_at") SELECT "background_color", "background_img", "background_video", "bg_music", "bg_music_extension", "created_at", "font_family", "id", "open_date", "post_colors", "title", "title_color", "type", "updated_at" FROM "boards";
DROP TABLE "boards";
ALTER TABLE "new_boards" RENAME TO "boards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
