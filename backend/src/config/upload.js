import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.join(__dirname, "../../uploads");

/**
 * Ensure upload directories exist
 */
const dirs = ["brands/logos", "brands/covers", "brands/documents", "creators/avatars"];
for (const dir of dirs) {
    const fullPath = path.join(UPLOAD_ROOT, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
}

/**
 * Create a multer storage engine for a given subfolder
 */
function createStorage(subfolder) {
    return multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, path.join(UPLOAD_ROOT, subfolder));
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${uniqueSuffix}${ext}`);
        },
    });
}

/**
 * File type filter — images only (jpg, jpeg, png, webp)
 */
function imageFilter(_req, file, cb) {
    const allowed = /\.(jpe?g|png|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    }
}

/**
 * File type filter — documents (pdf only)
 */
function documentFilter(_req, file, cb) {
    const allowed = /\.pdf$/i;
    if (allowed.test(path.extname(file.originalname))) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
}

/**
 * Multer instances for each upload type
 */
export const uploadLogo = multer({
    storage: createStorage("brands/logos"),
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

export const uploadCover = multer({
    storage: createStorage("brands/covers"),
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export const uploadDoc = multer({
    storage: createStorage("brands/documents"),
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const uploadAvatar = multer({
    storage: createStorage("creators/avatars"),
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

export default { uploadLogo, uploadCover, uploadDoc, uploadAvatar };
