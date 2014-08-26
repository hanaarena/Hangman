  /*
     hanaarena/Hangman - Lanz
     https://github.com/hanaarena/Hangman
  */
  
  var Hangman = {};
  /* game secret */
  Hangman.secret = null;
  /* guess record serial number */
  var i = 1;
  /* records textarea number */
  var recordNum = 1;
  /* newWord textarea records */
  var guessRecordStr = "";
  /*  words have guessed */
  var guessedWordRecord = "";
  /* get current word length */
  var tempWordLength;
  /* current word to guess */
  var currentWord;
  /* guess times */
  var guessTimes;
  /* Regx*/
  var reg = /[*]/;

  Hangman.lanzPlayer = function (wordLength) {
    this.corpus = _.filter(words, function (word) { return word.length === wordLength; });
    this.possibleGuesses = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    this.recomputeCounts();
  };

  Hangman.lanzPlayer.prototype.afterTurn = function (guess, matched, revealed) {
    if (matched) {
      this.trimDownCorpusRevealed(revealed);
    } else {
      this.trimDownCorpusDenied(guess);
    }

    this.possibleGuesses = _.without(this.possibleGuesses, guess); // update possible guess char
    this.recomputeCounts(); // update the freq of each char 
  };

  Hangman.lanzPlayer.prototype.trimDownCorpusRevealed = function (revealed) {
    var template = '^'+revealed.replace(/_/g, '.')+'$';
    var pattern = new RegExp(template, 'g');
    this.corpus = _.filter(this.corpus, function (word) {
      return word.match(pattern);
    });
  }

  Hangman.lanzPlayer.prototype.trimDownCorpusDenied = function (guess) {
    this.corpus = _.filter(this.corpus, function (word) {
      return word.indexOf(guess) < 0;
    });
  }

  Hangman.lanzPlayer.prototype.recomputeCounts = function (guess, matched, revealed) {
    var counts = {};
    _.each(this.possibleGuesses, function (letter) {
      counts[letter] = 0;
    });
    _.each(this.corpus, function (word) {
      var uniqueLetters = _.uniq(word.split(''));
      _.each(uniqueLetters, function (letter) {
        counts[letter]++; //record the freq of each char
      });
    });
    this.counts = counts;
  };

  Hangman.App = function(options){
    this.options = options;
    this.reset();
  }

  // Get a word from server
  Hangman.App.prototype.reset = function () {
   
    this.word = this.pickSecretWord(); 
    this.secretWordController = new Hangman.SecretWordController(this.word);
    this.remainingGuesses = 10; /* Init number of guess allowed For this word */
    this.guessList = [];
    this.player = this.pickPlayer();
    this.playGame();
  };

  Hangman.App.prototype.playGame = function() {

    while (this.remainingGuesses > 0 && !this.secretWordController.isFullyRevealed()){
      console.log('Guess times: '+guessTimes+', Word length: ' + tempWordLength + ' letters long.');
      this.doOneTurn();
    }
    this.checkDone();

    return this.secretWordController.isFullyRevealed()
  };

  Hangman.lanzPlayer.prototype.doTurn = function (revealed) {
    var counts = this.counts;
    var max = _.max(this.counts);
    var bestGuesses = _.filter(this.possibleGuesses, function(possibleGuesses) {
        return counts[possibleGuesses] === max;  //Get the most frequence char
      });
    var bestGuess = _.shuffle(bestGuesses)[0]; // array[0] of freq char array

    if (this.possibleGuesses.indexOf(bestGuess) < 0) throw 'Error: you tried to guess something invalide.';
    console.log(bestGuess); return bestGuess;  //return a char
  };

  Hangman.App.prototype.doOneTurn = function () {
    var guesss = this.player.doTurn(); /* Get a most freq char */
    if (!guesss) return;
    var remaining;
    var tempWord;
    /* start guess */
    $.ajax({
        url: "http://strikingly-interview-test.herokuapp.com/guess/process",
        type: "POST",
        dataType: "json",
        data: {
            action: "guessWord",
            guess: guesss,
            userId: "YOUR_ID",
            secret: Hangman.secret
        },
        async: false,
        success: function(data, textStatus) {
            console.log("Guessing word: "+data.word + " remain time: "+data.data.numberOfGuessAllowedForThisWord);
            tempWord = data.word;
            remaining = data.data.numberOfGuessAllowedForThisWord;
            currentWord = data.word;

            if (!reg.test(data.word) || data.data.numberOfGuessAllowedForThisWord == 0) {
                guessedWordRecord += (i - 1) + ". " + data.word + "\n";
                $('#history textarea').html(guessedWordRecord);
            }
        }
    });
    this.secretWordController = new Hangman.SecretWordController(tempWord);
    var guessedAlready = this.guessedAlready(guesss);
    var matched = this.secretWordController.processGuess(guesss);
    var revealed = this.secretWordController.getRevealed();
    var message = '%c ', color = 'color:#fff;';
    
    if (guessedAlready) {
      message += 'Oops! You guessed ' + guesss + ' already. ';
      color += 'background-color:orange';
    } else if (matched) {
      message += guesss + ' was a right word ';
      color += 'background-color:green';
    } else {
      message += 'Word ' + guesss + ' is not in miss word. ';
      color += 'background-color:red';
      this.remainingGuesses = remaining;
    }

    if (true) { console.log(message, color, currentWord); }
    this.player.afterTurn(guesss, matched, revealed);
  };

  Hangman.App.prototype.checkDone = function() {
    
    if (this.secretWordController.isFullyRevealed()) {
      if (true) { console.log('The miss word is: '+currentWord); }
    } else {
      if (true) { console.log('Dones\'t know this word'); }
    }
  };

  Hangman.App.prototype.pickPlayer = function(){
    return new Hangman.lanzPlayer(this.word.length);
    var player;
    player = this.pickPlayer();
    return player;
  }

  Hangman.App.prototype.pickSecretWord = function() {
    wordsToGuess++;

    if (wordsToGuess == 79) {
        $("#mask").hide();  
    }
    $('#wordstoguess').css('display', 'block');
    $('#wordstoguess').html("Word To Guess :" + "<br>" + "<span class=\"wordstoguessNum\">" + wordsToGuess + "<\/span>");
    $("#mask").hide();
    $('#output').html("Game end!");

    var temp="";
    $.ajax({
      url: "http://strikingly-interview-test.herokuapp.com/guess/process",
        type: "POST",
        dataType: "json",
        data: {
            userId: "YOUR_ID",
            action: "nextWord",
            secret: Hangman.secret
        },
        async: false,
        success: function(data, textStatus) {
            console.log(JSON.stringify(data));
            temp = data;
            tempWordLength = data.word.length;
            guessTimes = data.data.numberOfWordsTried;
            guessRecordStr += i + ". " + data.word + "(" + data.word.length + ")" + "\n";
            $('#newWords textarea').html(guessRecordStr);
            i++;
        }
    });

    if(temp!="") {
      return temp.word;
    }
  };

  Hangman.App.prototype.guessedAlready = function(guess){
    if (this.guessList.indexOf(guess) !== -1){
      console.log(this.guessList.indexOf(guess));
      return true;
    } else {
      this.guessList.push(guess);
      return false;
    }
  };

  Hangman.SecretWordController = function (secretWord) {
    this.secretWord = secretWord;  
    this.revealedWord = secretWord.replace(/./g, '_');
  };

  Hangman.SecretWordController.prototype.getSecret = function () {
    return this.secretWord; 
  };

  Hangman.SecretWordController.prototype.getRevealed = function () {
    return this.revealedWord; 
  };

  Hangman.SecretWordController.prototype.processGuess = function (guesss) {
    if (this.secretWord.indexOf(guesss) !== -1){
      var new_word = '';
      for (var i = 0; i < this.secretWord.length; i++) {
        new_word += this.secretWord[i] === guesss ? guesss : this.revealedWord[i];
      }
      this.revealedWord = new_word;
      return true;
    } else {
      return false; 
    }
  };

  Hangman.SecretWordController.prototype.isFullyRevealed = function() {
    return this.secretWord.indexOf('*') === -1;
  }

  window.Hangman = Hangman;


