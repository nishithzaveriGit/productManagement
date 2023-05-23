/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback} from 'react';
import axios from 'axios';
import { DateRangePicker,
    Button, ButtonToolbar, ButtonGroup, 
    Placeholder, Message, Loader } from 'rsuite';
import { format, parseISO } from "date-fns";

export const Product = () => {

    const [isLoading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [isEditMode, setEditMode] = useState(false);
    const [isAddProduct, setAddProduct] = useState(true);
    const [isProductForm, setProductForm] = useState(false);
    const [selectedItemToEdit, setSelectedItemToEdit] = useState([]);
    const [imgUpload, setImgUpload] = useState();
    const [dateRange, setDateRange] = useState([]);
    const [isSorted, setSorted] = useState(false);
    const [totalRecordsCount, setTotalRescordsCount] = useState(0);
    const [activePage, setActivePage] = useState(1);
    
    const RECORD_SIZE = 5;
    
    const getProducts = useCallback(async (query='') => {
        try{
            console.log('getProducts activePage', activePage);
            setLoading(true);
            let getAllProductResponse = await axios.get('http://localhost:5000/products', {
                params:{
                    page:query === 'delete'?1:activePage,
                    limit:RECORD_SIZE
                }
            });
            if(query === 'delete') setActivePage(1);
            setProducts(getAllProductResponse.data.products);
            setTotalRescordsCount(getAllProductResponse.data.totalRecords);
            setLoading(false);
        } catch(err){
            console.log('ERROR :: getProducts()', err);
        }
        
    },[activePage]);

    const createProduct = async (product) => {
        try{
            let createProductResponse = await axios.post('http://localhost:5000/products', product);
            if(createProductResponse.statusText === 'Created'){
                getProducts();
                setEditMode(false);
                setProductForm(false)
                setAddProduct(true);
                setSelectedItemToEdit([]);
            }
        } catch(err){
            console.log('ERROR :: createProduct()', err);
        }
    }

    const updateProductById = async (editedData, updatedProps) => {
        try{
            console.log('UPDATE PRODUCT',editedData, updatedProps);
            console.log('UPDATEPRODUCT 11111',updatedProps.get('productImage'), updatedProps.get('name'), updatedProps.get('price'));
            
            // let updateProductResponse = await axios.put(`http://localhost:5000/products/${editedData[0]._id}`, updatedProps); // mongoose
            let updateProductResponse = await axios.put(`http://localhost:5000/products/${editedData[0].p_id}`, updatedProps); // sql
    
            setSelectedItemToEdit(editedData);
            if(updateProductResponse.status === 200){
                getProducts();
                setEditMode(false);
                setSelectedItemToEdit([]);
            }
        } catch(err){
            console.log('ERROR :: updateProductById()', err);
        }
        
    }

    const editItem = (item) => {
        try{
            console.log('editItem',item);
            setEditMode(true);
            let tmpItemArr = [];
            tmpItemArr.push(item);
            setSelectedItemToEdit(tmpItemArr);
        } catch(err){
            console.log('ERROR :: editItem()', err);
        }
        
    }

    const deleteItem = async (item) => {
        try{
            console.log('======', item);
            if(item){
                let deleteProductResponse = await axios.delete(`http://localhost:5000/products/${item.p_id}`); // sql
                // let deleteProductResponse = await axios.delete(`http://localhost:5000/products/${item._id}`); // mongoose
                console.log('====DELETD promiseResolved==', deleteProductResponse, item._id);
                
                if(deleteProductResponse.status === 200){
                    getProducts('delete');
                }
            }
        } catch(err){
            console.log('ERROR :: deleteItem()', err);
        }
        
    }

    const onFileChange = (e) => {
        console.log('TTTTTT', e.target); // .files[0]
        setImgUpload(e.target.files[0]);
    }
    
    const onAddProduct = () =>{
        setAddProduct(false);
        setProductForm(true);
    }

    const onSubmit = (e) => {
        try{
            e.preventDefault();
            console.log('IS NEW FORM',isProductForm, isEditMode, selectedItemToEdit);
            let formArr = [];
            const formData = new FormData(e.currentTarget);
            for (let [key, value] of formData.entries()) {
                if(value !== ''){
                    formArr.push({
                        [key]:value,
                    });
                }
            }
    
            const editedData = selectedItemToEdit.map((obj, i) => ({ ...obj, ...formArr[i] }));
    
            let newProductObj = {};
            
            newProductObj = Object.assign({}, ...formArr);
            
            console.log('OnSubmit',isProductForm, editedData, imgUpload, newProductObj);
    
            if(!isProductForm)  {
                let updateProductFormData = new FormData();
                for (let [key, value] of formData.entries()) {
                    updateProductFormData.append(key, value);
                }
                
                updateProductById(editedData, updateProductFormData);
            } else {
                let newProductFormData = new FormData();
                for (let [ky, ve] of formData.entries()) {
                    newProductFormData.append(ky, ve);
                }
    
                createProduct(newProductFormData);
            }
        } catch(err){
            console.log('ERROR :: onSubmit()', err);
        }
    }

    const handleSelect = async (range) => {
        try{
            console.log('DATPICKER RANGE',range);
        const startDate = range && format(new Date(range[0]), 'dd/MM/yyyy');
        const endDate = range && format(new Date(range[1]), 'dd/MM/yyyy');
        console.log('DATPICKER RANGE START - ', startDate, ' - END',endDate);
        setDateRange([{startDt:startDate, endDt: endDate} ]);

        let getProductWithDateRange = await axios.get('http://localhost:5000/products', {
            params:{
                startDate:(range && format(new Date(range[0]), 'dd/MM/yyyy')),
                endDate:(range && format(new Date(range[1]), 'dd/MM/yyyy')),
                page:activePage,
                limit:RECORD_SIZE
            }
        });

        console.log('getProductWithDateRange',getProductWithDateRange.data);
        setProducts(getProductWithDateRange.data.products);
        setTotalRescordsCount(getProductWithDateRange.data.totalRecords);
        } catch(err){
            console.log('ERROR :: handleSelect()', err);
        }
    }

    const handleChange = async(e) => {
        try{
            let searchByProductName = await axios.get('http://localhost:5000/products', {
                params:{
                    searchByName:e.target.value.toLowerCase().toString(),
                    page:activePage,
                    limit:RECORD_SIZE
                }
            });
    
            console.log('searchByProductName',searchByProductName.data);
            setProducts(searchByProductName.data.products);
            // setActivePage(searchByProductName.data.pageCount)
            setTotalRescordsCount(searchByProductName.data.totalRecords);
        } catch(err){
            console.log('ERROR :: handleChange()', err);
        }
    }

    const sortBy = async (str) =>{
        try{
            let getProductListByAscDescOrder = await axios.get('http://localhost:5000/products', {
                params:{
                    sortby:str.toLowerCase().toString(),
                    page:activePage,
                    limit:RECORD_SIZE
                }
            });
    
            console.log('getProductListByAscDescOrder',getProductListByAscDescOrder.data);
            setProducts(getProductListByAscDescOrder.data.products);
            setTotalRescordsCount(getProductListByAscDescOrder.data.totalRecords);
        } catch(err){
            console.log('ERROR :: sortBy()', err);
        }
    }

    const createPagination = (total, limit) =>{
        try{
            console.log('createPagination total, limit,Math.ceil(total/limit)', total, limit,Math.ceil(total/limit));
            const numberOfPages = Math.ceil(total/limit);
            const pages = [];
            for (let p = 1; p <= numberOfPages; p++) {
                pages.push(p);
            }
            return pages;
        } catch(err){
            console.log('ERROR :: createPagination()', err);
        }
    }

    useEffect(() =>{
        console.log('DAYE RANGE EFFECT', dateRange, products);

        const filterRecordsByDateRange = () =>{
            try{
                const results1 = products?.filter(post => {
                    // const createdDt = format(new Date(post.createdAt), 'dd/MM/yyyy'); // mongoose
                    const createdDt = post.creationDate; // sql
                    console.log('createdDt.includes(dateRange.startDt)', createdDt.toString() , dateRange);
                    if((createdDt.toString() === dateRange[0]?.startDt)
                    || (createdDt.toString() === dateRange[0]?.endDt)){
                        console.log('DATE MATCHED EFFECT', post);
                        return post;
                    }
                    return null;
                });
                setProducts(results1);
                setDateRange([]);
                console.log('handleChangehandleChange results1 EFFECT', results1);
            } catch(err){
                console.log('ERROR :: filterRecordsByDateRange()', err);
            }
        }

        if(dateRange && dateRange.length > 0){
            filterRecordsByDateRange();
        }
    }, [dateRange, products]);

    useEffect(() =>{
        getProducts();
    },[getProducts])

    useEffect(() =>{
        console.log('EFFECT isSorted, products, isEditMode,isAddProduct', isSorted, products, isEditMode,isAddProduct);
        if(isSorted) setSorted(!isSorted);
    },[isSorted, products, isEditMode,isAddProduct])

  return (
    <div className='row' data-testid="product-1">
        {
            isLoading &&
            <div data-testid="loading-element">
                <Placeholder.Paragraph rows={20} />
                <Loader center content="loading" />
            </div>
        }
        {
            !isEditMode && isAddProduct && !isLoading &&
            <>
                <div className="row g-3 m-3">
                <div className="col-sm-3">
                <button type="button" onClick={onAddProduct} className="btn btn-primary">Add Product</button>
                </div>
                <div className="col-sm-3" style={{textAlign:'left'}}>
                    <DateRangePicker onChange={handleSelect} style={{display:'flex'}} />
                </div>
                <div className="col-sm-3">
                    <input type="search" 
                        className="form-control form-control-lg" 
                        name="txtSEarch"
                        id="txtSearch"
                        placeholder='Search by name'
                        onChange={handleChange}
                        style={{ marginTop:'-9px'}}
                    />
                </div>
                <div className="col-sm-3">
                    <div className="input-group">
                        <span className="input-group-text" id="basic-addon1">Sort By</span>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => sortBy('asc')}>Ascending</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => sortBy('desc')}>Descending</button>
                    </div>
                </div>
                </div>

                <div className='tblGrid container'>
                    <table className="table">
                        <thead>
                            <tr>
                            <th scope="col">Image</th>
                            <th scope="col">Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">CreatedAt</th>
                            <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody data-testid="product-list">
                            {
                                (products && products.length > 0) &&
                                products.map((p, i) => {
                                    return (
                                        <tr key={i} data-testid="product-item">
                                        <th scope="row" className='col-2'><img src={`http://localhost:5000/uploads/${p?.productImage}`} alt="test" /></th>
                                        <td className='col-2'>{p.name}</td>
                                        <td className='col-2'>{p.price}</td>
                                        {/* sql */}
                                        <td className='col-2'>{p.creationDate}</td> 
                                        {/* mongoose */}
                                        {/* <td className='col-2'>{`${format(new Date(p.createdAt), 'dd/MM/yyyy')}`}</td> */}
                                        <td className='col-2'>
                                        <ButtonGroup size="xs">
                                            <Button onClick={() => editItem(p)}>Edit</Button>
                                            <Button onClick={() => deleteItem(p)}>Delete</Button>
                                        </ButtonGroup>
                                        </td>
                                        </tr>
                                        )
                                })
                            }

                        </tbody>
                    </table>
                    {
                        (products && products.length === 0) &&
                        <Message showIcon type="info" header="Informational">
                            No data Found
                        </Message>
                    }

                    {
                        (products && products.length > 0) &&
                        <nav aria-label="Page navigation example">
                            <ul className="pagination">
                                {
                                    activePage !== 1 && (
                                    <li className="page-item">
                                        <a className="page-link" href="javascript:void(null)" onClick={() => setActivePage(activePage - 1)}>
                                            Previous
                                            </a>
                                    </li>
                                    )
                                }

                                {
                                    createPagination(totalRecordsCount, RECORD_SIZE).map((pgNumber) =>{
                                        return (
                                        <li className={`page-item ${pgNumber === activePage ? 'active':''}`} key={pgNumber} onClick={() => setActivePage(pgNumber)}>
                                            <a className="page-link" href="javascript:void(null)">{pgNumber}</a>
                                        </li>
                                        )
                                    })
                                }

                                {
                                    activePage !== parseInt(Math.ceil(totalRecordsCount/RECORD_SIZE)) && (
                                    <li className="page-item">
                                        <a className="page-link" href="javascript:void(null)" onClick={() => setActivePage(activePage + 1)}>
                                            Next
                                        </a>
                                    </li>
                                    )
                                }
                            </ul>
                        </nav>                        
                    }
                </div>
            </>
        }

        {
            ((isEditMode && selectedItemToEdit) || isProductForm) &&
            <div className='editForm col-sm-6' style={{margin:'50px auto'}}>
                <div className="card mb-3" style={{maxWidth: '540px'}}>
                    <div className="row g-0">
                        <div className="col-md-4">
                        {
                            selectedItemToEdit && selectedItemToEdit[0]?.productImage 
                            ? <img className='img-thumbnail img-fluid rounded-start'
                            src={`http://localhost:5000/uploads/${selectedItemToEdit[0]?.productImage}`} 
                            alt={`${selectedItemToEdit[0]?.productImage}`} />
                            : <Placeholder.Paragraph graph="image" />
                        }
                        </div>
                        <div className="col-md-8">
                            <div style={{display: 'flex !important',justifyContent: 'center',alignItems: 'center',marginTop: '76px'}}>
                                <h2 className="card-title 'mb-3">
                                    {
                                        selectedItemToEdit && selectedItemToEdit.length > 0
                                        ? 'Edit Product'
                                        : 'Add Product'
                                    }
                                    </h2>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={onSubmit} encType='multipart/form-data'>
                    <div className='form-floating mb-3'>
                        <input
                        className="form-control form-control-lg"
                        type="text"
                        placeholder={
                            (isEditMode && selectedItemToEdit)
                                ? selectedItemToEdit[0].name
                            : "product Name"
                        }
                        id="name" 
                        name="name"
                        defaultValue={
                            (isEditMode && selectedItemToEdit)
                                ? selectedItemToEdit[0].name
                            : ""
                        }
                        required
                        />
                        <label htmlFor="floatingName">Product Name</label>
                    </div>
                    <div className='form-floating mb-3'>
                        <input
                        className="form-control form-control-lg"
                        type="text"
                        placeholder={
                            isEditMode 
                                ? selectedItemToEdit[0].price
                                : "product Price"
                        }
                        id="price" 
                        name="price"
                        defaultValue={
                            isEditMode 
                                ? selectedItemToEdit[0].price
                                : ""
                        }
                        pattern="^[0-9]*[.,]?[0-9]*$"
                        required
                        />
                        <label htmlFor="floatingPrice">Price</label>
                    </div>
                    <div className='form-floating mb-3'>
                    <input
                        className="form-control form-control-lg"
                            type="file"
                            accept='images/*'
                            placeholder="upload image"
                            id="productImage" 
                            name="productImage"
                            onChange={onFileChange}
                            />
                    </div>
                    <ButtonToolbar>
                    <Button appearance="primary" type='submit' role='submit' active>Submit</Button>
                    <Button color="yellow" appearance="primary" onClick={() => {
                        setEditMode(false);
                        setAddProduct(true);
                        setProductForm(false);
                    }}>Cancle</Button>
                    </ButtonToolbar>
                    {
                        !isEditMode && 
                        <input type='hidden' id="createdDate" name="createdDate" value={`${format(new Date(), 'dd/MM/yyyy')}`}/>
                    }
                    {
                        isEditMode &&
                        <input type='hidden' id="updatedDate" name="updatedDate" value={`${format(new Date(), 'dd/MM/yyyy')}`}/>
                    }
                </form>
            </div>
        }
    </div>
  )
}
