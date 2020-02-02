
// reshaping documents
db.users.aggregate([
    {$match: {username: 'kbanker'}},
    {$project: {name: {first:'$first_name',
                       last:'$last_name'}}
    }
]);


// String functions
db.users.aggregate([
    {$match: {username: 'kbanker'}},
    {$project:
    {name: {$concat:['$first_name', ' ', '$last_name']},    // 1
        firstInitial: {$substr: ['$first_name',0,1]},          // 2
        usernameUpperCase: {$toUpper: '$username'}             // 3
    }
    }
]);


// using $substr function

db.orders.aggregate([
    {$unwind: '$line_items'},
    {$project: {
        'line_items.name': 1, 
        orderQuantity: 
            {$substr:['$line_items.quantity',0,10]}}},       // A
    {$project: {
        orderSummary: 
            {$concat: ['$orderQuantity', ' ', '$line_items.name']}}} // B
])
// #A convert ‘line_items.quantity’ to a string.
// #B concatenate string version of order quantity with the line item name

// Set functions
// given products: 
{ "_id" : ObjectId("4c4b1476238d3b4dd5003981"), 
  "productName" : "Extra Large Wheel Barrow",
  "tags" : [ "tools", "gardening", "soil" ]}
  
{ "_id" : ObjectId("4c4b1476238d3b4dd5003982"),
  "productName" : "Rubberized Work Glove, Black",
  "tags" : [ "gardening" ]}

  // and define tag
  testSet1 = ['tools']
  
// a setUnion as such
  db.products.aggregate([
    {$project: 
        {productName: '$name', 
         tags:1, 
         setUnion: {$setUnion:['$tags',testSet1]},
       }
    }
])

// would produce
{   "_id" : ObjectId("4c4b1476238d3b4dd5003981"),
    "productName" : "Extra Large Wheel Barrow",
    "tags" : ["tools", "gardening", "soil"],
    "setUnion" : ["gardening","tools","soil"]
}

{   "_id" : ObjectId("4c4b1476238d3b4dd5003982"),
    "productName" : "Rubberized Work Glove, Black",
    "tags" : ["gardening"],
    "setUnion" : ["tools", "gardening"]
}

// Misc. functions
db.orders.aggregate([
    {$project: {
        orderSummary: {
            $map: {
                input: '$line_items',
                as: 'item',
                in: {
                    descr: {$concat: [
                        {$substr:['$$item.quantity',0,10]},
                        ' ', '$$item.name']},
                    price: '$$item.pricing.sale'
                }
            }
        }}
    }, 
    {$limit: 2}
]).pretty()
