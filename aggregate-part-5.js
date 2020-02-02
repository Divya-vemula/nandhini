// count() and distinct()

product = db.products.findOne({'slug': 'wheel-barrow-9092'})
reviews_count = db.reviews.count({'product_id': product['_id']})

db.orders.distinct('shipping_address.zip')

// Map-reduce
db.orders.aggregate([
    {"$match": {"purchase_data":
    {"$gte" : new Date(2010, 0, 1)}}},
    {"$group": {
        "_id": {"year" : {"$year" :"$purchase_data"},
            "month" : {"$month" : "$purchase_data"}},
        "count": {"$sum":1},
        "total": {"$sum":"$sub_total"}}},
    {"$sort": {"_id":-1}}
]);


map = function() {
    var shipping_month = (this.purchase_data.getMonth()+1) +
        '-' + this.purchase_data.getFullYear();

    var tmpItems = 0;
    this.line_items.forEach(function(item) {
        tmpItems += item.quantity;
    });

    emit(shipping_month, {order_total: this.sub_total, items_total: tmpItems});
};

reduce = function(key, values) {
    var result = { order_total: 0, items_total: 0 };
    values.forEach(function(value){
        result.order_total += value.order_total;
        result.items_total += value.items_total;
    });
    return ( result );
};

filter = {purchase_data: {$gte: new Date(2010, 0, 1)}};
db.orders.mapReduce(map, reduce, {query: filter, out: 'totals'});

db.totals.find();
