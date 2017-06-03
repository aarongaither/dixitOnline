const chat = (function() {
    let gameID = 'lobby';
    let db = firebase.database().ref('/' + gameID + '/chat');
    let initialDataLoaded = false;

    let _validChat = (msg) => {
        return msg !== '' && msg.length < 144 ? true : false }

    let _postChat = function(name, msg) {
        let chat = db.push();
        chat.set({
            name: name,
            msg: msg
        })
    }

    let _makeChatLine = function(name, msg) {
        let msgDiv = $('<div>').html('<span class="chat-name">' + name + ': </span>' + msg);
        $('#chat-messages').append(msgDiv);
        $('#chat-messages').scrollTop($('#chat-messages')[0].scrollHeight);
    }

    let _setDataLoaded = function() {
        //turn on toast for future messages
        db.once('value', function(snap) {
            initialDataLoaded = true;
        });
    }

    let _setDBListener = function() {
        //load relevant chats on page load and listen for future changes
        db.on('child_added', function(snap) {
            let name = snap.val().name;
            let msg = snap.val().msg;
            _makeChatLine(name, msg);
            //dont trigger toast for initial page load chats
            if (initialDataLoaded) {
                Materialize.toast(msg, 3000, 'rounded')
            }
        })
    }

    let setGameListener = function(newID) {
        db.off('child_added');
        initialDataLoaded = false;
        gameID = newID;
        db = firebase.database().ref('/' + gameID + '/chat');
        _setDBListener();
        _setDataLoaded();
    }

    let getGameID = () => {
        return gameID }

    let getDBPath = () => {
        return db }

    let clearChats = () => { $('#chat-messages').empty(); }

    let loadChats = function() {
        db.once('value', function(snap) {
            let name = snap.val().name;
            let msg = snap.val().msg;
            _makeChatLine(name, msg);
        })
    }

    $(document).on('click', '#chat-submit', function() {
        event.preventDefault();
        let msg = $('#chat-input').val().trim();
        if (_validChat(msg)) {
            let name = auth.curUser().displayName;
            _postChat(name, msg)
        }
        $('#chat-input').val('');
    })

    //load lobby listener by default
    _setDBListener();
    _setDataLoaded();

    return {
        getDBPath: getDBPath,
        getGameID: getGameID,
        setGameListener: setGameListener,
        loadChats: loadChats,
        clearChats: clearChats
    }

})()
