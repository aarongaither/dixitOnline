const auth = (function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loginPage.cleanUpPage();
            lobbyPage.createPage();
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
            firebase.database().ref('/games').on('child_added', function(snap) {
                let gameID = snap.val().gameID;
                let gameName = snap.val().game_name;
                lobbyPage.makeGameListItem(gameName, gameID)
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
        });
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

    let _makeGame = function(name, players, rounds) {
        let userID = curUser().uid;
        let game = firebase.database().ref('/games').push()
        let gameID = game.key;
        game.set({
            gameID: gameID,
            game_name: name,
            max_players: players,
            max_rounds: rounds,
            curr_teller: userID,
            players: {
                [userID]: {
                    key: userID,
                    role: 'storyTeller',
                    dateAdded: firebase.database.ServerValue.TIMESTAMP
                }
            }
        })
        _gameInit(userID, gameID, players)
    }

    let _joinGame = function(gameID) {
        let userID = curUser().uid;
        let game = firebase.database().ref('/games/' + gameID);
        game.child("players").update({
            [userID]: {
                key: userID,
                role: 'player',
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            }
        })

        game.once('value', function(snap) {
            let players = snap.val().max_players;
            _gameInit(userID, gameID, players)
        })
    }

    let _gameInit = function(userID, gameID, players) {
        _setCurGame(userID, gameID);
        chat.setGameListener(gameID);
        lobbyPage.cleanUpPage();
        lobbyListeners('off');
        gamePage.createPage(players);
        game.startGame(gameID);
    }

    return {
        curUser: curUser,
        signout: signOut,
        signUp: signUp,
        signIn: signIn,
        errorHandler: errorHandler,
        loginListeners: loginListeners
    }
})()
