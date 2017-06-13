let database = firebase.database();
let mainGameRef = database.ref("/games")
    //will hold specific game information
let gameRef = "";
//will hold the shuffled deck which will decrease as cards are dealt
let cardRef = "";
//will hold the used cards
let usedCardRef = "";
//will hold users as they connect to the site
let userRef = "";
// let connectedRef = database.ref(".info/connected");

//holds player's current hand
let playerHandRef = "";
//holds player's card selection for given round
let cardSelectedRef = "";
//holds player's vote select for a given round
let voteSelectedRef = "";

let cards = {
    oDeck: [], //original deck
    sDeck: [], //shuffled deck
    createDeck: function() {
        let array = [];
        for (i = 1; i < 20; i++) { //original deck size98
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

    displaySpecificCard: function(div, array, pos, height) {
        $(div).empty();
        $(div).append($.cloudinary.image(array[pos] + '.jpg', { crop: 'fill' }).attr("class", "materialboxed round-card animated fadeInRight").attr("height", height)).attr("card-value", array[pos]);
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
    selectedCard: "",
    selectedCardDiv: ""
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

    startGame: function(gameID) {
        // console.log("startGame");
        //setting the ref to the particular instance of a game
        gameRef = database.ref("/games/" + gameID);
        cardRef = gameRef.child("cards");
        usedCardRef = gameRef.child("used_cards");
        userRef = gameRef.child("players");
        playerHandRef = gameRef.child("player_hand")
        cardSelectedRef = gameRef.child("card_selection")
        voteSelectedRef = gameRef.child("vote_selection")
        gamePage.updateStoryArea("waiting");
        gameRef.once("value", function(snap) {
            game.maxPlayers = parseInt(snap.val().max_players, 10) || 4;
            game.maxRounds = parseInt(snap.val().max_rounds, 10) || 2;
            //Start Game
            userRef.on("value", function start(userSnap) {
                let numPlayers = userSnap.numChildren();
                if (numPlayers === game.maxPlayers) {
                    game.initGameListeners();
                    if (player.role === "storyTeller") {
                        cards.createDeck();
                        cards.shuffleDeck(cards.oDeck);
                        game.startGameAssignRoles();
                    }
                    game.checkAndDeal(cards.sDeck);
                    // game.storyBoardUpdateListener(player.role);
                    userRef.off("value", start)
                    gameRef.update({
                        curr_state: 1
                    })
                }
            })
        })

        player.key = firebase.auth().currentUser.uid;
        //remove from DB on disconnect
        // userRef.child(key).onDisconnect().remove();
        // playerHandRef.child(key).onDisconnect().remove();
        // cardSelectedRef.child(key).onDisconnect().remove();
        // voteSelectedRef.child(key).onDisconnect().remove();
    },

    startGameAssignRoles: function() {
        // console.log("startGameAssignRoles")
        userRef.orderByChild("dateAdded").once("value").then(function(snap) {
            let userKeyArray = [];
            snap.forEach(function(child) {
                userKeyArray.push(child.val().key)
            })
            gameRef.update({ curr_play_order: userKeyArray });
            // console.log(userKeyArray)
        })
    },

    scoring: function(selectionObj, votingObj) {
        if (player.role === "storyTeller") {
            console.log("selectionObj", selectionObj);
            console.log("votingObj", votingObj);
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
            console.log("scoring variables", currStoryCard, vCardArray, vCardCountObj, nCorrectGuesses, nGuessingPlayers);
            if (nGuessingPlayers === nCorrectGuesses) { //everyone guesses correctly;
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
            } else if (nCorrectGuesses > 0 && nGuessingPlayers > nCorrectGuesses) { //only some of the people guessed the storytellers card
                console.log("not everyone guessed the storyTeller's card");
                userRef.once("value", function(snap) {
                    userKeyArray = Object.keys(snap.val())
                    for (let i = userKeyArray.length - 1; i >= 0; i--) {
                        if (snap.val()[userKeyArray[i]].role === "storyTeller") {
                            let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                            currScore += 3;
                            console.log("storyTeller before upload", userKeyArray[i], currScore);
                            userRef.child(userKeyArray[i]).update({
                                curr_score: currScore
                            })
                        } else if (snap.val()[userKeyArray[i]].role === "player") {
                            let userCard = selectionObj[userKeyArray[i]];
                            let nTricked = vCardCountObj[userCard] || 0;
                            let currScore = snap.val()[userKeyArray[i]].curr_score || 0;
                            let userGuess = votingObj[userKeyArray[i]];
                            console.log("userCard|nTricked|currScore|userGuess", userCard, nTricked, currScore, userGuess)
                            if (userGuess === currStoryCard) {
                                currScore += 3;
                            }
                            currScore += nTricked;
                            console.log("player before upload", userKeyArray[i], currScore);
                            userRef.child(userKeyArray[i]).update({
                                curr_score: currScore
                            })
                        }
                    }
                });
            } else {
                //no correct guesses
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
            }
        }
        gameRef.update({
            curr_state: 6 //end of the round
        })
    },

    dealnCards: function(deckArray, nCards) {
        let hand = [];
        for (let i = 0; i < nCards; i++) {
            hand.push(deckArray[0]);
            deckArray.splice(0, 1);
        }
        cardRef.set(deckArray);
        return hand;
    },

    dealPlayerHand: function() {
        // console.log("dealPlayerHand")
        playerHandRef.on("value", function(snap) {
            let playerHand = [];
            if (snap.child(player.key).exists()) {
                // console.log("inside dealPlayerHand if statement")
                playerHand = snap.child(player.key).val()
                for (let i = playerHand.length - 1; i >= 0; i--) {
                    let delay = i * 100;
                    setTimeout(function() {
                        cards.displaySpecificCard("#card" + i, playerHand, i, "120")
                            // console.log(playerHand[i]);
                    }, delay)
                }
                playerHandRef.off("value");
            }
        })
    },

    checkAndDeal: function(deckArray) {
        // console.log("checkAndDeal");
        if (player.role === "storyTeller") {
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
                                // console.log("in the if statement for check and deal", currHand, nCardsNeeded)
                            }
                            currHand = currHand.concat(game.dealnCards(deckArray, nCardsNeeded));
                            playerHandRef.update({
                                [key]: currHand
                            });
                        })
                        // console.log("inside the for each statement in check and deal", key)
                })
            })
        }
        let currCards = $("#given-cards").children().length || 0
            // console.log("currCards", currCards);
            // gamePage.createCardDivs(game.nHandSize - currCards);
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

        }).then(function() {
            gameRef.update({
                curr_state: 1,
            })
        })
    },

    userStatUpdate: function(userID) {
        let userStatRef = firebase.database().ref("/user_stats")
        let currGamePoints = 0;

        userRef.child(userID).once("value", function(snap) {
            currGamePoints = snap.val().curr_score;
            console.log("currGamePoints", currGamePoints)
        }).then(function() {
            userStatRef.child(userID).once("value", function(snap) {
                let gamesPlayed = snap.val().games_played;
                let totalPoints = snap.val().points;
                gamesPlayed++;
                totalPoints += currGamePoints;
                console.log("gamesPlayed|totalPoints|currGamePoints", gamesPlayed, totalPoints, currGamePoints)
                userStatRef.child(userID).update({
                    games_played: gamesPlayed,
                    points: totalPoints
                })
            })
        })
    },

    initGameListeners: function() {
        if (game.currState === 0) {
            // console.log("initGameListeners");
            this.updateLocalDeckListener();
            this.updateLocalStateListener();
            this.updateLocalPlayerRoleListener();
            this.stateChangeListener();
        }
    },

    updateLocalDeckListener: function() {
        //insures everyone has the latest shuffled deck locally. Updated as cards are dealt out.
        // console.log("updateLocalDeckListener");
        cardRef.on("value", function(snap) {
            cards.sDeck = snap.val();
        });
    },

    updateLocalStateListener: function() {
        // //initializing to zero on refresh || might have to update if we want players to rejoin after disconnect.
        // gameRef.update({
        //     curr_state: game.currState
        // });
        //updates state according to database value
        // console.log("updateLocalStateListener");
        gameRef.child("curr_state").on("value", function(snap) {
            game.currState = snap.val();
            // console.log("this is child changed log curr_state", prevKey)
        });
    },

    updateLocalPlayerRoleListener: function() {
        //assigns user role to local reference
        // console.log("updateLocalPlayerRoleListener");
        userRef.on("value", function(snap) {
            let keysArray = Object.keys(snap.val());
            for (var i = keysArray.length - 1; i >= 0; i--) {
                if (player.key === keysArray[i]) {
                    player.role = snap.child(keysArray[i]).val().role
                }
            }
        });
    },

    storyBoardUpdateListener: function(method, currStory) {
        switch (player.role) {
            case "storyTeller":
                gamePage.updateStoryArea(method, currStory);
                game.storyClickListener();
                break;
            case "player":
                gamePage.updateStoryArea(method, currStory);
                break;
        }
    },

    cardSelectionCompletionListener: function() {
        //update curr_state in DB to 4 after everyone has selected a card
        // console.log("cardSelectionCompletionListener");
        cardSelectedRef.on("value", function(snap) {
            let totalPlayers = game.nPlayers;
            let currSelectedCards = snap.numChildren();
            userRef.once("value", function(internalSnap) {
                totalPlayers = internalSnap.numChildren()
            });
            game.nPlayers = totalPlayers;
            // console.log("count of total players and current selected cards", totalPlayers, currSelectedCards)
            if (totalPlayers - 1 === currSelectedCards && game.currState === 3) {
                gameRef.update({
                        curr_state: 4 // move onto voting phase
                    })
                    // cardSelectedRef.off("value");
            };
        });
    },

    voteSelectionCompletionListener: function() {
        //check to see if everyone has voted and change state to 5 for scoring
        // console.log("voteSelectionCompletionListener");
        voteSelectedRef.on("value", function(snap) {
            let totalPlayers = game.nPlayers;
            let currSelectedCards = snap.numChildren();
            userRef.once("value", function(internalSnap) {
                totalPlayers = internalSnap.numChildren()
            });
            game.nPlayers = totalPlayers;
            // console.log("count of total players and current selected cards", totalPlayers, currSelectedCards)
            if (totalPlayers - 1 === currSelectedCards && game.currState === 4) {
                gameRef.update({
                    curr_state: 5 // move onto scoring phase
                })
                voteSelectedRef.off("value");
            };
        });
    },

    stateChangeListener: function() {
        //display selected cards in voting section||state change listener
        // console.log("stateChangeListener");
        gameRef.child("curr_state").on("value", function(snap) {
            let vCardsObj = {};
            let sCardsObj = {};
            let currState = snap.val();
            let sCardsArray = [];


            if (currState === 1) {
                //game start story teller to pick a card
                game.dealPlayerHand();
                game.cardSelectionClickListener();
                game.storyBoardUpdateListener(player.role);
                $("#chosen-cards").find(".card-stock").addClass("invisible");
                if (player.role === "player") {
                    $(".play-card").addClass("invisible");
                } else if (player.role === "storyTeller") {
                    $(".play-card").removeClass("invisible");
                }
            } else if (currState === 2) {
                //storyteller to tell a story
                game.cardSelectionClickListener();
                game.storyClickListener();
                game.usedCardListener();
            } else if (currState === 3) {
                //players to choose cards
                game.cardSelectionCompletionListener();
                gameRef.child("curr_story").once("value", function(snap) {
                    game.storyBoardUpdateListener("story", snap.val())
                })
                if (player.role === "player") {
                    $(".play-card").removeClass("invisible");
                } else if (player.role === "storyTeller") {
                    $(".play-card").addClass("invisible")
                }
            } else if (currState === 4) {
                //state 4 is the start of the voting stage   
                // console.log("current state", currState)
                $("#chosen-cards").find(".card-stock").removeClass("invisible");
                if (player.role === "player") {
                    $(".play-card").addClass("invisible");
                    $(".vote-card").removeClass("invisible");
                } else if (player.role === "storyTeller") {
                    $(".play-card").addClass("invisible")
                    $(".vote-card").addClass("invisible")
                }
                game.voteSelectionCompletionListener();
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
                    // console.log("sCardArray before for loop to display cards", sCardsArray)
                    for (let i = sCardsArray.length - 1; i >= 0; i--) {
                        cards.displaySpecificCard("#vote-card" + i, sCardsArray, i, "150")
                        if (i === 0) {
                            cardSelectedRef.off("value");
                        }
                    }
                    game.cardVoteClickListener();
                })
            } else if (currState === 5) {
                //state of is the start of the scoring stage
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
                        }).then(function() {
                            console.log("State = 5 sCardsObj", sCardsObj)
                            console.log("State = 5 vCardsObj", vCardsObj)
                            if (player.role === "storyTeller") {
                                game.scoring(sCardsObj, vCardsObj);
                                game.checkAndDeal(cards.sDeck);
                            }
                        })
                    })
                })
            } else if (currState === 6) {
                //round end restart round
                userRef.once("value", function(snap) {
                    let userArray = snap.val();
                    let userKeyArray = Object.keys(userArray);
                    userKeyArray.forEach(function(key) {
                        gamePage.updateScore(key, userArray[key].curr_score)
                    })
                })
                gameRef.once("value", function(snap) {
                    let roundNum = snap.child("curr_round").val() || 1;
                    let maxRounds = parseInt(snap.child("max_rounds").val(), 10) || game.maxRounds;
                    // console.log("maxRounds|roundNum", maxRounds, roundNum);
                    if (maxRounds === roundNum) {
                        gameRef.update({
                            curr_state: 7
                        })
                    } else {
                        if (player.role === "storyTeller") {
                            gameRef.once("value", function(snap) {
                                let currPlayOrder = snap.child("curr_play_order").val();
                                let newPlayOrder = game.playOrderUpdate(currPlayOrder);
                                let currRound = snap.val().curr_round || 1;
                                currRound++;
                                gameRef.update({
                                    curr_play_order: newPlayOrder,
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

                for (var i = game.nPlayers - 1; i >= 0; i--) {
                    // console.log("state 6", i)
                    $("#chosen-cards").find("#vote-card" + i).empty()
                }
            } else if (currState === 7) {
                //game end
                let resultsObj = [];
                userRef.orderByChild("curr_score").once("value", function(snap) {
                    let userArray = snap.val()
                    let userKeyArray = Object.keys(userArray);
                    for (let i = userKeyArray.length - 1; i >= 0; i--) {
                        let tempObj = {
                            key: userKeyArray[i],
                            name: userArray[userKeyArray[i]].name,
                            score: userArray[userKeyArray[i]].curr_score,
                            avatar: userArray[userKeyArray[i]].avatar
                        };
                        // console.log(tempObj)
                        resultsObj.push(tempObj);
                    }
                    // console.log("state 7", resultsObj);
                }).then(function() {
                    gamePage.cleanUpPage();
                    finalPage.createPage(resultsObj);
                    game.userStatUpdate(player.key);
                })
            }
        });
    },

    storyClickListener: function() {
        //click listener for current story 
        // console.log("storyClickListener");
        $(".submit").off().click(function(value) {
            event.preventDefault();
            let currStory = $("#storyteller-story").val().trim();
            $("#storyteller-story").val(""); //clear story text after submission
            if (player.role === "storyTeller" && game.currState === 2) {
                gameRef.update({
                    curr_story: currStory
                })
                gameRef.update({
                    curr_state: 3 //move onto player card selection
                })
            }
        });
    },

    cardSelectionClickListener: function() {
        //click listener for cards
        // console.log("cardSelectionClickListener")
        $(".play-card").off().click(function() {
            if (player.role === "storyTeller" && game.currState === 1) {
                // console.log($(this).siblings(".fahad-test").attr("card-value"))
                let cardSelection = $(this).siblings(".cards-container").attr("card-value");
                let cardSelectionDiv = $(this).siblings(".cards-container").attr("id");
                player.cardSelectionDiv = cardSelectionDiv;
                game.usedCardUpdate(cardSelection);
                gameRef.update({
                    curr_story_card: cardSelection
                })
                gameRef.update({
                        curr_state: 2 //move onto story telling
                    })
                    //removing card from DOM
                $(this).siblings(".cards-container").empty();
                //removing card from firebaseDB
                game.removeCard(player.key, cardSelection);
            } else if (player.role === "player" && game.currState === 3) {
                let cardSelection = $(this).siblings(".cards-container").attr("card-value");
                let cardSelectionDiv = $(this).siblings(".cards-container").attr("id");
                player.cardSelectionDiv = cardSelectionDiv;
                game.usedCardUpdate(cardSelection);
                let playerKey = player.key;
                cardSelectedRef.update({
                    [playerKey]: cardSelection
                })
                player.selectedCard = cardSelection;
                //removing card from firebaseDB
                game.removeCard(playerKey, cardSelection);
                //removing card from DOM
                $(this).siblings(".cards-container").empty();
            }
            $(".play-card").addClass("invisible");
        })
    },

    cardVoteClickListener: function() {
        $(".vote-card").off().click(function() {
            if (player.role === "player" && game.currState === 4) {
                let cardSelection = $(this).siblings(".cards-container").attr("card-value");
                let playerKey = player.key;
                if (cardSelection != player.selectedCard) {
                    // console.log("inside the voting if statement");
                    voteSelectedRef.update({
                        [playerKey]: cardSelection
                    })
                }
            }
            $(".vote-card").addClass("invisible");
        })
    },

    usedCardUpdate: function(usedCard) {
        usedCardRef.once("value", function(snap) {
            let cardArray = snap.val() || [];
            cardArray.push(usedCard);
            usedCardRef.set(cardArray);
        })
    },

    usedCardListener: function() {
        cardRef.on("value", function(cardSnap) {
            let currDeckSize = cardSnap.val().length;
            let currDeckArray = cardSnap.val();
            let nPlayers = 0;
            let usedDeckArray = [];
            let newDeck = [];
            userRef.once("value", function(playerSnap) {
                nPlayers = playerSnap.numChildren();
            }).then(function() {
                if (currDeckSize < nPlayers) {
                    usedCardRef.once("value", function(usedSnap) {
                        usedDeckArray = usedSnap.val();
                    }).then(function() {
                        newDeck = currDeckArray.concat(usedDeckArray);
                        cards.shuffleDeck(newDeck);
                    }).then(function() {
                        usedCardRef.set([]);
                    })
                }
            })
        })
    }
};




//click listener for cards and upload to correct location in DB


//get the information for scoring

// function getKeyByValue(object, value) {
//     return Object.keys(object).find(key => object[key] === value);
// }
