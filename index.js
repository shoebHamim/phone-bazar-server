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

// middleware function 
const verifyJWT=(req,res,next)=>{
  const authHeader=req.headers.authorization
  if(!authHeader){
    return res.status(401).send({message:'Unauthorized Access'})
  }
  const token=authHeader.split(' ')[1]
  jwt.verify(token,process.env.ACCESS_TOKEN,function(error,decoded){
    if(error){
      return res.status(403).send({message:'Forbidden Access'})
    }
    req.decoded=decoded
    next()
  })





}

async function run(){
  try{
    const database= client.db('phone-bazar')
    const categoriesCollection=database.collection('categories')
    const productsCollection=database.collection('products')
    const usersCollection=database.collection('users')
    const bookingsCollection=database.collection('bookings')

 // jwt token
        app.get('/jwt',async(req,res)=>{
          const email=req.query.email;
          const query={email:email}
          const user=await usersCollection.findOne(query)
          console.log(user);
          if(user){
            const token=jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'2h'})
            return res.send({accessToken:token})
          }
         res.status(403).send({accessToken:''})
        })
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
    // fetching all products
    app.get('/products',async(req,res)=>{
      const products=await productsCollection.find({}).toArray()
      res.send(products)
    })
    // reporting a product
    app.put('/products/:id',async(req,res)=>{
      const id=req.params.id
      // console.log(id);
      const options={upsert:true}
      const filter={_id:ObjectId(id)}
      const updatedDoc={
        $set:{reported:true}
      }
      const result=await productsCollection.updateOne(filter,updatedDoc,options)
      res.send(result)
    })
    // retrieving reported items
    app.get('/products/reported',async(req,res)=>{
      const query={reported:true}
      const result=await productsCollection.find(query).toArray()
      res.send(result)
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
      if(result){
        res.send(result)
      }
      else{
        res.send({})
      }
    })
    //  updating user's status 
    app.put('/users/:id',async(req,res)=>{
      const id=req.params.id
      const options={upsert:true}
      const filter={_id:ObjectId(id)}
      const updatedDoc={
        $set:{
          verified:true
        }
      }
      const result=await usersCollection.updateOne(filter,updatedDoc,options)
      res.send(result)

    })


    // adding booking to db
    app.post('/bookings',async(req,res)=>{
      const booking=req.body
      const result= await bookingsCollection.insertOne(booking)
      res.send(result)
    })
    // retrieving user's orders
    app.get('/user/bookings/:email',verifyJWT,async(req,res)=>{
      const email=req.params.email
      const query={email:email}
      const decodedEmail=req.decoded?.email
      if(email===decodedEmail){
        const bookings=await bookingsCollection.find(query).toArray()
        res.send(bookings)
      }
      else{
        res.status(403).send({message:'Forbidden Access'})
      }
     
    })
    // retrieving seller's products
    app.get('/my-products/:email',async(req,res)=>{
      const query={seller_email:req.params.email}
      const products=await productsCollection.find(query).toArray()
      res.send(products)
    })
    // deleting seller's product
    app.delete('/my-products/:id',async(req,res)=>{
      const query={_id:ObjectId(req.params.id)}
      const result=productsCollection.deleteOne(query)
      res.send(result)
    })

    //  updating advertise status
    app.put('/my-products/:id',async(req,res)=>{
      const id=req.params.id
      const options={upsert:true}
      const filter={_id:ObjectId(id)}
      const updatedDoc={
        $set:{
          advertise:true
        }
      }
      const result=await productsCollection.updateOne(filter,updatedDoc,options)
      res.send(result)
    })
    // fetching advertised products
    app.get('/products/advertised',async(req,res)=>{
      const query={advertise:true}
      const advertised= await productsCollection.find(query).toArray()
      res.send(advertised)
    })
    // retrieving all sellers
    app.get('/all-sellers',async(req,res)=>{
      const query={accountType:'seller'}
      const sellers=await usersCollection.find(query).toArray()
      res.send(sellers)
    })
    // retrieving all buyers
    app.get('/all-buyers',async(req,res)=>{
      const query={accountType:'user'}
      const buyers=await usersCollection.find(query).toArray()
      res.send(buyers)
    })
    // deleting seller or buyer
    app.delete('/users/:id',async(req,res)=>{
      const query={_id:ObjectId(req.params.id)}
      const result=await usersCollection.deleteOne(query)
      res.send(result)
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

