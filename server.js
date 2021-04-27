/* eslint-disable quotes */
'use strict';

const express = require( 'express' );
const pg = require( 'pg' );
const cors = require( 'cors' );
const superagent = require( 'superagent' );
const methodOverride = require( 'method-override' );

const app = express();
require( 'dotenv' ).config();
app.use( cors() );
app.use( express.urlencoded( { extended: true } ) );
app.use( methodOverride( '_method' ) );
app.use( express.static( './public' ) );
app.set( 'view engine', 'ejs' );
// const client = new pg.Client( process.env.DATABASE_URL );
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
// const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );


const PORT = process.env.PORT || 2000;
client.connect()
  .then( ()=>{

    app.listen( PORT, ()=>{
      console.log( `listening on PORT ${PORT}` );
    } );
  } );

app.get( '/', ( req,res )=>{
  res.render( 'index' );
} );

app.post( '/productbyprice', ( req,res )=>{
  let minPrice = req.body.minprice;
  let maxPrice = req.body.maxprice;
  let URL = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline&price_greater_than=${minPrice}&price_less_than=${maxPrice}`;

  superagent.get( URL )
    .then( results =>{
      // res.send(results.body)
      let productsArr = results.body.map( val=>{
        return new Product( val );
      } );
      res.render( 'productsbyprice', {results : productsArr} );
    } );

} );

function Product( data ){
  this.name = data.name;
  this.price = data.price;
  this.image = data.image_link;
  this.description = data.description;
}

app.get( '/allproducts', ( req,res )=>{
  let URL = 'http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline';
  superagent.get( URL )
    .then( results=>{
      let productsArr = results.body.map( val=>{
        return new Product( val );
      } );
      res.render( 'allproducts', {results : productsArr} );
    } );
} );


app.post( '/saveselection', ( req,res )=>{
  let {name,image,price,description} = req.body;
  let SQL = 'INSERT INTO maybellinep (name,image,price,description) VALUES ($1,$2,$3,$4) RETURNING *;';
  let safeValues = [name,image,price,description];
  client.query( SQL,safeValues )
    .then( results=>{
      // res.send( results.rows );
      let productsArr = results.body.map( val=>{
        return new Product( val );
      } );
      res.redirect( '/mycard' );
    } );
} );

app.get( '/mycard', ( req,res )=>{
  let SQL = 'SELECT * FROM maybellinep;';
  client.query( SQL )
    .then( results =>{
      let productsArr = results.rows.map( val=>{
        return new Product( val );
      } );
      res.render( 'mycard', {results : productsArr} );
    } );
} );

app.post( '/product/:id', ( req,res )=>{
  let SQL = 'SELECT * FROM maybellinep WHERE id=$1;';
  let safeValue = [req.params.id];
  client.query( SQL, safeValue )
    .then( results=>{
      res.render( 'detail' , {val: results.rows[0]} );
    } );
} );

app.delete( '/delete/:id', ( req,res )=>{
  let SQL = 'DELETE FROM maybellinep WHERE id=$1;';
  let safeValue = [req.params.id];
  client.query( SQL, safeValue )
    .then( ()=>{
      res.redirect( '/mycard' );
    } );
} );

app.put( '/update/:id', ( req,res )=>{
  let {name,image,price,description} = req.body;
  let SQL = `UPDATE maybellinep SET name=$1,image=$2,price=$3,description=$4 WHERE id=$5;`;
  let safeValues = [name,image,price,description, req.params.id];
  client.query( SQL,safeValues )
    .then( ()=>{
      res.redirect( `/product/${req.params.id}` );
    } );
} );
