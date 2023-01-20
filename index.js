const { MongoClient, ServerApiVersion, ObjectId, ClientSession } = require('mongodb');
const express=require('express')
const cors=require('cors');
const port =process.env.PORT||5000;
require('dotenv').config()
const app=express()
app.use(express.json())
app.use(cors())


// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mozdknj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    const database= client.db('phone-bazar')
    const categoriesCollection=database.collection('categories')
    const productsCollection=database.collection('products')

    // fetching categories from mongodb
    app.get('/categories',async(req,res)=>{
      const categories= await categoriesCollection.find({}).toArray()
      res.send(categories)
    })
    app.get('/category/:id', async(req,res)=>{
      const cat_id=parseInt(req.params.id)
      const products=await productsCollection.find({cat_id}).toArray()
      res.send(products)
    })

  }
  finally{

  }
}
run()
app.get('/',async(req,res)=>{
  res.send('phone bazar server is running')
})
app.listen(port,()=>console.log('phone bazar server is running on ',port))

