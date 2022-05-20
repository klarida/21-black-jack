var game = {

    defaults: {
      baseURL: 'https://deckofcardsapi.com/api/deck/',
      aces: 'low',
      winningScore: 21,
      cardValue: {
        'ACE': 1,
        'JACK': 10,
        'QUEEN': 10,
        'KING': 10
      },
      currentDeck: null
    },
  
    init() {
      game.generateNewDeck();
      game.setAceValue(game.defaults.aces);
      game.setAceCheckedState(game.defaults.aces);
    },
  
    resetGame() {
      $('.card:not(.back)').remove();
      $('#p1score').html(0);
      $('#p2score').html(0);
      $('#result').html('');
  
      game.shuffleDeck(game.defaults.currentDeck);
    },
  
    setAceCheckedState(aceType) {
      $('input[value="' + aceType + '"]').prop("checked", true);
    },
  
    setAceValue(aceType) {
      var aceValue = aceType === 'high' ? 11 : 1;
      game.defaults.cardValue['ACE'] = aceValue;
      return aceValue;
    },
  
    // Generate a new deck
    // https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1
    generateNewDeck() {
      $.ajax({
        type: 'GET',
        // url: game.defaults.baseURL + 'new/', // Unshuffled new deck
        url: game.defaults.baseURL + 'new/shuffle/?deck_count=1', // Shuffled new deck
        success(data) {
          game.defaults.currentDeck = data;
          game.updateDeckDetails(game.defaults.currentDeck);
        }
      });
      return game.defaults.currentDeck;
    },
  
    // Shuffle the current deck
    // https://deckofcardsapi.com/api/deck/<<deck_id>>/shuffle/
    shuffleDeck(currentDeck) {
      $.ajax({
        url: game.defaults.baseURL + '/' + currentDeck.deck_id + '/shuffle/',
        type: 'GET',
        error() {
          console.log('An error has occurred');
        },
        success(data) {
          game.defaults.currentDeck = data;
          game.updateDeckDetails(game.defaults.currentDeck);
        }
      });
      return game.defaults.currentDeck;
    },
  
    // Draw two cards
    // https://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=2
    dealCards(currentDeck, count) {
      var shuffleStatus = currentDeck.shuffled;
      $.ajax({
        url: game.defaults.baseURL + '/' + currentDeck.deck_id + '/draw/?count=' + count,
        type: 'GET',
        error() {
          console.log('An error has occurred');
        },
        success(data) {
          game.defaults.currentDeck = data;
          game.defaults.currentDeck.shuffled = shuffleStatus; // Add shuffled status to currentDeck object
          game.updateDeckDetails(game.defaults.currentDeck);
          game.placeCards(game.defaults.currentDeck);
        }
      });
      return game.defaults.currentDeck;
    },
  
    // Update the deck details panel
    updateDeckDetails(currentDeck) {
      var shuffledStatus = game.defaults.currentDeck.shuffled ? 'Shuffled' : 'Not Shuffled';
  
      $('#deck').text(game.defaults.currentDeck.deck_id);
      $('#remaining').text(game.defaults.currentDeck.remaining);
      $('#shuffled').text(shuffledStatus);
    },
  
    getCardValue(card) {
      let cardValueMatch = Object.keys(game.defaults.cardValue).find(key => key === card.value)
  
      return cardValueMatch ? game.defaults.cardValue[cardValueMatch] : Number(card.value);
    },
  
    updateScore(playerScore, score) {
      var currentScore = parseInt(playerScore.html(), 10);
      var newScore = currentScore + score;
      return newScore;
    },
  
    announceWinner(p1, p2) {
      var resultPanel = $('#result');
      var topScore = game.defaults.winningScore; // 21
  
      if ((p1 === topScore && p2 === topScore) || (p1 > topScore && p2 > topScore)) {
        resultPanel.html("<p>Draw</p>");
      } else if (p1 > topScore || p2 === topScore) {
        resultPanel.html("<p>Player 2 Wins</p>")
      } else if (p2 > topScore || p1 === topScore) {
        resultPanel.html("<p>Player 1 Wins</p>")
      }
    },
  
    placeCards(currentDeck) {
      var player1 = game.defaults.currentDeck.cards[0];
      var player2 = game.defaults.currentDeck.cards[1];
  
      var p1Score = game.updateScore($('#p1score'), game.getCardValue(player1));
      var p2Score = game.updateScore($('#p2score'), game.getCardValue(player2));
  
      $('<div class="card">').append($('<img>').attr('src', player1.image)).appendTo($('#p1card'));
  
      $('<div class="card">').append($('<img>').attr('src', player2.image)).appendTo($('#p2card'));
  
      $('#p1score').html(p1Score);
      $('#p2score').html(p2Score);
  
      game.announceWinner(p1Score, p2Score);
    }
  };
  
  $(document).ready(function($) {
    // Init
    game.init();
  
    // New deck button
    $('#newDeck').click(function() {
      game.generateNewDeck();
    })
  
    // Shuffle deck button
    $('#shuffleDeck').click(function() {
      game.shuffleDeck(game.defaults.currentDeck);
    })
  
    // Draw two cards button
    $('#dealCards').click(function() {
      if (($('#p1score').html() < game.defaults.winningScore) && ($('#p2score').html() < game.defaults.winningScore)) {
        game.dealCards(game.defaults.currentDeck, 2);
      }
    })
  
    // Clear Board
    $('#resetGame').click(function() {
      game.resetGame();
    })
  
    // Change Ace value
    $("input[name='acesRadio']").change(function(e) {
      game.setAceValue(this.value);
    });
  });