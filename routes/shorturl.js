//Identifies latest addition to replace. Starts at 3 because of existing addition in database
const router = require('express').Router();
const Url = require('../models/Url');
const dns=require("dns");

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
router.post('/new', async (req,res)=>{ //oUrl=original url
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
        return res.json({ short_url:findRes.short_url});
     }catch(e){
        res.status(400).json({error:e , hi:"val"});
     }
     
    })

router.get('/:short_url', async (req,res)=>{
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

module.exports = router; 