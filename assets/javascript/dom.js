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

let lobbyPage = (function() {
    let makeLobbyPage = function() {
        let main = $('#main-board');
        $('#left-board').empty().addClass('dark-blue-background');
        $('#right-board').empty();

        main.append($('<h1>').text('Lobby'));
        let lobbyContainer = $('<div>').addClass('lobby-flex-container');
        let lobbyChatBoard = $('<div>').attr('id', 'lobby-chat-board').addClass('flex-item');
        let lobbyAside = $('<div>').attr('id', 'lobby-aside').addClass('flex-item');
        lobbyAside.append($('<div>').attr('id', 'lobby').addClass('left-align'));
        lobbyContainer.append(lobbyAside).append(lobbyChatBoard);
        main.append(lobbyContainer);

        let createBtn = $('<button>').attr('id', 'create-game-btn').attr('value', 'Submit').attr('class', '').text('Create New Game');
        let btnWell = $('<div>').attr('class', 'well').append(createBtn);
        let gamesWell = $('<div>').attr('id', 'games-listing').attr('class', 'well');

        let gamesCollection = $('<ul>').attr('class', 'collection').attr('id', 'game-list');
        let gamesTitle = $('<h3>').text('Join a Game');

        gamesWell.append(gamesCollection).prepend(gamesTitle);

        $('#lobby').append(btnWell).append(gamesWell);

        let chatWell = $('<div>').attr('class', 'well left-align').attr('id', 'lobby-chat');
        let chatBox = $('<div>').attr('id', 'chat-box');
        let chatMsg = $('<div>').attr('id', 'chat-messages');
        let chatDiv = $('<div>');
        let chatTitle = $('<h3>').text('Chat');

        chatMsg.append(chatDiv);
        chatBox.append(chatMsg);

        chatWell.append(chatTitle).append(chatBox);

        $('#lobby-chat-board').append(chatWell);


        let chatFormDiv = $('<div>');
        let chatForm = $('<form>');
        let chatInput = $('<input>').attr('id', 'chat-input').attr('placeholder', 'Send a chat message');
        let chatSubmit = $('<input>').attr('id', 'chat-submit').attr('type', 'Submit');

        chatForm.append(chatInput).append(chatSubmit);
        chatFormDiv.append(chatForm);

        $('#lobby-chat').append(chatFormDiv);

        $(document).on('click','#create-game-btn', _gameForm);

        function _gameForm() {
            let gameFormDiv = $('<div>');
            let gameForm = $('<form>');
            let gameName = $('<input>',{
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
            let gameRounds = $('<input>',{
                id: 'rounds',
                placeholder: 'Rounds to play',
                type: 'number',
                min: '6',
                max: '10'
            })
            let gameSubmit = $('<input>').attr('id','game-submit').attr('type','Submit');

            gameForm.append(gameName).append(gamePlayers).append(gameRounds).append(gameSubmit);

            gameFormDiv.append(gameForm);
            
            btnWell.html(gameFormDiv);
        }

    }

    let cleanUpLobbyPage = function() {
        $(document).off('click', '#create-game-btn');
        $('#main-board').empty();
    }

    let makeGameButton = function(gameName, gameID) {
        let item = $('<li>').html('<div>' + gameName + '<button href="#!" class="secondary-content" gameID=' + gameID + '>Join</button></div')
            .attr('class', 'collection-item');
        $('#game-list').append(item);
    }

    return {
        createPage: makeLobbyPage,
        cleanUpPage: cleanUpLobbyPage,
        makeGameButton: makeGameButton
    }
})()

const gamePage = (function() {
    let makeGamePage = function(players) {
        let main = $('#main-board');
        $('#left-board').removeClass('dark-blue-background');
        let centerPanel = $('<div>').attr('id', 'center-panel');

        main.append(centerPanel)

        let storyText = $('<div>').attr('id', 'story-text').addClass('row');
        let storyForm = $('<form>').attr('id', 'story-form')
            .append($('<ul>').addClass('story-form-wrapper')
                .append($('<li>')
                    .append($('<input>', {
                        id: 'storyteller_story',
                        type: 'text',
                        class: 'validate'
                    }))
                ).append($('<li>')
                    .append($('<input>', {
                        type: 'submit',
                        class: 'submit'
                    }))
                )
            );

        let chosenCards = $('<div>').attr('id', 'chosen-cards').addClass('row');
        let cardPanel = $('<div>').addClass('card-panel white').attr('id', 'chosen-cards-panel');
        let givenCards = $('<div>').attr('id', 'given-cards').addClass('row');
        let chatSectionRow = $('<div>').attr('id', 'chat-section-row').addClass('row');
        let chatForm = $('<form>').addClass('col s12');
        let chatRow = $('<div>').addClass('row');

        centerPanel.append(storyText.append(storyForm));
        centerPanel.append(chosenCards.append(cardPanel));
        centerPanel.append(givenCards);
        centerPanel.append(chatSectionRow);
        createCardDivs(6);
        createCardDivs(players, 'vote')
    }

    let createCardDivs = function(qty, type) {
        let cardDiv = type ? $('#chosen-cards-panel') : $('#given-cards');
        let id = type ? 'vote-card' : 'card';
        let btnClass = type ? 'vote-card' : 'play-card';
        let btnText = type ? 'vote' : 'play';
        for (let i = 0; i < qty; i++) {
            let cardBox = $('<div>').attr('class', 'col card-stock');
            let newCard = $('<div>').attr('id', id + i).css({
                'height': '150px',
                'width': '100px',
                'border': '2px solid black'
            }).addClass('card-shadow');
            let cardSubmitBtn = $('<button>').addClass(btnClass).text(btnText);

            // newCard.attr('class', 'animated fadeInRight');
            let cards = cardBox.append(newCard).append(cardSubmitBtn);
            cardDiv.append(cards);
        }
    }

    let cleanUpGamePage = function() {
        $('#main-board').empty();
    }

    return {
        createPage: makeGamePage,
        createCardDivs: createCardDivs,
        cleanUpPage: cleanUpGamePage
    }

})()
