const express=require("express");
const app=express();
const dns=require("dns");
const mongoose=require("mongoose");
const cors=require("cors");
const bodyParser=require("body-parser");
const path=require("path");
const dotenv=require("dotenv");

dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

/******
 * Problems:
 * dns.lookup only verfies simple links i.e. google.com but not google.com/search?adasdasdasd
 * Title is misleading. URLs are not actually shortened but given an index. The user still needs to use the larger url
 * nodemon not in -dev mode
 */
const mongo_uri=process.env.MONGODB_URI || 'mongodb://localhost/urlShortner'; //note missing e; cant seem to fix on mongodb. May need to reset collection
mongoose.connect(mongo_uri,{useNewUrlParser:true,useUnifiedTopology:true});

const Schema=mongoose.Schema;
const urlSchema=new Schema({
    original_url:String,
    short_url:String
})
const Url=mongoose.model('urls',urlSchema);
app.post('/api/shorturl/new', (req,res)=>{ //oUrl=original url
    console.log("body:",req.body);
    const {oUrl} = req.body;
    console.log(oUrl);

    if(oUrl===undefined){
        return res.json({error:"undefined", err});
    }else if(oUrl===""){
        return res.json({error:"No Input"});
    }
    
    dns.lookup(oUrl,(err, address, family)=>{
        if(err){
            console.log(err);
           return res.json({error:"invalid URL", details:err});
           

        }
        else{
            Url.findOne({original_url:oUrl},(err,result)=>{//checks if it exists
                if(err){
                    console.log('err',err);
                    return res.json({error:err})

                }else{

                    if(result!==null){//if it does, then return the stored value   
                        console.log(result);                
                        res.json({original_url:oUrl, short_url:result.short_url});

                    }else{//if it doesn't, create, save then return value. 
                        Url.estimatedDocumentCount((err,count)=>{
                            if(err){
                                console.log('err',err);
                                res.json({error:err});
                                return;

                            }
                            else{
                                const urlObject={original_url:oUrl,short_url:count};
                                const urlDoc=new Url(urlObject);//short url using document count
                                urlDoc.save((err,data)=>{
                                    if(err){
                                        return console.log("error: ",err);
                                        
                                    }else{
                                        return res.json(urlObject);
                                    }
                                }) 
                                

                            }
                        })
                    }
                }
            })
                

        }
    })
    
})

app.get('/api/shorturl/new/:newUrl', (req,res)=>{
    const shortUrl=req.params.newUrl;
    Url.findOne({short_url:shortUrl},(err,result)=>{
        if(err){
            res.json({error:err});
        }else{
            res.redirect(`http://${result.original_url}`);
            //changes url
        }
    })


})

if(process.env.NODE_ENV === 'production'){ //for heroku
    app.use(express.static('client/build'))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve('__dirname','client','build','index.html'));//creates absolute directory path
    })
}

const PORT=4000 || process.env.PORT;


app.listen(PORT, ()=>{console.log(`port: ${PORT}`)});

//run again tomorrow 11/3/20