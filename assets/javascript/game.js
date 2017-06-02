let database = firebase.database();

//will hold the shuffled deck which will decrease as cards are dealt
let cardRef = database.ref("/cards");

//will hold users as they connect to the site
let userRef = database.ref("/users");
let connectedRef = database.ref(".info/connected");

//will hold all card related information
let gameRef = database.ref("/game")

//holds player's current hand
let playerHandRef = database.ref("/player_hand")

//holds player's card selection for given story prompt
let cardSelectedRef = database.ref("/card_selection")

let cards = {
    oDeck: [],
    sDeck: [],
    createDeck: function() {
        let array = [];

        for (i = 1; i < 99; i++) {
            if (i < 10) {
                array.push("card_0000" + i);
            } else {
                array.push("card_000" + i);
            }
        }
        this.oDeck = array;
        return array;
    },

    // Using the Fisher-Yates shuffle
    shuffleDeck: function(array) {
        let i = 0;
        let j = 0;
        let temp = null;
        let tArray = $.extend(true, [], array);
        
        // console.log("this is before the for loop");
        for (i = tArray.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = tArray[i];
            tArray[i] = tArray[j];
            tArray[j] = temp;
            // console.log("this is inside the for loop ", i, j)
        }
        // this.sDeck = tArray;
        cardRef.set(tArray);
        return tArray;
    },

    displaySpecificCard: function(div, array, pos) {
        $(div).empty();
        $(div).append($.cloudinary.image(array[pos] + '.jpg', { crop: 'fill' }).attr("class", "materialboxed").attr("height", "150")).attr("card-value", array[pos]);
        $(".materialboxed").materialbox();
    },

    testCards: function(div, array) {
        $(div).empty();
        for (let i = 0; i < array.length; i++) {
            $(div).append($.cloudinary.image(array[i] + '.jpg', { width: 200, height: 300, crop: 'fill' }));
        }
    }
}

let player = {
    role: "",
    key: "",
}

let game = {
    cardsCountedArray: [],
    nplayers: 0,
    stateArray: [
        0 //initial state
        , 1 //game start initial cards dealt story teller choose card
        , 2 //story teller to tell story display story to everyone
        , 3 //player card selection
        , 4 //player voting
        , 5 //player scoring
        , 6 //round ended
    ],
    currState: 0,
    //roles and players stored here.
   
    startGame: function() {
        this.startGameAssignRoles();
        cards.createDeck();
        cards.shuffleDeck(cards.oDeck);
        this.checkAndDeal(cards.sDeck, 6);
    },
    
    startGameAssignRoles: function() {
        userRef.orderByChild("dateAdded").once("value").then(function(snap) {
            let usersArray = snap.val();
            // console.log(usersArray);
            let userArrayKeys = Object.keys(usersArray);
            // console.log(userArrayKeys);

            for (i = 0; i < userArrayKeys.length; i++) {
                if (i === 0) {
                    userRef.child(userArrayKeys[i]).update({
                        role: "storyTeller"
                    })
                    gameRef.update({ curr_teller: userArrayKeys[i] });
                } else {
                    userRef.child(userArrayKeys[i]).update({
                        role: "player"
                    })
                }
            }
        })
    },

    scoring: function() {

    },

    dealingHand: function(deckArray, nCards) {
        let hand = [];

        for (let i = 0; i < nCards; i++) {
            hand.push(deckArray[0]);
            deckArray.splice(0, 1);
        }
        cardRef.set(deckArray);
        return hand;
    },

    //need to update possibly to autocheck hand limit vs. handsize
    checkAndDeal: function(deckArray, nCards) {
        userRef.once("value").then(function(snap) {
            let keysArray = Object.keys(snap.val());

            keysArray.forEach(function(key) {
                // if (playerHandRef.child(key).exists()) {
                //     cardsNeeded = playerHandRef.child(key).once("value", function(snap) {
                //         currCards = snap.val().length
                //         nCards = nCards - currCards;
                //     })
                //     let currHand = game.dealingHand(deckArray, cardsNeeded);
                //     playerHandRef.update({
                //         [key]: currHand
                //     })
                // } else {
                //     let currHand = game.dealingHand(deckArray, nCards);
                //     playerHandRef.update({
                //         [key]: currHand
                //     })
                // }
                let currHand = game.dealingHand(deckArray, nCards);
                playerHandRef.update({
                    [key]: currHand
                });
            })
            gameRef.update({
                curr_state: 1
            });
        })
    },
};

//on user connection add them to the db
connectedRef.on("value", function(snap) {
    if (snap.val()) {
        var key = userRef.push({
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }).key;

        userRef.child(key).update({
            key: key
        })

        player.key = key;
        userRef.child(key).onDisconnect().remove();
        playerHandRef.child(key).onDisconnect().remove();
        cardSelectedRef.child(key).onDisconnect().remove();
    }
});


//automatically start game when three players have joined. This will be assigned to enable the start button in the final game.
userRef.once("value", function(snap) {
    numPlayers = snap.numChildren();

    console.log("numPlayers:", numPlayers);

    if (numPlayers > 3) {
        console.log("inside the start listener if statement");
        game.startGame();
    }

})

//insures everyone has the latest shuffled deck locally. Updated as cards are dealt out.
cardRef.on("value", function(snap) {
    cards.sDeck = snap.val();
});

//add cards to player board.
playerHandRef.on("value", function(snap) {
    let playerHand = [];
    if (snap.child(player.key).exists()) {
        playerHand = snap.child(player.key).val()

        for (let i = playerHand.length - 1; i >= 0; i--) {
            cards.displaySpecificCard("#card" + i, playerHand, i)
                // console.log(playerHand[i]);
        }
        playerHandRef.off("value");
    }
})

//click listener for current story 
$("#tell-story-button").click(function(value) {
    //need unique ID in HTML for story text area    
    let currStory = $("#textarea1-z").val();
    if (player.role === "storyTeller" && game.currState === 2) {
        gameRef.update({
            curr_story: currStory
        })
        gameRef.update({
            curr_state: 3 //move onto player card selection
        })
    }
});

//click listener for cards and upload to correct location in DB
$(".modal-footer").click(function() {
    if (player.role === "storyTeller" && game.currState === 1) {
        console.log($(this).siblings(".fahad-test").attr("card-value"))
        gameRef.update({
            curr_story_card: $(this).siblings(".fahad-test").attr("card-value")
        })

        gameRef.update({
            curr_state: 2 //move onto story telling
        })
    } else if (player.role === "player" && game.currState === 3) {
        let cardSelection = $(this).siblings(".fahad-test").attr("card-value");
        let playerKey = player.key;
        cardSelectedRef.update({
            [playerKey]: cardSelection
        })

    }
})

//update curr_state in DB to 4
cardSelectedRef.on("value", function(snap) {
    let totalPlayers = game.nplayers;

    userRef.on("value", function(internalSnap) {
        totalPlayers = internalSnap.numChildren()
    });

    game.nplayers = totalPlayers;

    let currSelectedCards = snap.numChildren();

    console.log("count of total players and current selected cards", totalPlayers, currSelectedCards)
    if (totalPlayers - 1 === currSelectedCards && game.currState === 3) {
        gameRef.update({
            curr_state: 4 // move onto voting phase
        })
    };
})

//initializing to zero on refresh || might have to update if we want players to rejoin after disconnect.
gameRef.update({
    curr_state: game.currState
})

//updates state according to database value
gameRef.child("curr_state").on("value", function(snap) {
    game.currState = snap.val();
    // console.log("this is child changed log curr_state", prevKey)
})

//assigns user role to local reference
userRef.on("value", function(snap) {
    let keysArray = Object.keys(snap.val());

    for (var i = keysArray.length - 1; i >= 0; i--) {
        if (player.key === keysArray[i]) {
            player.role = snap.child(keysArray[i]).val().role
        }
    }
});

let vCards = [];
//add selected cards to the board. 
function getSelectionCards() {
    vCards = [];

    gameRef.child("curr_story_card").once("value", function(snap) {
        let tempArray = [];
        tempArray.push(snap.val());
        vCards = vCards.concat(tempArray);
    })

    cardSelectedRef.once("value", function(snap) {
        let tempArray = [];
        tempArray = Object.values(snap.val())
        vCards = vCards.concat(tempArray);
    })

}

function displayCardsVoting() {
    for (var i = vCards.length - 1; i >= 0; i--) {
        cards.displaySpecificCard("#card" + i, playerHand, i)
    }
}



// playerHandRef.on("value",function(snap) {
//     let keysArray = Object.keys(snap.val());
//     let playerHand =[];

//     for (let i = keysArray.length - 1; i >= 0; i--) {
//         if (player.key === keysArray[i]) {
//             playerHand = snap.child(keysArray[i]).val()
//             console.log("inside the if loop for the player ref hand deal", playerHand)
//             return;
//         }
//     }

//     for (let i = playerHand.length - 1; i >= 0; i--) {
//         let cardDiv = $("#dealt-card-container").append($("<div>",{"id":"card"+[i]}));
//         cards.displaySpecificCard(cardDiv, playerHand, i);
//         console.log(playerHand[i]);
//     }
// })

// function getKeyByValue(object, value) {
//   return Object.keys(object).find(key => object[key] === value);
// }
