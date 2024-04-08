import { diskStorage } from 'multer';
import { extname } from 'path';

const getDestination = (req, file, cb) => {
  let destination;
  console.log(file.fieldname, "file.fieldname");
  // Your logic to determine the destination folder based on req, file, etc.
  // For example, you can use different folders for different types of files or users
  if (file.fieldname === 'profileImage') {
    destination = './uploads/user';
  } else {
    destination = './uploads';
  }
  cb(null, destination);
};


// Define the destination folder and file naming logic
const storage = diskStorage({
  destination: getDestination,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExtension}`);
  },
});

// Define the file filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure the multer instance
export const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (adjust as needed)
  },
};
