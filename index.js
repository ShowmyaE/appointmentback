const express=require('express')
const app=express()
const sqlite3=require('sqlite3')
const {open}=require('sqlite')
const path=require('path')
const cors = require("cors");
const { v4: uuidv4 } = require('uuid'); 
const jwt = require('jsonwebtoken')

app.use(cors());
app.use(express.json())

const dbPath=path.join(__dirname,'demodb.db')
let db=null

const initializeDbAndServer=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(4000,()=>{
           console.log('Server Running at http://localhost:4000')
            
        })

    }catch(error){
        console.log(`DB Error : ${error.message}`)
        process.exit(1)
  }
}
initializeDbAndServer()
app.get('/',async(req,res)=>{
    const getUserQuery=`select * from registration`;
    const userDbDetails=await db.all(getUserQuery);
    console.log('DB value',userDbDetails);
    res.send(userDbDetails)

})
const authentication = (request, response, next) => {
    let jwtToken
    console.log("AUTH", request.headers['authorization'])
    const authHeader = request.headers['authorization']
    if (authHeader) {
      jwtToken = authHeader.split(' ')[1]
    }
    console.log("JWT", jwtToken)

    if (jwtToken) {
      jwt.verify(jwtToken, 'SECRET_KEY', (error, payload) => {
        if (error) {
          response.status(401)
          response.send('Invalid JWT Token')
        } else {
          request.email = payload.email
          request.userId = payload.userId
          next()
        }
      })
    } else {
      response.status(401)
      response.send('Invalid JWT Token')
    }
  }
  

app.post("/signUp",async(req,res)=>{
    const {email, password} = req.body
    console.log('DB value',email,password)
    const id = uuidv4();
     const insertquery=`INSERT INTO registration(CustomerId, EmailId, Password)
    VALUES ('${id}', '${email}','${password}')`;
    const insertData=await db.run(insertquery)
if(insertData) {
    res.send({data:"successfully inserted"})
}
else{
    res.status(400)
    res.send({data:"Failed to inserted"})
}
})

app.post("/loginIn",async(req,res)=>{
    const {email, password} = req.body
    console.log('DB value',email,password)
    const getUserQuery = `SELECT * FROM registration WHERE EmailId='${email}' AND Password='${password}';`
    const userDbDetails = await db.get(getUserQuery)
    console.log(userDbDetails)
    if (userDbDetails) {
        const payload = {email:email,userId:userDbDetails.CustomerId}
        const jwtToken = jwt.sign(payload, 'SECRET_KEY')
        res.send({jwtToken})
      } else {
        res.status(400)
        res.send('Invalid password')
      }
    //  res.send({data:"user is valid "})

})



app.post('/bookingDetail', authentication, async(req,res) => {
//    const drop = `DROP TABLE bookingDetail`;
// await db.run(drop)
    //     const createQuery = `CREATE TABLE bookingDetail (
    //     Id varchar(255) PRIMARY KEY,
    //     CustomerId varchar(255),
    //     Name varchar(255),
    //     EmailId varchar(255),
    //     Company varchar(255),
    //     PhoneNumber varchar(255),
    //     Domain text,
    //     Interests text,
    //     BookingDate DATETIME,
    //     Date DATETIME
    // );`
    // const createData=await db.run(createQuery)
    const id = uuidv4();
    const customerId=req.userId
    console.log("req.body", req.body)
    const {name,email, company,phonenumber,domain,interests, bookingDate} = req.body
    const insertquery=`INSERT INTO bookingDetail (Id, CustomerId,Name,EmailId,Company,PhoneNumber,Domain,Interests,BookingDate,Date)
    VALUES ('${id}', '${customerId}','${name}','${email}','${company}','${phonenumber}','${domain}','${interests}','${bookingDate}','${bookingDate}' )`;
    const userDbDetails=await db.run(insertquery)
    console.log("INSERTQUERY", userDbDetails)
//     const getUserQuery = `SELECT * FROM bookingDetail;`
//     const userDbDetails = await db.get(getUserQuery)
//    console.log("GET", userDbDetails);
    res.send("SUCCESS")
})

app.get('/getbookingDetail', authentication, async (req,res) => {
    const customerId=req.userId
     const getUserQuery = `SELECT * FROM bookingDetail WHERE CustomerId='${customerId}' ;`
     const insertData=await db.all(getUserQuery)
     console.log("GET CUSTOMER", insertData)
    res.send(insertData)
})
// app.post("/",async(req,res)=>{
//     const userDbDetails1=req.body
//     console.log('DB value',userDbDetails1)
//      const insertquery=`INSERT INTO google_keep (id,title,description,date)
//     VALUES ('${userDbDetails1.id}','${userDbDetails1.title}','${userDbDetails1.description}','${userDbDetails1.date}')`;
//     const insertData=db.run(insertquery)

//     res.send({data:"successfully inserted"})
// })

// app.get('/user/tweets/feed/', authentication, async (request, response) => {
//     const {username} = request
  
//     const followingPeopleIds = await getFollowingPeopleIdsOfUser(username)
  
//     const getTweetsQuery = `SELECT
//       username,tweet, date_time as dateTime
//       FROM user INNER JOIN tweet ON user.user_id = tweet.user_id
//       WHERE 
//       user.user_id IN (${followingPeopleIds})
//       ORDER BY date_time DESC
//       LIMIT 4;
//       `
//     const tweets = await db.all(getTweetsQuery)
//     response.send(tweets)
//   })
  
// //app.listen(4000)