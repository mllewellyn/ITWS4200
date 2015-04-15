var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var fs = require("fs");

// Twitter setup
var twitterClient = new Twitter({
  consumer_key: 'CkXTNz0ODXZ3RWftYhuT2Q5c1',
  consumer_secret: '2HpMvW3Yh7JMdv1uP5gkkIWXSTag34L2oZtvkTC8qxuCgiqbr0',
  access_token_key: '37131221-Do49jxHkueRpNgk5jfQDrMkeaALaLR14FZZh57HNt',
  access_token_secret: 'nCGBL1mnxr78ma0MAoDwcgE317SmLgNybOFo8IBawy7bV'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// clear db of tweets then add X tweets to it
router.get('/makeTweetDB', function(req, res, next) {
  var tweetCount = req.query.count;
  console.log("Getting tweets for db with count "+ tweetCount);

  var tweets_collection = req.db.collection('tweets');

  // clear the db of tweets
  tweets_collection.remove({})

  var tweets = []
  var params = {track: 'twitter'}
  twitterClient.stream('statuses/filter', params, function(stream) {
    var tweetsGot = 0;

    stream.on('data', function(tweet) {
      // console.log(tweet);
      tweets.push(tweet);
      // store the tweet in the db
      tweets_collection.insert(tweet, function(err, result) {
        if(err) { cosole.dir(err); return; }
      })

      // check when to stop reading tweets
      tweetsGot += 1;
      if(tweetsGot >= tweetCount) {
        console.log("finished getting tweets and destroying connection");
        // close the stream so we don't get more tweets
        this.destroy()

        // return the tweets as a JSON
        res.json(tweets)
      }
    });
   
    stream.on('error', function(error) {
      console.log("ERROR: "+ error);
      // res.render('error', { message: 'There was an error getting tweets. ' + error });
      // throw error;
    });
  });
});

// get X tweets from the db and return a JSON
router.get('/getTweetsFromDB', function(req, res, next) {
  var tweetCount = req.query.count;
  tweetCount = tweetCount || 10;
  console.log("Getting tweets from db with count "+ tweetCount);

  var tweets_collection = req.db.collection('tweets');
  tweets_collection.find({}).limit(tweetCount).toArray(function(err, items) {
    if(err) { return console.dir(error); }

    // console.log("Got these tweets")
    // console.log(items)
    // return a json of tweets
    res.json(items)
  });
  

});

/* Get the json of tweets from twitter, save it and return it. */
router.get('/getTweets', function(req, res, next) {
  var tweetCount = req.query.count;
  console.log("Getting tweets with count "+ tweetCount);

  var tweets = []
  var params = {track: 'twitter'}
  twitterClient.stream('statuses/filter', params, function(stream) {
    var tweetsGot = 0;

    stream.on('data', function(tweet) {
      // console.log(tweet);
      tweets.push(tweet);

      // check when to stop reading tweets
      tweetsGot += 1;
      if(tweetsGot >= tweetCount) {
        console.log("finished getting tweets and destroying connection");
        // close the stream so we don't get more tweets
        this.destroy()

        var fileName = res.app.locals.twitter_path + "/llewem-tweets.json"
        fs.writeFileSync(fileName, JSON.stringify(tweets));
        // return a JSON to the page
        res.json(tweets)
      }
    });
   
    stream.on('error', function(error) {
      console.log("ERROR: "+ error);
      // res.render('error', { message: 'There was an error getting tweets. ' + error });
      // throw error;
    });
  });
  
});

// get the tweets from the db and make a json of them
router.get('/makeTweetsJSONDB', function(req, res, next) {
  var JSONfilename = res.app.locals.twitter_path +"/"+ req.query.filename+".json";

  var tweets_collection = req.db.collection('tweets');
  tweets_collection.find({}).toArray(function(err, items) {
    if(err) { return console.dir(error); }

    // console.log("Got these tweets")
    // console.log(items)
    // return a json of tweets
    // res.json(items)

    fs.writeFileSync(JSONfilename, JSON.stringify(items));
    console.log("wrote the JSON");
    
    // return
    var CSVurl = "/tweets/" + req.query.filename+".json";
    res.json(CSVurl);

  });
});

// Turn the JSON into a CSV and serve it
router.get('/makeTweetsCSV', function(req, res, next) {
  var CSVfilename = res.app.locals.twitter_path +"/"+ req.query.filename+".csv";

  // read in the JSON file
  var tweetsJson = fs.readFileSync(res.app.locals.twitter_path + "/llewem-tweets.json");
  tweetsJson = JSON.parse(tweetsJson)

  var CSVdata = "";
  if(tweetsJson.length != 0) {
    // make headers
    for(var key in tweetsJson[0]) {
      // if it's the user key start making indexes of the new object
      if(key == "user") {
        for(var user_key in tweetsJson[0]["user"]) {
          CSVdata += '"user_'+ user_key +'",';
        }
        // skip recording the objects because they're ugly
      } else if(Object.prototype.toString.call(tweetsJson[0][key]) != "[object Object]") {
        CSVdata += '"'+ key +'",';
      }
    }
    CSVdata += "\n";

    // populate data
    for(var i=0; i<tweetsJson.length; ++i) {
      var tweet = tweetsJson[i];
      // console.log("adding tweet to CSV");
      // console.log(tweet);
      for(var key in tweet) {
        // if it's the user key start making indexes of the new object
        if(key == "user") {
          for(var user_key in tweetsJson[i]["user"]) {
            CSVdata += '"'+ tweetsJson[i]["user"][user_key] +'",';
          }
          // skip recording the objects because they're ugly
          // check if they're objects against the first tweets to keep consistent
        } else if(Object.prototype.toString.call(tweetsJson[0][key]) != "[object Object]") {
          CSVdata += '"'+ tweetsJson[i][key] +'",';
        }
      }
      CSVdata += "\n";
    }
  }

  fs.writeFileSync(CSVfilename, CSVdata);
  console.log("wrote the csv");
  
  // return
  var CSVurl = "/tweets/" + req.query.filename+".csv";
  res.json(CSVurl);
});

module.exports = router;
