const auth = (function() {
    let userName;
    let uid;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            //run login func here
            console.log('user logged in:', user.displayName)
        }
    });

    let _setupUserinDB = function (uid, name) {
        
    }

    let signUp = function(email, password, name) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            console.log('Auth err:', error.code, error.message)
            errorHandler(error.code);
        }).then(function(user) {
            if (user) {
                user.updateProfile({
                    displayName: name,
                    // photoURL: "https://example.com/jane-q-user/profile.jpg"
                }).then(function() {
                    console.log('new user created:', user.displayName)
                })
            }
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
            displayName : user.displayName,
            uid : user.uid
        }
    }

    return {
        curUser : curUser,
        signUp : signUp,
        signIn : signIn,
        errorHandler : errorHandler
    }
})()

const authClickHandler = (function() {
    //click listener for signin form
    $(document).on('click', '#sign-up', function() {
        event.preventDefault();

        //get form values
        let email = $('#user-email').val().trim();
        let password = $('#user-password').val().trim();
        let password2 = $('#user-password2').val().trim();
        let name = $('#user-account').val().trim();
        console.log('submitted', email, password, name);

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

    //click listener for signin form
    $(document).on('click', '#sign-in', function() {
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
})()