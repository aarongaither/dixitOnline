const auth = (function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loginPage.cleanUpPage();
            lobbyPage.createPage();
            _setPlayerName();
            chat.setGameListener('lobby', true)
            loginListeners('off')
            lobbyListeners('on')
        } else {
            lobbyPage.cleanUpPage();
            lobbyListeners('off');
            gamePage.cleanUpPage();
            loginPage.createPage();
            loginListeners('on');
        }
    });

    let _setPlayerName = function () {
        let userID = curUser().uid;
        firebase.database().ref('/user_stats/'+userID).once('value', function(snap){
            name = snap.val().display_name
            lobbyPage.updatePlayerName(name)
        })
    }

    let loginListeners = function(method) {
        _loginBtnListener(method)
        _signupBtnListener(method)
    }

    let _loginBtnListener = function(method) {
        if (method === 'on') {
            $(document).on('click', '#submit-login', function() {
                event.preventDefault();

                //get form values
                let email = $('#user-email-login').val().trim();
                let password = $('#user-password-login').val().trim();
                console.log('submitted', email, password)

                //reset form values
                $('#user-email-login').val('')
                $('#user-password-login').val('')

                //run signIn func
                auth.signIn(email, password);
            })
        } else if (method === 'off') {
            $(document).off('click', '#submit-login')
        }
    }

    let _signupBtnListener = function(method) {
        if (method === 'on') {
            $(document).on('click', '#submit-signup', function() {
                event.preventDefault();

                //get form values
                let email = $('#user-email-signup').val().trim();
                let password = $('#user-password').val().trim();
                let password2 = $('#user-password2').val().trim();
                let name = $('#user-account').val().trim();

                //reset form values
                $('#user-email').val('')
                $('#user-password').val('')
                $('#user-password2').val('')
                $('#user-account').val('')

                if (password !== password2) {
                    auth.errorHandler('auth/passwords-dont-match')
                } else {
                    //run signUp func
                    auth.signUp(email, password, name);
                }
            })
        } else if (method === 'off') {
            $(document).off('click', '#submit-signup')
        }
    }

    let lobbyListeners = function(method) {
        _createGameBtnListener(method)
        _joinGameBtnListener(method)
        _gamesListListener(method)
    }

    let _createGameBtnListener = function(method) {
        if (method === 'on') {
            $(document).on('click', '#game-submit', function() {
                event.preventDefault();

                let gameName = $('#game-name').val().trim();
                let gamePlayers = $('#players').val().trim();
                let gameRounds = $('#rounds').val().trim();

                $('#game-name').val('')
                $('#players').val('')
                $('#rounds').val('')

                _makeGame(gameName, gamePlayers, gameRounds);
            })
        } else if (method === 'off') {
            $(document).off('click', '#game-submit')
        }
    }

    let _joinGameBtnListener = function(method) {
        if (method === 'on') {
            $(document).on('click', '.join', function() {
                let gameID = $(this).attr('gameID')
                _joinGame(gameID)
            })
        } else if (method === 'off') {
            $(document).off('click', '.join')
        }
    }

    let _gamesListListener = function(method) {
        if (method === 'on') {
            firebase.database().ref('/games').orderByChild("curr_state").equalTo(0).on('child_added', function(snap) {
                let gameID = snap.val().gameID;
                let gameName = snap.val().game_name;
                lobbyPage.makeGameListItem(gameName, gameID);
            })
        } else if (method === 'off') {
            firebase.database().ref('/games').off('child_added')
        }
    }

    let signUp = function(email, password, name) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            console.log('Auth err:', error.code, error.message)
            errorHandler(error.code);
        }).then(function(user) {
            user.updateProfile({
                displayName: name,
                // photoURL: "https://example.com/jane-q-user/profile.jpg"
            }).then(function() {
                firebase.database().ref('/user_stats/' + user.uid).set({
                    display_name: name,
                    cur_game: false,
                    games_played: 0,
                    games_won: 0,
                    points: 0
                })
            })
        });
    }

    let signIn = function(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            console.log('Auth err:', error.code, error.message);
            errorHandler(error.code);
        })
    }

    let errorHandler = function(error) {
        console.log('error handler:', error)
            //invalid-email
            //email-already-in-use
            //weak-password
            //passwords-dont-match
    }

    let curUser = function() {
        let user = firebase.auth().currentUser;
        return {
            displayName: user.displayName,
            uid: user.uid
        }
    }

    let signOut = function() {
        firebase.auth().signOut();
    }

    let _setCurGame = function(userID, gameID) {
        firebase.database().ref('/user_stats/' + userID).update({
            cur_game: gameID
        })
    }

    let _makeGame = function(gameName, players, rounds) {
        let userID = curUser().uid;
        let game = firebase.database().ref('/games').push()
        let gameID = game.key;
        let color = avatarObj.colors[0];
        let avatar = avatarObj.genAvatarURL(color)
        let name = '';
        firebase.database().ref('/user_stats/'+userID).once('value', function(snap){
            name = snap.val().display_name
        }).then(function(){
            game.set({
                gameID: gameID,
                game_name: gameName,
                max_players: players,
                max_rounds: rounds,
                curr_teller: userID,
                curr_state: 0,
                players: {
                    [userID]: {
                        key: userID,
                        role: 'storyTeller',
                        dateAdded: firebase.database.ServerValue.TIMESTAMP,
                        color: color,
                        avatar: avatar,
                        name: name
                    }
                }
            })
            _gameInit(userID, gameID, players)
        }).then(function(){
            gamePage.makeScoreboardPlayerDiv(userID, color)
            gamePage.addAvatar(name, avatar, color, userID)
            gamePage.updateGameName(gameName)
            gamePage.updateStoryteller(name);
        })
    }

    let _joinGame = function(gameID) {
        let userID = curUser().uid;
        let game = firebase.database().ref('/games/' + gameID);
        let pCount = 0;
        let color = '';
        let avatar = '';
        let name = '';
        game.child('players').once('value', function(snap){
            pCount = snap.numChildren()
            color = avatarObj.colors[pCount];
            avatar = avatarObj.genAvatarURL(color);
        }).then(function(){
            firebase.database().ref('/user_stats/'+userID).once('value', function(snap){
                name = snap.val().display_name
            }).then(function(){
                game.child('players').update({
                    [userID]: {
                        key: userID,
                        role: 'player',
                        dateAdded: firebase.database.ServerValue.TIMESTAMP,
                        color: color,
                        avatar: avatar,
                        name: name
                    }
                })
            })
        })

        game.once('value', function(snap) {
            let players = snap.val().max_players;
            // console.log("join-game", players);
            _gameInit(userID, gameID, players)
        })
    }

    let _gameInit = function(userID, gameID, players) {
        _setCurGame(userID, gameID);
        chat.setGameListener(gameID);
        lobbyPage.cleanUpPage();
        lobbyListeners('off');
        gameListeners('on', gameID);
        gamePage.createPage(players);
        game.startGame(gameID);
    }

    let gameListeners = function(method, gameID) {
        _playerJoinListener(method, gameID)
        _storyTellerChangeListener(gameID)
    }

    let _playerJoinListener = function(method, gameID) {
        let gamePlayers = firebase.database().ref('/games/' + gameID + '/players')
        if (method === 'on') {
            gamePlayers.on('child_added', function(snap) {
                _playerJoin(snap.val(),gameID)
            })
        } else if (method === 'off') {
            gamePlayers.off()
        }
    }

    let _storyTellerChangeListener = function(gameID) {        
        firebase.database().ref('/games/'+gameID+'/curr_teller').on('value', function(snap){
            let teller = snap.val();
            // console.log("storyTeller", teller);
            firebase.database().ref('/games/'+gameID+'/players/'+teller).once('value', function(snap){
                let name = snap.val().name
                console.log("storyTeller name", name);
                gamePage.updateStoryteller(name);
            })

        })
    }

    let _playerJoin = function(playerInfo, gameID) {
        let gameName;
        firebase.database().ref('/games/' + gameID).once('value', function(snap){
            gameName = snap.val().game_name
            gamePage.updateGameName(gameName)
        });
        let id = playerInfo.key;
        let avatar = playerInfo.avatar;
        let color = playerInfo.color;
        let name = playerInfo.name;
        gamePage.makeScoreboardPlayerDiv(id, color)
        gamePage.addAvatar(name, avatar, color, id)
    }

    return {
        curUser: curUser,
        signout: signOut,
        signUp: signUp,
        signIn: signIn,
        errorHandler: errorHandler,
        loginListeners: loginListeners,
        lobbyListeners: lobbyListeners,
        gameListeners: gameListeners
    }
})()
