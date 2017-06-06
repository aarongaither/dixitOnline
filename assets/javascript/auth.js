const auth = (function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loginPage.cleanUpPage();
            lobbyPage.createPage();
            chat.setGameListener('lobby')
        } else {
            lobbyPage.cleanUpPage();
            gamePage.cleanUpPage();
            loginPage.createPage();
        }
    });

    //click listener for signin form
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

    //click listener for signup form
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

    let _setupUserinDB = function(uid, name) {

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
                    displayName: name,
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

    let signOut = function () {
        firebase.auth().signOut();
    }

    let _makeGame = function(name, players, rounds) {
        let game = firebase.database().ref('/games').push()
        game.set({
            game_name: name,
            max_players: players,
            max_rounds: rounds
        })
    }

    let 

    return {
        curUser: curUser,
        signUp: signUp,
        signIn: signIn,
        errorHandler: errorHandler,
        signout: signOut
    }
})()
