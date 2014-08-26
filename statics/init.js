		/* store total word have guessed */
  		var wordsToGuess = 0;

		$(function () {
    		$('.close').click(function() {
    			$('#notice').remove();
    		});
    	});

		function initGame() {			
		    $('#history textarea').html("");
		    $('#newWords textarea').html("");		    
		    wordsToGuess = 0;
			$.ajax({
				url: "http://strikingly-interview-test.herokuapp.com/guess/process",
				type: "POST",
				dataType: "json",
				data: {
					userId: "YOUR_ID",
		            action: "initiateGame"
				},
		        async: false,
				success: function(data, textStatus) {
					console.log(JSON.stringify(data));
					if (data.secret) {
                		$('#output').html("Get ready to start game")
            		};
					Hangman.secret = data.secret;		            
				}
			});	    
		}

		function getResult() {
			if (wordsToGuess == 80) {
				$('#wordstoguess').html("Word To Guess :" + "<br>" + "<span class=\"wordstoguessNum\">" + (wordsToGuess) + "<\/span>");
			    $.ajax({
			        url: "http://strikingly-interview-test.herokuapp.com/guess/process",
			        type: "POST",
			        dataType: "json",
			        data: {
			            action: "getTestResults",
			            userId: "YOUR_ID",
			            secret: Hangman.secret
			        },
			        success: function(data, textStatus) {
			            console.log(JSON.stringify(data));
			            $('#output').html("<br>Your Score :" + "<br>" + "<span class=\"resultScore\">" + data.data.totalScore + "<\/span>");
			        }
			    });
			} else {
				alert("You must guess at less 80 words");
			}
		}

		function submit() {
		    if (wordsToGuess == 80) {
		        $.ajax({
		            url: "http://strikingly-interview-test.herokuapp.com/guess/process",
		            type: "POST",
		            dataType: "json",
		            data: {
		                action: "submitTestResults",
		                userId: "YOUR_ID",
		                secret: Hangman.secret
		            },
		            success: function(data, textStatus) {
		                console.log(JSON.stringify(data));
		                alert("Your score have submit to server!");
		            }
		        });
		    } else {
		        alert("You must guess at less 80 words");
		    }
		}

		function startgame() {			
			initGame();
			var app = new Hangman.App({ });
			/* Guess at less 80 words */
			for (var i = 1; i < 80; i++) {
				app.reset();	
			}
		}
