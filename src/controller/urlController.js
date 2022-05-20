const validUrl = require('valid-url')
const urlModel = require('../models/urlModel')
const shortID = require('shortid')
const redis = require('redis');

const {promisify} = require('util')

//Connect to redis
const redisClient = redis.createClient(
    17250,
    "redis-17250.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("jZAOYkBGd1wFBP7h0Fdgk0J9LzFZFq5R", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

let baseUrl = 'http://localhost:3000'

const shortUrl = async (req,res)=>{

try{
    let data =req.body
    
    if(Object.keys(data).length==0){
        return res.status(400).send({status:false,message:"no input provided"})
    }
   
    const longUrl = req.body.longUrl
   
    if(!longUrl){
        return res.status(400).send({status:false, message:"please provide requires input feild"})
    }

    if(longUrl){ 
        let isUrl = validUrl.isUri(longUrl)
        if(!isUrl){
            return res.status(400).send({status:false, message:"not a valid url"})
        } 
    }

    let url = await GET_ASYNC(`${longUrl}`)  
    if(url){ 
        return res.status(201).send({status : true, data : JSON.parse(url)})
    }

    let createShortID = shortID.generate()

    data['urlCode'] = createShortID.toLowerCase()

    let createUrl = baseUrl+"/"+ createShortID
    
    data['shortUrl'] = createUrl

    let createData = await urlModel.create(data)
    
    if(createData){
    await SET_ASYNC(`${longUrl}`, JSON.stringify({urlCode : createShortID.toLowerCase(), longUrl : data.longUrl, shortUrl : createUrl}))
    return res.status(201).send({status : true, data : {urlCode : createShortID, longUrl : data.longUrl, shortUrl : createUrl}})
    }

}
 catch(err){
      return res.status(500).send({status:"false",message:err.message})

  }
}




const redirectToSource = async (req,res)=>{
    try{
      let urlCode= req.params.urlCode
      
      let verifyUrl = shortID.isValid(urlCode)
        if(!verifyUrl){
          return res.status(400).send({status : false, message : "This is not a valid URL CODE"})
      }

      let cache = await GET_ASYNC(`${urlCode}`)
      if(cache){ return res.status(302).redirect(JSON.parse(cache))}
      
      let findUrl = await urlModel.findOne({urlCode : urlCode})

      if(!findUrl){
        return res.status(404).send({status : false, message : "No url with this code"})
      }else{
        await SET_ASYNC(`${urlCode}`,JSON.stringify(findUrl.longUrl))
        return res.status(302).redirect( findUrl.longUrl)
      }
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}



module.exports = {shortUrl,redirectToSource }







