const express = require("express");
const cors = require("cors"); // allow cross origin in /api
const { resolve } = require("path");
const { connect } = require("mongoose");
const helper = require(resolve("helpers","helper.js"));

const app = express();
let mongoDB = 'mongodb://localhost:27017/serinoTest'

//connect database
connect(mongoDB,(e)=>{
    if(e) {
        console.log(e);
        process.exit(1);
    }
    console.log("Connection Success....");
});


app.use('*',cors());

app.get("/nearMe",(req,res)=>{
    let query = req.query;

    // convert params from string to Float, and split prize value if available
    for(var i in query){
        if(i === "prize_value"){
            query[i] = query[i].split("-").map((val)=>parseFloat(val));
        } else {
            query[i] = parseFloat(query[i]);
        }
    }

    // check if prize value is within the acceptable condition
    // condition is only between $10 to $30 and strictly no decimal values
    // added condition to not allow the prize value from to be greater than the prize value to
    if(query.prize_value && (query.prize_value.map((val)=> val%1 > 0 || val<10 || val>30 )).indexOf(true)+1){
        res.status(400).json({message:"Prize Value only accepts range from 10-30 and no decimal values."});
        return;
    } else if(query.prize_value && query.prize_value[0] > query.prize_value[1]){
        res.status(400).json({message:"Data Error."});
        return;
    }

    // check if the required data is in the query
    if(!query.latitude || !query.longitude || !query.distance){
        res.status(400).json({message:"Data Incomplete"});
        return;
    }

    // check if distance is between 1 or 10
    if([1,10].indexOf(query.distance)<0){
        res.status(400).json({message:"Distance only accepts between 1 or 10"});
        return;
    }

    // call the function for finding the treasure
    helper.findTreasure(query)
    .then((collection)=>{
        res.json(collection);
    })
    .catch((err)=>{
        console.log(err);
    })
});

// all pages will be set as 404
app.use(function(req, res, next) {
    res.status(404).send("<h1>Page Not Found!</h1>");
});

app.listen(process.env.PORT || 3000, () => console.log("server is up!"));