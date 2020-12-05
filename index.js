const express=require("express");
const app=express();
const dns=require("dns");
const mongoose=require("mongoose");
const cors=require("cors");
const bodyParser=require("body-parser");
const path=require("path");
const dotenv=require("dotenv");

const PORT=process.env.PORT || 5000;


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
mongoose.set('useFindAndModify',false);

const Schema=mongoose.Schema;
const urlSchema=new Schema({
    original_url:String,
    short_url:String,
    date:Date
})

const Url=mongoose.model('urls',urlSchema);

//Identifies latest addition to replace. Starts at 3 because of existing addition in database
const maxUrls=5; //limits server memory use

const dnsLookUpProm = async (oUrl) =>{
    new Promise((res,rej)=>{
        dns.lookup(oUrl,(err,address,family)=> {
            if(err)
                rej(err)
            else
                res() 
        })
    });
}
app.post('/api/shorturl/new', async (req,res)=>{ //oUrl=original url
    console.log("body:",req.body);
    const {oUrl}=req.body;
    if(oUrl===undefined){
        return res.status(404).json({error:"undefined"});
    }else if(oUrl===""){
        return res.status(404).json({error:"No Input"});
    }
     try{
        await dnsLookUpProm(oUrl);//check if domain exists. A reject means no
        let findRes = await Url.findOne({original_url:oUrl}).exec();//check if name is taken
        if(findRes !== null){
            console.log('exists');
            return res.json({ original_url: oUrl, short_url: findRes.short_url });
        }
        const count = await Url.estimatedDocumentCount().exec();
        if(maxUrls<=count){ //update instead
            findRes= await Url.find({}).sort('date').exec();//recycle findRes to be array
            const {_id, short_url}=findRes[0];
            const newObj = {original_url:oUrl, date:Date()}
            findRes=await Url.findByIdAndUpdate(_id, newObj).exec();
            return res.json({short_url:short_url});//send to client to pas
        }
        //create new entry
        findRes = new Url({ original_url: oUrl, short_url: count, date:Date()});//recycle findRes
        await urlDoc.save().exec(); 
        console.log('saved');
        return res.json({ short_url:findRes.short_url});
     }catch(e){
         console.log(e);
        res.status(400).json({error:e , hi:"val"});
     }
     
    })

app.get('/api/shorturl/:short_url', async (req,res)=>{
    const {short_url} =req.params;
    try{
        const result=await Url.findOne({short_url:short_url});
        if(result===null){
            res.status(404).json({newUrl: null}); 
            return;
        }
        res.json({newUrl:`http://${result.original_url}`});
    }catch(e){
        res.status(400).json({newUrl:e});
    }
})

if(process.env.NODE_ENV === 'production'){ //for heroku
    app.use(express.static('client/build'))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve('__dirname','client','build','index.html'));//creates absolute directory path
    })
}



app.listen(PORT, ()=>{console.log(`port: ${PORT}`)}); //find the port heroku is using then find a dynamic way to update client

//run again tomorrow 11/3/20