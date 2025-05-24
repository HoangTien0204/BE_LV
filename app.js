const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');
const morgan=require('morgan');
const loaiCategoriRouter = require('./src/routers/categories');
const loaiProductsRouter = require('./src/routers/products');
const loaiBrandsRouter = require('./src/routers/brands');
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/categories',loaiCategoriRouter);
app.use('/products',loaiProductsRouter);
app.use('/brands',loaiBrandsRouter);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
