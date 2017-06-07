let database = firebase.database();

//will hold the shuffled deck which will decrease as cards are dealt
let cardRef = database.ref("/game/cards");

//will hold users as they connect to the site
let userRef = database.ref("/game/users");
let connectedRef = database.ref(".info/connected");

//will hold all card related information
let gameRef = database.ref("/game")

//holds player's current hand
let playerHandRef = database.ref("/game/player_hand")

//holds player's card selection for given round
let cardSelectedRef = database.ref("/game/card_selection")

//holds player's vote select for a given round
let voteSelectedRef = database.ref("/game/vote_selection")

let cards = {
    oDeck: [], //original deck
    sDeck: [], //shuffled deck
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
        $(div).append($.cloudinary.image(array[pos] + '.jpg', { crop: 'fill' }).attr("class", "materialboxed round-card").attr("height", "150")).attr("card-value", array[pos]);
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
    selectedCard: ""
}

let game = {
    cardsCountedArray: [],
    nPlayers: 0,
    nHandSize: 6,
    maxPlayers: 4,
    maxRounds: 2,
    stateArray: [
        0 //initial state
        , 1 //game start initial cards dealt story teller choose card
        , 2 //story teller to tell story display story to everyone
        , 3 //player card selection
        , 4 //player voting
        , 5 //player scoring
        , 6 //round ended
        , 7 //game end
    ],
    currState: 0,
    //roles and players stored here.

    startGame: function() {
        this.startGameAssignRoles();
        cards.createDeck();
        cards.shuffleDeck(cards.oDeck);
        this.checkAndDeal(cards.sDeck);
    },

    startGameAssignRoles: function() {
        userRef.orderByChild("dateAdded").once("value").then(function(snap) {
            let usersArray = snap.val();
            // console.log(usersArray);
            let userKeyArray = Object.keys(usersArray);
            // console.log(userKeyArray);

            gameRef.update({ curr_play_order: userKeyArray });

            for (i = 0; i < userKeyArray.length; i++) {
                if (i === 0) {
                    userRef.child(userKeyArray[i]).update({
                        role: "storyTeller"
                    })
                    gameRef.update({ curr_teller: userKeyArray[i] });
                } else {
                    userRef.child(userKeyArray[i]).update({
                        role: "player"
                    })
                }
            }
        })
    },

    scoring: function(selectionObj, votingObj) {
        if (player.role === "storyTeller") {
            let currStoryCard = selectionObj[player.key];
            let vCardArray = Object.values(votingObj);
            let vCardCountObj = vCardArray.reduce(function(allVotes, card) {
                if (card in allVotes) {
                    allVotes[card]++;
                } else {
                    allVotes[card] = 1;
                }
                return allVotes;
            }, {});
            let nCorrectGuesses = vCardCountObj[currStoryCard];
            let nGuessingPlayers = game.nPlayers - 1;

            // console.log("scoring variables", currStoryCard, vCardArray, vCardCountObj, nCorrectGuesses, nGuessingPlayers);

            switch (true) {
                //everyone guesses correctly;
                case (nGuessingPlayers === nCorrectGuesses):
                    console.log("everyone guessed the storyTeller's card");
                    userRef.once("value", function(snap) {
                        userKeyArray = Object.keys(snap.val())
                        for (let i = userKeyArray.length - 1; i >= 0; i--) {
                            if (snap.val()[userKeyArray[i]].role === "player") {
                                let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                                currScore += 2;
                                userRef.child(userKeyArray[i]).update({
                                    curr_score: currScore
                                })
                            } else {
                                let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                                currScore += 0;
                                userRef.child(userKeyArray[i]).update({
                                    curr_score: currScore
                                })
                            }
                        }
                    });
                    break;
                    //only some of the people guessed the storytellers card
                case (nCorrectGuesses > 0 && nGuessingPlayers > nCorrectGuesses):
                    console.log("not everyone guessed the storyTeller's card");
                    userRef.once("value", function(snap) {
                        userKeyArray = Object.keys(snap.val())
                        for (let i = userKeyArray.length - 1; i >= 0; i--) {
                            if (snap.val()[userKeyArray[i]].role === "storyTeller") {
                                let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                                currScore += 3;

                                // console.log("storyTeller before upload", userKeyArray[i], currScore);
                                userRef.child(userKeyArray[i]).update({
                                    curr_score: currScore
                                })
                            } else if (snap.val()[userKeyArray[i]].role === "player") {
                                let userCard = selectionObj[userKeyArray[i]];
                                let nTricked = vCardCountObj[userCard] || 0;
                                let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                                let userGuess = votingObj[userKeyArray[i]];
                                if (userGuess === currStoryCard) {
                                    currScore += 3;
                                }
                                currScore += nTricked;
                                // console.log("player before upload", userKeyArray[i], currScore);
                                userRef.child(userKeyArray[i]).update({
                                    curr_score: currScore
                                })
                            }
                        }
                    });
                    break;
                    //no correct guesses
                default:
                    console.log("noone guessed the storyTeller's card")
                    userRef.once("value", function(snap) {
                        userKeyArray = Object.keys(snap.val())
                        for (let i = userKeyArray.length - 1; i >= 0; i--) {
                            if (snap.val()[userKeyArray[i]].role === "player") {
                                let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                                currScore += 2;
                                userRef.child(userKeyArray[i]).update({
                                    curr_score: currScore
                                })
                            } else {
                                let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                                currScore += 0;
                                userRef.child(userKeyArray[i]).update({
                                    curr_score: currScore
                                })
                            }
                        }
                    });
                    break;
            }
            gameRef.update({
                curr_state: 6 //end of the round
            })
        }
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
    checkAndDeal: function(deckArray) {
        userRef.once("value").then(function(snap) {
            let userKeyArray = Object.keys(snap.val());

            userKeyArray.forEach(function(key) {
                playerHandRef.child(key).once("value", function(snap) {
                        let currHand = [];
                        let nCardsNeeded = game.nHandSize;
                        if (snap.exists()) {
                            let currHandSize = snap.val().length;
                            currHand = snap.val();
                            nCardsNeeded = nCardsNeeded - currHandSize;
                            console.log("in the if statement for check and deal", currHand, nCardsNeeded)
                        }
                        currHand = currHand.concat(game.dealingHand(deckArray, nCardsNeeded));
                        playerHandRef.update({
                            [key]: currHand
                        });
                    })
                    // console.log("inside the for each statement in check and deal", key)
            })
            gameRef.update({
                curr_state: 1 //game start
            });
        })
    },

    removeCard: function(player, card) {
        playerHandRef.child(player).once("value", function(snap) {
            let currHand = snap.val();
            currHand.splice(currHand.indexOf(card), 1);
            playerHandRef.child(player).set(currHand);
        })
    },

    playOrderUpdate: function(playerArray) {
        if (player.role === "storyTeller") {
            let tempArray = playerArray;

            tempArray.push(tempArray.shift());
            playerArray = tempArray;
            return playerArray;
        }
    },

    roundEndAssignRoles: function() {
        let newPlayOrder = [];
        gameRef.child("curr_play_order").once("value", function(snap) {
            newPlayOrder = snap.val();

            for (let i = newPlayOrder.length - 1; i >= 0; i--) {
                userRef.once("value", function(innerSnap) {
                    let userKeyArray = Object.keys(innerSnap.val());

                    // console.log("REAR first for loop", i)
                    // console.log("REAR second keys", userKeyArray)

                    for (let j = userKeyArray.length - 1; j >= 0; j--) {

                        // console.log("REAR second for loop", i, j)
                        // console.log("REAR second keys", userKeyArray[j], newPlayOrder[i])

                        if (userKeyArray[j] === newPlayOrder[i]) {
                            // console.log("REAR inside the if loop")
                            if (i === 0) {
                                userRef.child(userKeyArray[j]).update({
                                    role: "storyTeller"
                                })
                                gameRef.update({
                                    curr_teller: userKeyArray[j]
                                })

                            } else {
                                userRef.child(userKeyArray[j]).update({
                                    role: "player"
                                })
                            }
                            return;
                        }
                    }

                })
            }

        })
    }
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
        voteSelectedRef.child(key).onDisconnect().remove();
    }
});


//automatically start game when three players have joined. This will be assigned to enable the start button in the final game.
userRef.once("value", function(snap) {
    let numPlayers = snap.numChildren();

    console.log("numPlayers:", numPlayers);

    if (numPlayers >= game.maxPlayers) {
        // console.log("inside the start listener if statement");
        game.startGame();
    }

})

gameRef.once("value", function(snap) {
    game.maxPlayers = snap.val().max_players || 4;
    game.maxRounds = snap.val().max_rounds || 2;

    //Start Game
    userRef.once("value", function(userSnap) {
        let numPlayers = userSnap.numChildren();

        if (numPlayers >= game.maxPlayers) {
            game.startGame();
        }
    })
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

            let delay = i * 100;

            setTimeout(function() {
                cards.displaySpecificCard("#card" + i, playerHand, i)
                    // console.log(playerHand[i]);
            }, delay)
        }

        playerHandRef.off("value");
    }
})

//click listener for current story 
$("#tell-story-button").click(function(value) {
    //need unique ID in HTML for story text area    
    let currStory = $("#textarea1-z").val().trim();
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
        // console.log($(this).siblings(".fahad-test").attr("card-value"))
        let cardSelection = $(this).siblings(".fahad-test").attr("card-value");
        gameRef.update({
            curr_story_card: cardSelection
        })
        gameRef.update({
            curr_state: 2 //move onto story telling
        })

        //removing card from DOM
        $(this).parent().remove();

        //removing card from firebaseDB
        game.removeCard(player.key, cardSelection);

    } else if (player.role === "player" && game.currState === 3) {
        let cardSelection = $(this).siblings(".fahad-test").attr("card-value");
        let playerKey = player.key;
        cardSelectedRef.update({
            [playerKey]: cardSelection
        })
        player.selectedCard = cardSelection;

        //removing card from DOM
        $(this).parent().remove();

        //removing card from firebaseDB
        game.removeCard(playerKey, cardSelection);

    } else if (player.role === "player" && game.currState === 4) {
        let cardSelection = $(this).siblings(".fahad-test").attr("card-value");
        let playerKey = player.key;
        if (cardSelection != player.selectedCard) {
            // console.log("inside the voting if statement");
            voteSelectedRef.update({
                [playerKey]: cardSelection
            })
        }
    }
})

//update curr_state in DB to 4
cardSelectedRef.on("value", function(snap) {
    let totalPlayers = game.nPlayers;
    let currSelectedCards = snap.numChildren();

    userRef.on("value", function(internalSnap) {
        totalPlayers = internalSnap.numChildren()
    });

    game.nPlayers = totalPlayers;

    // console.log("count of total players and current selected cards", totalPlayers, currSelectedCards)
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

//display selected cards in voting section||state change listener
gameRef.child("curr_state").on("value", function(snap) {
    let vCardsObj = {};
    let sCardsObj = {};
    let currState = snap.val();
    let sCardsArray = [];

    switch (currState) {
        case 4: //state 4 is the start of the voting stage
            // console.log("current state", currState)
            gameRef.child("curr_story_card").once("value", function(snap) {
                let tempArray = [];
                tempArray.push(snap.val());
                sCardsArray = sCardsArray.concat(tempArray);
            }).then(function() {
                cardSelectedRef.once("value", function(snap) {
                    let tempArray = [];
                    tempArray = Object.values(snap.val())
                    sCardsArray = sCardsArray.concat(tempArray);
                })
            }).then(function() {
                //shuffle for each player differently - to make consistent have to push to DB and pull down.
                // sCardsArray = cards.shuffleDeck(sCardsArray);
                for (let i = sCardsArray.length - 1; i >= 0; i--) {
                    cards.displaySpecificCard("#scard" + i, sCardsArray, i)
                }
            })
            break;
        case 5: //state of is the start of the scoring stage
            voteSelectedRef.once("value", function(snap) {
                vCardsObj = snap.val();
            }).then(function() {
                gameRef.once("value", function(snap) {
                    sCardsObj = {
                        [snap.val().curr_teller]: snap.val().curr_story_card
                    }
                }).then(function() {
                    cardSelectedRef.once("value", function(snap) {
                            sCardsObj = $.extend({}, sCardsObj, snap.val());
                        })
                        // console.log("State = 5", vCardsObj, sCardsObj)
                    if (player.role === "storyTeller") {
                        game.scoring(sCardsObj, vCardsObj);
                    }
                })
            })
            break;
        case 6: //round end restart round
            gameRef.once("value", function(snap) {
                let roundNum = snap.child("curr_round").val() || 1;
                let maxRounds = snap.child("max_rounds").val() || game.maxRounds;

                console.log(maxRounds, roundNum);

                if (maxRounds === roundNum) {
                    gameRef.update({
                        curr_state: 7
                    })
                } else {

                    if (player.role === "storyTeller") {
                        gameRef.once("value", function(snap) {
                            let currPlayOrder = snap.child("curr_play_order").val();
                            let newPlayOrder = game.playOrderUpdate(currPlayOrder);
                            let currRound = snap.val().curr_round || 0;

                            currRound++;

                            gameRef.update({
                                curr_play_order: newPlayOrder,
                                curr_state: 1,
                                curr_round: currRound
                            })
                        }).then(function() {
                            cardSelectedRef.remove();
                            voteSelectedRef.remove();
                            game.roundEndAssignRoles();
                        })
                    }
                }
            })
            break;
        case 7:
            break;
    }
})

//check to see if everyone has voted and change state to scoring
voteSelectedRef.on("value", function(snap) {
    let totalPlayers = game.nPlayers;
    let currSelectedCards = snap.numChildren();

    userRef.on("value", function(internalSnap) {
        totalPlayers = internalSnap.numChildren()
    });

    game.nPlayers = totalPlayers;

    // console.log("count of total players and current selected cards", totalPlayers, currSelectedCards)
    if (totalPlayers - 1 === currSelectedCards && game.currState === 4) {
        gameRef.update({
            curr_state: 5 // move onto scoring phase
        })
    };
})



//get the information for scoring

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
