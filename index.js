
/******
 * Problems:
 * dns.lookup only verfies simple links i.e. google.com but not complexc links (query strings) google.com/search?adas=das&&dasd
 * Title is misleading. URLs are not actually shortened but given an index. The user still needs to use the larger url
 * nodemon not in -dev mode
 */

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const cors=require("cors");
const bodyParser=require("body-parser");
const path=require("path");
const dotenv=require("dotenv");
const shorturl=require('./routes/shorturl');


const PORT=process.env.PORT || 5000;


dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const mongo_uri=process.env.MONGODB_URI || 'mongodb://localhost/urlShortner'; //note missing e; cant seem to fix on mongodb. May need to reset collection
mongoose.connect(mongo_uri,{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set('useFindAndModify',false);


app.use('/api/shorturl',shorturl);


  
if(process.env.NODE_ENV === 'production'){ //for heroku
  app.use(express.static('client/build'))
/*
app.get("/*", (req, res) => {//need to test //try this alone
    let url = path.join(__dirname, '../client/build', 'index.html');
    if (!url.startsWith('/app/')) // since we're on local windows
      url = url.substring(1);
    res.sendFile(url);
  });
*/
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'));//creates absolute directory path
    })
    
}

/*
heroku solution:
-removed useless favicon files
-removed unnecessary dependency array
-change '__dirname' to __dirname (no quotes)
-rebuilt with the following
-git add -A
-NOTE: all was working locally
*/



app.listen(PORT, ()=>{console.log(`port: ${PORT}`)}); 

