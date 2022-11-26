const { resolve } = require("path");
const models = {
    treasures: require(resolve("models","treasures.js")),
    money_values: require(resolve("models","money_values.js")),
    users: require(resolve("models","users.js"))
}

// find the treasure
// formula taken from http://www.movable-type.co.uk/scripts/latlong.html and converted to match the algorithm
// tested the formula with multiple online distance calculator
const findTreasure = (filter) => {
    let query = [];

    // check the filter if it has prize value data
    if(filter.prize_value){
        
        //join money_values data to treasure data
        query.push({
            $lookup:{
                from:"money_values",
                localField:"id",
                foreignField:"treasure_id",
                as:"values"
            }
        });
        
        // get only the data that matched the condition
        query.push({
            $match:{"values.amount":{$gte:filter.prize_value[0],$lte:filter.prize_value[1]}}
        });
    }

    // push the default data to be used for calculating the distance between the two coordinates
    query.push({
        $addFields:{
            meters:6371e3,
            pi:Math.PI,
            given:filter
        }
    });

    // distance calculation starts here
    query.push({
        $project:{
            id:1,
            longitude:1,
            latitude:1,
            name:1,
            values:1,
            meters:1,
            pi:1,
            given:1,
            distance: {
                $let: {
                    vars: { // initiate the default data needed for final calculation
                        lat1:{$multiply:["$given.latitude",{$divide:["$pi",180]}]},
                        lat2:{$multiply:["$latitude",{$divide:["$pi",180]}]},
                        diffLat:{$multiply:[{$subtract:["$latitude","$given.latitude"]},{$divide:["$pi",180]}]},
                        diffLong:{$multiply:[{$subtract:["$longitude","$given.longitude"]},{$divide:["$pi",180]}]},
                    },
                    in:{ // final calculation
                        $divide:[{
                            $multiply:[
                                "$meters",
                                {$multiply: [
                                    2,
                                    {$atan2: [
                                        {$sqrt:{
                                            $add:[
                                                {$multiply:[
                                                    {$sin:{$divide:[
                                                        "$$diffLat",
                                                        2
                                                    ]}},
                                                    {$sin:{$divide:[
                                                        "$$diffLat",
                                                        2
                                                    ]}},
                                                ]},
                                                {$multiply:[
                                                    {$cos:"$$lat1"},
                                                    {$cos:"$$lat2"},
                                                    {$sin:{$divide:[
                                                        "$$diffLong",
                                                        2
                                                    ]}},
                                                    {$sin:{$divide:[
                                                        "$$diffLong",
                                                        2
                                                    ]}},
                                                ]}
                                            ]
                                        }},
                                        {$sqrt:{
                                            $subtract:[1,
                                                {$add:[
                                                    {$multiply:[
                                                        {$sin:{$divide:[
                                                            "$$diffLat",
                                                            2
                                                        ]}},
                                                        {$sin:{$divide:[
                                                            "$$diffLat",
                                                            2
                                                        ]}},
                                                    ]},
                                                    {$multiply:[
                                                        {$cos:"$$lat1"},
                                                        {$cos:"$$lat2"},
                                                        {$sin:{$divide:[
                                                            "$$diffLong",
                                                            2
                                                        ]}},
                                                        {$sin:{$divide:[
                                                            "$$diffLong",
                                                            2
                                                        ]}},
                                                    ]}
                                                ]}
                                            ]
                                        }}
                                    ]}
                                ]}
                            ]
                        },1000] // divide to 1000 to get the distance by kilometer
                    }
                }
            }
        }
    });
    
    // get the data that matched with the condition
    query.push({
        $match:{distance:{$lte:filter.distance}}
    });
    
    // build the final data to be shown in api, remove other data that is not needed
    query.push({
        $project:{
            id:1,
            latitude:1,
            longitude:1,
            name:1,
            values:1
        }
    });
    return new Promise((res,rej) =>{
        // execute query
        models.treasures.aggregate(query).exec((err,result) => {
            if(err){
                rej(err);
            } else {
                res(result);
            }
        });
    })
}

module.exports = {
    findTreasure
}