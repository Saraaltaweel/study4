'use strict';

// Application Dependencies 
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');

// Environmental variables
require('dotenv').config();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Application Setup
const app = express();
const client = new pg.Client(DATABASE_URL);

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.get('/home',renderHome)
app.post('/addFav', selectFav)
app.get('/addFav',renderFavPage)
app.get('/detail/:id',detailRender)
app.delete('/detail/:id',deleteRender)
app.put('/detail/:id',updateRender)
app.post('/create',renderCreate)
app.get('/create',selectRender)


function Characters(data){
    this.name=data.name;
    this.house=data.house;
    this.patronus=data.patronus;
    this.alive=data.alive;
}

function renderHome(req,res){
    const url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url).then(data=>{
        const newCharacters= data.body.map(result=> new Characters(result))
         res.render('pages/index',{results:newCharacters})
    
    })
}

function selectFav(req,res){
    const {name, house, patronus, alive}=req.body;
    const sql= 'INSERT INTO characters (name, house, patronus, is_alive , created_by) VALUES ($1,$2,$3,$4,$5);';
    const value=[name, house, patronus, alive, 'API'];

    client.query(sql,value).then(()=>{
        res.redirect('/addFav');

    })
}

function renderFavPage(req,res){
    const sql='SELECT * FROM characters;';
    client.query(sql).then(result=>{
        res.render('pages/fav',{results:result.rows})
    })

}

function detailRender(req,res){
    const Id=req.params.id;
    const sql='SELECT * FROM characters WHERE id=$1;';
    const value=[Id];
    client.query(sql,value).then(result=>{
        res.render('pages/details',{results:result.rows})
    })
}

function deleteRender(req,res){
    const Id = req.params.id;
    const sql = 'DELETE FROM characters WHERE id=$1;';
    const value=[Id];
    client.query(sql,value).then(()=>{
        res.redirect('/home')
    })
}

function updateRender(req,res){
    const Id=req.params.id;
    const {name, house, patronus, alive}=req.body;
    const sql='UPDATE characters SET name=$1, house=$2, patronus=$3, is_alive=$4 WHERE id=$5;';
    const value = [name, house, patronus, alive,Id];
    client.query(sql,value).then(()=>{
        res.redirect(`/detail/${Id}`)
    })

}

function renderCreate(req,res){
    const {name, house, patronus, alive}=req.body;
    const sql= 'INSERT INTO characters (name, house, patronus, is_alive , created_by) VALUES ($1,$2,$3,$4,$5);';
    const value=[name, house, patronus, alive, 'USER'];
    client.query(sql,value).then(()=>{
        res.redirect('/addFav')
    })
}

function selectRender(req,res){
    res.render('pages/create')
}

client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
}).catch(error => console.log(error));