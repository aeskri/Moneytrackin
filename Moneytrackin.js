var httpsRequest = require('https').request
var tojs = require('xml2js').parseString
var format = require('util').format
var hash = require('crypto').createHash

var Moneytrackin = function(user, password) {
    var auth =  user + ':' + hash('md5').update(password).digest('hex')
    var request = function(method, callback) {
        var options = {
            host: 'www.moneytrackin.com',
            path: '/api/rest/'+method,
            auth: auth
        }
        var rq = httpsRequest(options, function(response) {
            var str = ''
            response.on('data', function(chunk) {
                str += chunk
            })
            response.on('end', function() {
                tojs(str, function(err, result) {
                    if (err) {
                        callback({ point: 'xml2js', error: err}, null)
                    } else {
                        var err = result.result.$.code
                    }
                    if (err !== 'done') {
                        callback({point: 'moneytrackin', error: err}, null)
                    } else {
                        callback(null, result.result)
                    }
                })
            })
        })
        rq.on('error', function(err) {
            callback({ point: 'http', error: err}, null)
        })
        rq.end()
    }
    var requestAndParse = function(command, parseFunction, callback) {
        request(command, function(err, result) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, parseFunction(result))
            }
        })
    }

    this.getAccounts = function(callback) {
        requestAndParse('listProjects', function(response) {
            var result  = []
            var len = response.project.length
            for(i = 0; i < len; ++i) {
                var a = response.project[i]
                result.push({ id: parseInt(a.$.id) || null, name: a.name[0], balance: parseFloat(a.balance[0]), currencyTitle: a.htmlchar[0], currency: a.currency[0], balanceInBaseCurrency: parseFloat(a.balancem[0]) })
            }
            return result
        }, callback)
    }

    this.getTransactions = function(accountId, startDate, endDate, callback) {
        var s = format('listTransactions?project=%s&startDate=%s&endDate=%s', accountId, startDate, endDate)
        requestAndParse(s, function(response) {
            var result  = []
            var len = response.transaction.length
            for(i = 0; i < len; ++i) {
                var t = response.transaction[i]
                result.push({ id: parseInt(t.$.id), description: t.description[0], amount: parseFloat(t.amount[0]), date: new Date(t.date[0]), tags: t.tags[0].tag })
            }
            return result
        }, callback)
    }
}

exports.Moneytrackin = Moneytrackin

