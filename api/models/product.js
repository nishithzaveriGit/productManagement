import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    price: {type: Number, required: true},
    productImage:{type: String, required: true},
    creationDate:{type: String},
    updateDate:{type: String}
},
{
    timestamps:true
});

const productDb = mongoose.model('Product', productSchema, 'Product');

export default productDb;