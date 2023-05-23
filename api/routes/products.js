import express from 'express';
import path from 'path';
import multer from 'multer';
import { products_get_all, 
    product_create_product,
    product_get_single_product,
    product_update_product,
    product_delete_product,
    products_get_all_mongoose,
    product_create_product_mongoose,
    product_update_product_mongoose,
    product_delete_product_mongoose} from '../controllers/products.js';


const router = express.Router();

const multerStorage = multer.diskStorage({
    destination: (req, file,cb) => {
      console.log('DESTINATION', cb, path, process.cwd());
      cb(null,'uploads/');
    },
    filename: (req, file,cb) => {
        console.log('FILENAME', file.originalname);
        // cb(null, new Date().toISOString() + file.originalname)
        // cb(null, Date.now() + file.originalname)
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
        // cb(null, Date.now() + file.originalname);
    }
});

  const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xls)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format.'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }

const upload = multer({storage: multerStorage, limits : {fileSize : 1024 * 1024 * 5}, fileFilter: fileFilter});


// POINTING TO SQL DB
router.get('/', products_get_all);

router.post('/', upload.single('productImage'), product_create_product);

// router.get('/:productId', product_get_single_product);

router.put('/:productId', upload.single('productImage'), product_update_product);

router.delete('/:productId', product_delete_product);

// POINTING TO MONGODB
// router.get('/', products_get_all_mongoose);

// router.post('/', upload.single('productImage'), product_create_product_mongoose);

// // router.get('/:productId', product_get_single_product);

// router.put('/:productId', upload.single('productImage'), product_update_product_mongoose);

// router.delete('/:productId', product_delete_product_mongoose);

export default router;