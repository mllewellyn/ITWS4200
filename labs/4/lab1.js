// keep track of which tweet to add next
var lastTweetAdded = 0;
var lastHashtagAdded = 0;
// arrays to hold tweets and hashtags
var tweets, hashtags;
// how many tweets and hashtags to display at one time
var tweetsToShow = 5;
var hashtagsToShow = 5;
// templates for new tweets or hashtag HTML elements
var tweetTemplate, hashtagTemplate;

window.onload = function() {
	// set up tweet and hashtag template
	tweetTemplate = $(".tweet-template").clone();
	tweetTemplate.removeClass("tweet-template");
	$(".tweet-template").remove();

	hashtagTemplate = $(".hashtag-template").clone();
	hashtagTemplate.removeClass("hashtag-template");
	$(".hashtag-template").remove();

	// make an AJAX call to get tweet data
	var jqxhr = $.getJSON("tweets.json", function(data) {
		console.log("success");
		tweets = setUpTweets(data);
		setUpHashtags(tweets);

	})
	.fail(function( jqxhr, textStatus, error ) {
    	var err = textStatus + ", " + error;
    	console.log("Request Failed: " + err );
    })
}

function setUpTweets(data) {
	tweets = data;
	// add the first X tweets
    for(var i=0; i<tweetsToShow; ++i) {
    	addNextTweet();
    }
    // set up tweet scroll animation
    setInterval(function() { 
    	$("#tweets .row:nth-child(1)").slideUp("slow", function() {
    		addNextTweet();
    		$(this).remove();
    	});
    }, 3000);

    return tweets;
}

function addNextTweet() {
	// if at the end of the list wrap around to the start
	if(lastTweetAdded >= tweets.length)
		lastTweetAdded = -1;
	$("#tweets").append(buildTweet(tweets[++lastTweetAdded]));
}

function buildTweet(tweet) {
	// make a clone of the template
	html = tweetTemplate.clone();
	// populate the clone with tweet data
	$(html).find("img").attr("src", tweet.user.profile_image_url);
	$(html).find(".tweet-text").text(tweet.text);

	return html;
}

function setUpHashtags (tweets) {
	// extract all the hashtags and store them in an object for fast lookup
	// fast lookup means this loop runs in O(n log n) as opposed to O(n^2)
    hashtag_object = {}
    for(var i=0; i<tweets.length; ++i) {
    	for(var j=0; j<tweets[i].entities.hashtags.length; ++j) {
    		// if hashtag is NOT already stored store it
    		var tag = tweets[i].entities.hashtags[j].text;
    		if(!(tag in hashtag_object))
    			hashtag_object[tag] = true;
    	}
    }

    // move the hashtags to a list for easier handling
    hashtags = $.map(hashtag_object, function(value, key) { return key; });

    // add the first X hashtags
	for(var i=0; i<hashtagsToShow; ++i) {
		addNextHashtag();
	}

	// set up hashtag scroll animation
    setInterval(function() { 
    	$("#hashtags .panel:nth-child(1)").slideUp("slow", function() {
    		addNextHashtag();
    		$(this).remove();
    	});
    }, 4000);
}

function addNextHashtag() {
	// if at the end of the list wrap around to the start
	if(lastHashtagAdded >= hashtags.length)
		lastHashtagAdded = -1;
	$("#hashtags").append(buildHashtag(hashtags[++lastHashtagAdded]));
}

function buildHashtag(hashtag) {
	// make a clone of the template
	html = hashtagTemplate.clone();
	// populate the clone with hashtag data
	$(html).text("#"+hashtag);
	return html;
}