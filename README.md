Moneytrackin
============

Node.js module to import data from moneytackin.com

Usage
-----

```javascript
var Moneytrackin = require('./Moneytrackin.js').Moneytrackin
var util = require('util')

var mt = new Moneytrackin('name', 'password')

mt.getTransactions('', '2014-10-01', '2020-01-01', function(err, result) {
    console.log('err: ' + err)
    console.log('result: ' + util.inspect(result, false, null))
})
```
