const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) =>{
  if(file.mimetype === 'image/jpeg' 
  || file.mimetype === 'image/png'
  || file.mimetype === 'image/jpg'){
    cb(null, true);
  } else {
    cb(null, false);
  }
   
}

const upload = multer({ 
    storage: storage,
    limits: {
         fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});
// const upload = multer({  dest:'uploads/' });

router.get('/', (req, res, next) => {
   Product.find()
   .select("name price _id productImage")
   .exec()
   .then(docs =>{
       const response = {
           count: docs.length,
           products: docs.map(doc => {
               return {
                   name: doc.name,
                   price: doc.price,
                   productImage: doc.productImage,
                   _id: doc._id,
                   request: {
                    type:'GET',
                    url: 'http://localhost:3000/products/' + doc._id
                   }
               }
           })
       }
       res.status(200).json(response);
   })
   .catch(err => {
       console.log(err);
       res.status(500).json({
           error: err
       });        
   });
});

router.post('/', checkAuth ,upload.single('productImage'), (req, res, next) => {
   
    // if(!req.file)
    // {
    //     res.send("File not found");
    //     return;
    // }
    
    console.log("req.file =",req.file);
    const product = new Product({
         _id: new mongoose.Types.ObjectId(),
         name: req.body.name,
         price: req.body.price,
         productImage: req.file.path
     });
     
     product.save()
     .then(result =>{
         console.log(result);
        res.status(201).json({
        message: 'Created post successfully...',
        createdProduct:  {
            name: result.name,
            price: result.price,
            _id: result._id,
            request: {
                type:'GET',
                url: 'http://localhost:3000/products/' + result._id
            }
        }
    });
     })
     .catch(err =>{
         console.log(err);
         res.status(500).json({
             error: err
         })
     });

});

router.get('/:productId', (req, res, next) => { 
    const id = req.params.productId;
    Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then(doc => {
        console.log("From Database ",doc);
        if(doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description:'Get all products',
                    url: 'http://localhost:3000/products/' + doc._id
                }
            });
        } else {
            res.status(404).json({
                message: "No valid entry found for provided id... "
            });
        }
        
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch('/:productId',checkAuth , (req, res, next) => { 
 const _id = req.params.productId;
 const updateOps = {};
 for(const ops of req.body){
    updateOps[ops.propName] = ops.value;
    updateOps[ops.propPrice] = ops.value2;
 }
 Product.update({_id:_id}, { $set: updateOps })
 .exec()
 .then(result => {
    //  console.log(result);
     res.status(200).json({
         message: "Product updated successfully...",
         request: {
             type: 'GET',
             url: 'http://localhost:3000/products/' + _id
         }
     });
 })
 .catch(err => {
     console.log(err);
     res.status(500).json({
         error: err
     });   
 });
});

router.delete('/:productId',checkAuth , (req, res, next) => { 
    const _id = req.params.productId;
    Product.remove({_id: _id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted successfully...',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products/',
                body: { name: 'String', price: 'Number' }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;