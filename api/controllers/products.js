import mongoose from 'mongoose';
import productDb from '../models/product.js';
import connectMySql from '../../config/mySqlDb.js';

export const sqlQuery = (query) => {
    try{
        return new Promise((resolve, reject) => {
            connectMySql.query(query, (ex, rows) => {
              if (ex) {
                console.log('MYSQL query ERROR', ex);
                reject(ex);
              } else {
                // console.log('MYSQL query RESULT', rows);
                resolve(rows);
              }
            });
        });
    } catch (err){
        console.log('Error :: in sqlQuery()', err);
        res.status(500).json(
            {error: err}
        )
    }
    
}

export const products_get_all = async (req, res, next) => {
    try{
        console.log('products_get_all REQ QUERY', req.query);

        const {page, limit, sortby, startDate, endDate, searchByName} = req.query;
        console.log('LLLLLLLLLL', +page, +limit, sortby, startDate, endDate, searchByName);
        
        let sortBy = null;
        let responseMessage = '';
        let orderByAsc = null;
        let orderByDesc = null;
    
        const select_total_records = 'SELECT * FROM products';//'SELECT count(*) as count FROM products';
        const totalPagesData = await sqlQuery(select_total_records);
        const totalRecords = totalPagesData.length;
        const totalPages = Math.ceil(totalRecords / limit);
        const offset = page? +page:1;
        const startLimit = (offset - 1) * limit;

        const select_string = `SELECT * FROM products LIMIT ${startLimit}, ${limit}`; // ${+page, +limit}
        let dataPageWise = await sqlQuery(select_string);
        console.log('================', dataPageWise);
    

        if(sortby && sortby === 'asc'){
            sortBy = `SELECT * FROM products ORDER BY name ASC LIMIT ${startLimit}, ${limit}`; // ${page, limit}
            orderByAsc = await sqlQuery(sortBy);
            dataPageWise = orderByAsc;
        } else if(sortby && sortby === 'desc'){
            sortBy = `SELECT * FROM products ORDER BY name DESC LIMIT ${startLimit}, ${limit}`;
            orderByDesc = await sqlQuery(sortBy);
            dataPageWise = orderByDesc;
        }

        if(startDate && endDate){
            const select_by_date_range = `
            SELECT * FROM products WHERE creationDate >= '${startDate}' AND creationDate <= '${endDate}' LIMIT ${startLimit}, ${limit}
            `;

            // const select_by_date_range = `
            // SELECT * FROM products WHERE creationDate BETWEEN '17/05/2023' AND '19/05/2023' LIMIT ${page, limit}
            // `;
            const dataDateRangeWise = await sqlQuery(select_by_date_range);
            console.log('KKKKKKKKKK', dataDateRangeWise);
            dataPageWise = dataDateRangeWise;
        }

        if(searchByName && searchByName !== ''){
            const select_by_product_name = `SELECT * FROM products WHERE name REGEXP '${searchByName}'`;
            const searchByProductName = await sqlQuery(select_by_product_name);
            console.log('JJJJJJJJJJ', searchByProductName);
            dataPageWise = searchByProductName;
        }

        if(dataPageWise && dataPageWise.length === 0){
            responseMessage = 'No data found'
        } else if(sortby) {
            responseMessage = `Data sorted in ${sortby} order`;
        } else if(startDate && endDate) {
            responseMessage = `Data between ${startDate} and ${endDate} date range`;
        } else if(searchByName && searchByName !== '') {
            responseMessage = `Data search by ${searchByName} string`;
        }

        const getAllProductsResponse = {
            count: totalPagesData[0].count,
            products: dataPageWise,
            totalRecords, // totalPagesData[0].count,
            totalPages,
            pageCount:+page,
            pageSize:+limit,
            message:responseMessage
        }

        res.status(200).json(getAllProductsResponse);

        
    } catch(err){
        console.log('ERROR :: products_get_all', err);
        res.status(500).json(
            {error: err}
        )
    }
       
}

export const products_get_all_mongoose = async (req, res, next) => {

    let sortBy = null;
    let searchTxt = '';
    let findQuery = null;
    let responseMessage = '';

    const pageCount = (req.query?.page) ? parseInt(req.query.page):1;
    let pageSize = (req.query.limit) ? parseInt(req.query.limit):10;
    let pageSkip = (pageCount - 1) * pageSize; // for pagination
    let totalRecords = await productDb.countDocuments(); // get total number of records

    if(req.query.sortby === 'asc'){
        sortBy = 1;
    } else if(req.query.sortby === 'desc'){
        sortBy = -1;
    }

    if(req.query?.searchByName){
        searchTxt = req.query.searchByName;
        pageSize=0;
        pageSkip=0;
        findQuery = {name: {$regex:searchTxt, $options:'i'}};
    }

    if(req.query.startDate && req.query.endDate){
        findQuery = {
            creationDate: {
                $gte: req.query.startDate,
                $lte: req.query.endDate,
            },
            }
    }
    
    productDb
    .find(findQuery)
    .skip(pageSkip)
    .limit(pageSize)
    .sort({createdAt: sortBy })
    .select('name price _id createdAt updatedAt productImage')
    .exec()
    .then( (docs) =>{
        console.log('SAVE TO DB', docs);

        if(docs && docs.length === 0){
            responseMessage = 'No data found'
        } else {
            responseMessage = (req.query.sortby) ?`Data sorted in ${req.query.sortby} order`:''
        }

        let getAllProductsResponse = {
            count: docs.length,
            products: docs,
            totalRecords,
            pageCount,
            pageSize,
            message:responseMessage
        }

        res.status(200).json(getAllProductsResponse);
}).catch((err =>{
    res.status(500).json({error:err});
})) 
}

export const product_create_product = async (req, res, next) =>{
    try{
        console.log('Image FIle', req.file);

        const nameField = req.body.name;
        const priceField = req.body.price;
        const ImgField = req.file !== undefined ? req.file.filename : null
        const createDtField = req.body.createdDate !== ''?req.body.createdDate:null
        const updateDtField = req.body.updatedDate !== undefined?req.body.updatedDate:null

        const insert_new_records = `
        INSERT INTO products(name, price, productImage, creationDate, updateDate)
        VALUES ('${nameField}', ${priceField}, '${ImgField}', '${createDtField}', ${updateDtField})
        `;
        const addProduct = await sqlQuery(insert_new_records);

        console.log('product_create_product', addProduct);

        res.status(201).json(
            {message: 'New product added successfully', createdProduct: addProduct}
        )
    }catch(err){
        console.log('ERROR :: product_create_product', err);
        res.status(500).json(
            {error: err}
        )
    }
}

export const product_create_product_mongoose = (req, res, next) =>{
    console.log('Image FIle', req.file);
        const product = new productDb({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price: req.body.price,
        // productImage:req.file.name
        productImage:req.file.filename,
        // productImage:req.file.path
        creationDate:req.body.createdDate,
        updateDate:req.body.updatedDate
    });


    product
    .save()
    .then( (result) =>{
        // console.log('SAVE TO DB', result);
        res.status(201).json(
            {message: 'Handling PODT request for products', createdProduct: result}
        )
    })
    .catch((err) =>{
        console.log('SAVE TO DB ERR', err);
        res.status(500).json(
            {error: err}
        )
    });
}

export const product_get_single_product = (req, res, next) =>{
    const id = req.params.productId;
    productDb.findById(id)
    .select('name price _id productImage')
    .exec()
    .then( (doc) =>{
        console.log('FROM DB', id, doc);
            res.status(200).json(doc);
    })
    .catch((err) =>{
        console.log('SAVE TO DB ERR', err);
        res.status(500).json({error:err})
    });
}

export const product_update_product = async (req, res, next) =>{
    try{
        const id = req.params.productId;
        // console.log('product_update_product111', id,'\n',req.body, '\n',req.file);
        const checkId = `SELECT * FROM products WHERE p_id = ${id}`;
        const checkIdExist = await sqlQuery(checkId); // await productDb.findById(id)
        console.log('product_update_checkIdExist', id, checkIdExist);

        if(!checkIdExist){
            return res.status(404).json(
                {message: 'No record found'}
            );
        }

        const updateProduct = new productDb({
            name:(req.body?.name !== '')? req.body?.name:checkIdExist.name,
            price: (req.body?.price !== '')?req.body?.price:checkIdExist.price,
            productImage:
            ((req.body?.productImage !== null || req.body?.productImage !== undefined) && req.file !== undefined)
            ? req.file.filename
            :checkIdExist.productImage,
            updateDate:req.body?.updateDate
        });

        const update_records = `
        UPDATE products SET name = '${updateProduct.name}', price = ${updateProduct.price},
        productImage = '${updateProduct.productImage}', updateDate = '${updateProduct.updateDate}'
        WHERE p_id = ${id}
        `;
        const productUpdate = await sqlQuery(update_records);
        console.log('UPDATEUPDATEUPDATE', productUpdate);

        res.status(200).json({message: 'Product updated!', productUpdate});
    } catch(err){
        console.log('ERROR :: product_update_product', err);
        res.status(500).json(
            {error: err}
        )
    }
}

export const product_update_product_mongoose = async (req, res, next) =>{
    const id = req.params.productId;

    console.log('product_update_product111', id,'\n',req.body, '\n',req.file);
    const checkIdExist = await productDb.findById(id)

    console.log('product_update_checkIdExist', checkIdExist);
    if(!checkIdExist){
        return res.status(404).json(
            {message: 'No record found'}
        );
    }

    const updateProduct = new productDb({
        name:(req.body?.name !== '')? req.body?.name:checkIdExist.name,
        price: (req.body?.price !== '')?req.body?.price:checkIdExist.price,
        productImage:
        ((req.body?.productImage !== null || req.body?.productImage !== undefined) && req.file !== undefined)
        ? req.file.filename
        :checkIdExist.productImage
        // productImage:req.file.name
        // productImage:url + '/public/' + req.file.name
        // productImage:req.file.path
    });

    console.log('product_update_product updateProduct', updateProduct);
    
    // const updateOps = {};
    // for(const ops of req.body){
    //     console.log('product_update_product2222', ops.value, typeof ops.value);
    //     console.log('product_update_product3333333', ops.propName);
    //     updateOps[ops.propName] = ops.value;
        
    // }
    // console.log('product_update_product444444', updateOps, req.body[0]);
    // productDb.updateOne({ _id:id}, {$set:updateOps})
    productDb.updateOne({ _id:id}, {$set:updateProduct})
    .exec()
    .then((result) => {
        res.status(200).json({message: 'Product updated!', result});
    }).catch((err) => {
        res.status(500).json({error:err});
    });
}

export const product_delete_product = async (req, res, next) =>{
    try{

        const id = req.params.productId;

        const delete_records = `
        DELETE FROM products WHERE p_id = ${id}
        `;
        const productDelete= await sqlQuery(delete_records);
        console.log('DELEDELELEDLELELDLE', productDelete);

        res.status(200).json({message: 'Product deleted!', productDelete});

    } catch(err){
        console.log('ERROR :: product_delete_product', err);
        res.status(500).json(
            {error: err}
        )
    }
}

export const product_delete_product_mongoose = (req, res, next) =>{
    const id = req.params.productId;
    productDb.deleteOne({ _id:id})
    .exec()
    .then((result) => {
        res.status(200).json(result);
    }).catch((err) => {
        res.status(500).json({error:err});
    })
}