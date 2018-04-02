const express = require('express')
const request = require("request")
const bodyParser = require('body-parser')
const mysql = require('mysql')
const rp = require("request-promise")
const fs = require('fs')
const app = express()
const db = require('./models/index')


const generateController = require('./controllers/generate');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'ketikgan'
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/edit',function(req,res){
    db.NewsTag.getNews(req.query.id).then(d=>{
        res.json(d);
    })
});

app.get('/api/tags',function(req,res) {
    db.Tags.getAllTags(req).then(d=>{
        var data = [];
        d.map((dt)=>{
            data.push({id:dt.id,name:dt.name,prefix:dt.prefix});
        })
        res.json(data);
    })
})

app.get('/api/news/', function(req, res) {
    const {page} = req.params
    db.NewsTag.getAllNews(page).then(d =>{
        res.json(d);
    })
});

app.get("/api/newsfeeding/", async (req, res) => {
    const {page} = req.params
    const result = await rp({
        uri: `http://newsfeeding.id:8881/news/${page}`,
        json: true,
    }) 
    res.json(result)
})

app.post('/tag/add', async function(req,res){
    try {
        await db.Tags.createTag(req.body)
        var d = await db.Tags.getAllTags()
        var data = [];
        d.map((dt)=>{
            data.push({id:dt.id,name:dt.name,prefix:dt.prefix});
        })
        return res.json(data);
    } catch(e) {
        return res.json({code: 500,err:e})
    }
}) 

app.post('/tag/edit', async function(req,res){
    try {
        await db.Tags.editTag(req.body)
        var d = await db.Tags.getAllTags()
        var data = [];
        await d.map((dt)=>{
            data.push({id:dt.id,name:dt.name,prefix:dt.prefix});
        })
        return res.json(data);
    } catch(e) {
        return res.json({code: 500,err:e})
    }
})

app.post('/generate',generateController);

app.post('/save', async function (req, res) {
    var data = req.body;
    try {
        await db.NewsTag.createNews(data)
        var d = await db.NewsTag.getNews(data.news_id)
        return res.json(d);
    } catch(e) {
        return res.json({code: 500,err:e})
    }
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))