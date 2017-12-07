var moment = require('moment');
var _ = require('lodash');
var fs = require('file-system');
var child_process = require('child_process')

class Sentimental {
    constructor(){
        this.version = 1;

        this.exchangeFileName = "currentTweets.txt";
    }

    newVersion (version){
        return version != this.version;
    }

  writeTweetsToFile(tweets){
      var output = _.reduce(tweets, function(text, t){return text + t.text + "\n"}, "");
      fs.writeFileSync("./vaderSentiment/" + this.exchangeFileName, output);
  }

  cleanText(tweets){
      return tweets.map(t => {
          t.text = t.text ? t.text.replace(/(\r\n|\n|\r)/gm,"") : "";
          return t;
      })
  }

  callSentimentalAnalysis (tweets){
      //console.log("call sentiment analysis in class");
      tweets = this.cleanText(tweets);

      this.writeTweetsToFile(tweets);
      var sentiData = JSON.parse(child_process.execSync(`cd ./vaderSentiment && python vader.py ${this.exchangeFileName}`).toString());
      return _.zipWith(tweets, sentiData, (t, sd) => {
            t.sentiment = sd;
            return t;
        })
  }
}

module.exports = new Sentimental;