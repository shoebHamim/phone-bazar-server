const { MongoClient, ServerApiVersion, ObjectId, ClientSession } = require('mongodb');
const express=require('express')
const cors=require('cors');
const port =process.env.PORT||5000;
require('dotenv').config()
const app=express()
app.use(express.json())
app.use(cors())
const jwt = require('jsonwebtoken');

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mozdknj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    const database= client.db('phone-bazar')
    const categoriesCollection=database.collection('categories')
    const productsCollection=database.collection('products')
    const usersCollection=database.collection('users')
    const bookingsCollection=database.collection('bookings')

    // fetching categories from mongodb
    app.get('/categories',async(req,res)=>{
      const categories= await categoriesCollection.find({}).toArray()
      res.send(categories)
    })
    // fetching products under a category
    app.get('/category/:id', async(req,res)=>{
      const cat_id=parseInt(req.params.id)
      const products=await productsCollection.find({cat_id}).toArray()
      res.send(products)
    })
    // adding products 
    app.post('/products',async(req,res)=>{
      const product=req.body
      const result =await productsCollection.insertOne(product)
      res.send(result)
      
    })
    // adding users to database
    app.post('/users',async(req,res)=>{
      const user=req.body
      const result=await usersCollection.insertOne(user)
      res.send(result)
    })
    // accessing users in database
    app.get('/users/:email',async(req,res)=>{
      const email=req.params.email
      const result= await usersCollection.findOne({email:email})
      res.send(result)
    })

    // jwt token
    app.get('/jwt',async(req,res)=>{
      const email=req.query.email;
      const query={email:email}
      const user=await usersCollection.findOne(query)
      if(user){
        const token=jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'4h'})
        return res.send({accessToken:token})
      }
     res.status(403).send({accessToken:''})
    })
    // adding booking to db
    app.post('/bookings',async(req,res)=>{
      const booking=req.body
      const result= await bookingsCollection.insertOne(booking)
      res.send(result)
    })
    // retrieving user's orders
    app.get('/user/bookings/:email',async(req,res)=>{
      console.log(req.params.email);
      const query={email:req.params.email}
      const bookings=await bookingsCollection.find(query).toArray()
      res.send(bookings)
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

