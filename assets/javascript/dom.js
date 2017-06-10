//states
// 0 - 6
//after login, empty and build lobby dom
//after game select, empty and build game dom

const loginPage = (function() {
    let makeLoginPage = function() {
        let main = $('#main-board');
        main.append($('<img>').attr('height', '200').attr('src', 'assets/images/dixitlogo.png'))
        main.append($('<h1>').text("Let's play Dixit"))
        main.append($('<div>').attr('id', 'player-login'))

        let signUpBtn = $('<button>').html('Sign Up').attr('id', 'sign-up-btn').attr('value', 'signup').attr('class', ' animated fadeInDownBig');
        let loginBtn = $('<button>').html('Login').attr('id', 'login-btn').attr('value', 'login');
        $('#player-login').append(signUpBtn).append('<br>').append(loginBtn);
        $(document).on('click', '#sign-up-btn', _createSignUpModal);
        $(document).on('click', '#login-btn', _createLoginModal);
    }

    let _createModal = function() {
        let modalWrapper = $('<div>').attr('id', 'modal').addClass('modal');
        $('body').append(modalWrapper);
        let well = $('<div>').attr('id', 'login-well').addClass('round-well');
        let wellOutline = $('<div>').addClass('well-outline');
        well.append(wellOutline);

        let modalContent = $('<div>').addClass('modal-content animated fadeInDown');
        modalWrapper.append(modalContent);
        modalContent.append(well);

        let modalBtn = $('<button>').addClass('close').html('x');

        modalContent.prepend(modalBtn);

        $('.close').on('click', function() {
            $('#modal').hide();
            $('#modal').remove();
        });
        $('#modal').show();
    }

    let _createSignUpModal = function() {
        _createModal();
        let formSignup = $('<form>').attr('id', 'user-signup');
        let signUpTitle = $('<h2>').html('Sign Up');

        //Sign Up Fields
        let signUpUsername = $('<input>').attr({
            class: "required",
            id: "user-account",
            name: "user-account",
            placeholder: "Username",
            type: "text",
            maxlength: '20'
        });

        let signUpEmail = $('<input>').attr({
            class: "required",
            id: "user-email-signup",
            name: "user-email-signup",
            placeholder: "Email Address",
            type: "email"
        });

        let signUpPassword = $('<input>').attr({
            class: "required",
            id: "user-password",
            name: "user-password",
            placeholder: "Password",
            type: "text",
            minlength: '6'
        })

        let signUpPassword2 = $('<input>').attr({
            class: "required",
            id: "user-password2",
            name: "user-password2",
            placeholder: "Confirm Password",
            type: "text",
            minlength: '6'
        })

        let submitSignup = $('<input>').attr({
            class: "submit-button",
            id: "submit-signup",
            name: "submit-signup",
            value: "Sign Up",
            type: "submit"
        })

        formSignup.append(signUpTitle).append(signUpUsername).append(signUpEmail).append(signUpPassword).append(signUpPassword2).append(submitSignup);

        $('.well-outline').append(formSignup);
        $('#modal').show();
    }

    let _createLoginModal = function() {
        _createModal();

        let formLogin = $('<form>').attr('id', 'user-login');
        let loginTitle = $('<h2>').html('Login');

        // Login fields            
        let loginEmail = $('<input>').attr({
            class: "required",
            id: "user-email-login",
            name: "user-email-login",
            placeholder: "Email Address",
            type: "email",
        });

        let loginPassword = $('<input>').attr({
            class: "required",
            id: "user-password-login",
            name: "user-password-login",
            placeholder: "Password",
            type: "text",
        })

        let submitLogin = $('<input>').attr({
            class: "submit-button",
            id: "submit-login",
            name: "submit-login",
            value: "Login",
            type: "submit"
        })

        formLogin.append(loginTitle).append(loginEmail).append(loginPassword).append(submitLogin);

        $('.well-outline').append(formLogin);
        $('#modal').show();
    }

    let cleanUpLoginPage = function() {
        $('#main-board').empty();
        $('#modal').remove();
        $(document).off('click', '#sign-up-btn');
        $(document).off('click', '#login-btn');
    }

    return {
        createPage: makeLoginPage,
        cleanUpPage: cleanUpLoginPage
    }
})()

const lobbyPage = (function() {
    let makeLobbyPage = function() {
        let main = $('#main-board');
        $('#left-board').empty();
        $('#right-board').empty();

        main.append($('<h1>').text('Lobby').addClass('gold'));
        let lobbyContainer = $('<div>').addClass('lobby-flex-container');
        let lobbyChatBoard = $('<div>').attr('id', 'lobby-chat-board').addClass('flex-item');
        let lobbyAside = $('<div>').attr('id', 'lobby-aside').addClass('flex-item');
        lobbyAside.append($('<div>').attr('id', 'lobby').addClass('left-align'));
        lobbyContainer.append(lobbyAside).append(lobbyChatBoard);
        main.append(lobbyContainer);

        let createBtn = $('<button>').attr('id', 'create-game-btn').attr('value', 'Submit').attr('class', 'blue-btn').text('Create New Game');
        let btnWell = $('<div>').attr('class', 'well white-transparent').append(createBtn);
        let gamesWell = $('<div>').attr('id', 'games-listing').attr('class', 'well white-transparent');

        let gamesCollection = $('<ul>').attr('class', 'collection').attr('id', 'game-list');
        let gamesTitle = $('<h5>').text('Join a Game');

        gamesWell.append(gamesCollection).prepend(gamesTitle);

        $('#lobby').append(btnWell).append(gamesWell);

        let chatWell = $('<div>').attr('class', 'well white-transparent left-align').attr('id', 'lobby-chat');
        let chatBox = $('<div>').attr('id', 'chat-box').css({'overflow-y':'scroll','height':'200px'});
        let chatMsg = $('<div>').attr('id', 'chat-messages');
        let chatTitle = $('<h5>').text('Chat');

        chatBox.append(chatMsg);
        chatWell.append(chatTitle).append(chatBox);

        $('#lobby-chat-board').append(chatWell);

        let chatFormDiv = $('<div>');
        let chatForm = $('<form>');
        let chatInput = $('<input>').attr('id', 'chat-input').attr('placeholder', 'Send a chat message');
        let chatSubmit = $('<input>').attr('id', 'chat-submit').attr('type', 'Submit').addClass('blue-btn');

        chatForm.append(chatInput).append(chatSubmit);
        chatFormDiv.append(chatForm);

        $('#lobby-chat').append(chatFormDiv);

        $(document).on('click', '#create-game-btn', _gameForm);

        function _gameForm() {
            let gameFormDiv = $('<div>');
            let gameForm = $('<form>');
            let gameName = $('<input>', {
                id: 'game-name',
                placeholder: 'Name your game',
                maxlength: '20'
            })
            let gamePlayers = $('<input>', {
                id: 'players',
                placeholder: 'Number of players',
                type: 'number',
                min: '4',
                max: '6'
            })
            let gameRounds = $('<input>', {
                id: 'rounds',
                placeholder: 'Rounds to play',
                type: 'number',
                min: '6',
                max: '10'
            })
            let gameSubmit = $('<input>').attr('id', 'game-submit').attr('type', 'Submit');

            gameForm.append(gameName).append(gamePlayers).append(gameRounds).append(gameSubmit);

            gameFormDiv.append(gameForm);

            btnWell.html(gameFormDiv);
        }

    }

    let cleanUpLobbyPage = function() {
        $(document).off('click', '#create-game-btn');
        $('#main-board').empty();
    }

    let makeGameListItem = function(gameName, gameID) {
        let item = $('<li>').html('<div>' + gameName + '<button href="#!" class="secondary-content join" gameID=' + gameID + '>Join</button></div')
            .attr('class', 'collection-item');
        $('#game-list').append(item);
    }

    return {
        createPage: makeLobbyPage,
        cleanUpPage: cleanUpLobbyPage,
        makeGameListItem: makeGameListItem
    }
})()

const gamePage = (function() {
    let makeGamePage = function(players) {
        let main = $('#main-board');
        $('#left-board').removeClass('dark-blue-background');
        let centerPanel = $('<div>').attr('id', 'center-panel');

        main.append(centerPanel)

        let storyText = $('<div>').attr('id', 'story-text').addClass('row');        

        let chosenCards = $('<div>').attr('id', 'chosen-cards').addClass('row');
        let cardPanel = $('<div>').addClass('card-panel white-transparent').attr('id', 'chosen-cards-panel');
        let givenCards = $('<div>').attr('id', 'given-cards').addClass('row');
        let chatSectionRow = $('<div>').attr('id', 'chat-section-row').addClass('row');
        let chatForm = $('<form>').addClass('col s12');
        let chatRow = $('<div>').addClass('row');
        let gameTitle = $('<h2>').html('Current Game').addClass('gold');

        centerPanel.append(gameTitle).append(storyText);
        centerPanel.append(chosenCards.append(cardPanel));
        centerPanel.append(givenCards);
        centerPanel.append(chatSectionRow);

        _makeAvatarArea();
        _endButton();
        _makeScoreBoard(players);
        _createCardDivs(6);
        _createCardDivs(players, 'vote')
    }

    let _createCardDivs = function(qty, type) {
        let cardDiv = type ? $('#chosen-cards-panel') : $('#given-cards');
        let id = type ? 'vote-card' : 'card';
        let btnClass = type ? 'vote-card' : 'play-card';
        let btnText = type ? 'vote' : 'play';
        for (let i = 0; i < qty; i++) {
            let cardBox = $('<div>').attr('class', 'col card-stock')
            let newCard = $('<div>').attr('id', id + i).attr('class', 'cards-container').addClass('card-shadow');
            let cardSubmitBtn = $('<button>').addClass(btnClass).text(btnText);

            // newCard.attr('class', 'animated fadeInRight');
            let cards = cardBox.append(newCard).append(cardSubmitBtn);
            cardDiv.append(cards);
        }
    }

    let cleanUpGamePage = function() {
        $('#left-board').empty();
        $('#main-board').empty();
        $('#right-board').empty();
    }

    let _makeAvatarArea = function() {
        let rightBoard = $('#right-board');
        rightBoard.append($('<h5>').text('Players').addClass('gold'))
        rightBoard.append($('<div>').attr('id', 'view-players'))
    }

    let addAvatar = function(name, avatar, color, id) {
            let playerName = $('<div>').addClass('player-name center').text(name);
            let playerAvatar = $('<img>').attr('src', avatar).addClass('circle responsive-img');
            let playerScore = $('<div>').text('0').addClass('animated fadeInUp points');
            let playerPoints = $('<div>').addClass('circle responsive-img total-points').append(playerScore);
            let playerCard = $('<div>').attr('id','player-card-' + id).addClass('player-card').append(playerAvatar).append(playerName).append(playerPoints);
            playerCard.css('background-color', color);
        
            $('#view-players').append(playerCard);
    }

    let _endButton = function() {
        let li = $('<li>');
        let endBtn = $('<a>').html('End Game').attr('id', 'end-game-btn').attr('value', 'endgame');
        li.append(endBtn)
        $('#right-board').append(li);
    }

    let _makeScoreBoard = function(players) {

        let _makeLines = function() {
            let ticks = $('<div>').attr('id', 'ticks')
            for (let i = 30; i >= 0; i--) {
                ticks.append($('<div>').addClass('tick').append($('<p>').text(i)))
            }
            wrapper.append(ticks)
        }

        let wrapper = $('<div>').attr('id', 'points-table-wrapper')
        let container = $('<div>').addClass('score-flex-container');
        wrapper.append(container)
        $('#left-board').append($('<h5>').text('Scoreboard').addClass('gold')).append(wrapper);

        _makeLines();
    }

    let makeScoreboardPlayerDiv = function(id, color) {
        let playerDiv = $('<div>').addClass('player-score-div').attr('id', 'score-'+id)
        let playerBar = $('<div>').addClass('player-bar')
        let playerProgress = $('<div>').addClass('player-progress').css({'height':'0px','background-color':color})
        // let playerLabel = $('<div>').addClass('player-label').text('P'+playerNum)
        $('#points-table-wrapper .score-flex-container').append(playerDiv.append(playerBar.append(playerProgress)))
    }

    let updateScore = function(id, points) {
        let elem = $('#score-'+id+' .player-progress')
        elem.height(15*points);
        $('#player-card-'+id+' .points').text(points)
    }

    let removeAnimation = function(){
        setTimeout(function(){
            $('.animated').removeClass('fadeInRight');
        }, 2000)
    }

    let updateStoryArea = function(method, curStory){ //curStory is optional
        let textArea = $('#story-text');
        textArea.empty()
        if (method === 'player') {
            textArea.append($('<h5>').text('Waiting for Story...'))
        } else if (method === 'storyTeller') {
            let storyForm = $('<form>').attr('id', 'story-form')
                .append($('<ul>').addClass('story-form-wrapper')
                    .append($('<li>')
                        .append($('<input>', {
                            id: 'storyteller-story',
                            type: 'text',
                            class: 'validate',
                            placeholder: 'Tell a story'
                        }))
                    ).append($('<li>')
                        .append($('<input>', {
                            type: 'submit',
                            class: 'submit'
                        }))
                    )
                );
            textArea.append(storyForm);
        } else if (method === 'story') {
           textArea.append($('<h5>').text('Story: '+curStory)) 
        } else if (method === 'waiting') {
            textArea.append($('<h5>').text('Waiting for enough players to join...')) 
        }
    }

    return {
        createPage: makeGamePage,
        cleanUpPage: cleanUpGamePage,
        updateScore: updateScore,
        addAvatar: addAvatar,
        makeScoreboardPlayerDiv: makeScoreboardPlayerDiv,
        removeAnimation: removeAnimation,
        updateStoryArea: updateStoryArea
    }

})()


const finalPage = (function(winner, playerArray) {
    let testUnits

    let makeFinalPage = function(winner, playerArray) {
        let results = $('<div>').attr('id', 'final-results').addClass('results-flex-container')
        $('#main-board').append($('<h1>').text('Results')).append(results)

        let winnersWell = $('<div>').attr('id','winner-div').attr('class','well flex-item');
        let scoresWell = $('<div>').attr('id','scores-div').attr('class','well');
        let scoresList = $('<ul>').attr('class','collection');
        scoresWell.append(scoresList);

        $('#final-results').append(winnersWell).append(scoresWell);

        _displayWinner(winner);
        _displayLosers(playerArray)

    }

    let _displayWinner = function(winner) {
        let trophyImage = $('<img>').attr('src', 'assets/images/trophy.jpg').width('100px');
        let x = $('<div>').html('<br>Congratulations<br> <h2>' + winner.name + '</h2>' + '<br>' + winner.score).prepend(trophyImage);
        $('#winner-div').append(x);
    }

    let _displayLosers = function(losers) {
        console.log(losers)
        for (let i = 0; i < losers.length; i++) {
            let pScore = $('<span>').html(losers[i].score).attr('class','right');
            let pName = $('<span>').html(losers[i].name).attr('class','center');
            let listItem = $('<li>').attr('class','collection-item avatar');
            let listImg = $('<img>').attr('src', avatarObj.genAvatarURL(playerColors[i])).attr('class','circle');
            listItem.append(listImg).append(pScore).append(pName);
            $('#scores-div .collection').append(listItem);
        };
    }

    let cleanUpFinalPage = function() {
        $('#left-board').empty();
        $('#main-board').empty();
        $('#right-board').empty();
    }

    return {
        createPage: makeFinalPage,
        cleanUpPage: cleanUpFinalPage
    }
})()

let testSet = {
    winner : {
        name: 'Margaret',
        score: 32
    },
    losers : [{
        name: 'Aaron',
        score: 20
    },{
        name: 'Fahad',
        score: 27
    },{
        name: 'Mike',
        score: 18
    },{
        name: 'Lina',
        score: 25
    }]
}