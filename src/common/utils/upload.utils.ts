import * as fs from 'fs';
import * as path from 'path';

export const initializeUploadDirectories = () => {
  const uploadDirs = [
    'uploads/policy-docs',
    'uploads/damage-photos',
    'uploads/signed-forms',
    'uploads/carrier-correspondence'
  ];

  uploadDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};