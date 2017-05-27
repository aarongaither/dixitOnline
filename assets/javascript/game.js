let players = {
    pName: "",
    currScore: 0,
    currHand: [],
    currSelection: "",
}

let pTestArray = [{
    pname: "p1",
    currSelection: "a",
    voteSelection: null,
    role: "storyTeller"
}, {
    pname: "p2",
    currSelection: 2,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p3",
    currSelection: 3,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p4",
    currSelection: 4,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p5",
    currSelection: 5,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p6",
    currSelection: 6,
    voteSelection: "a",
    role: "player"
}, ]

let database = firebase.database();

cardRef = database.ref("/cards");

let cards = {
    oDeck: [],
    sDeck: [],
    createDeck: function() {
        let array = [];

        for (i = 1; i < 99; i++) {
            if (i < 10) {

                array.push("card_0000" + i);

                // array.push($.cloudinary.image('card_0000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
            } else {

                array.push("card_000" + i);

                //array.push($.cloudinary.image('card_000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
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
        this.sDeck = tArray;
        return tArray;
    },

    displaySpecificCard: function(div, array, pos) {
        $(div).append($.cloudinary.image(array[pos] + '.jpg', { width: 200, height: 300, crop: 'fill' }));
    },

    testCards: function(div, array) {
        $(div).empty();
        for (let i = 0; i < 98; i++) {
            $(div).append($.cloudinary.image(array[i] + '.jpg', { width: 200, height: 300, crop: 'fill' }));
        }
    }
}

let game = {
        cardsCountedArray: [],
        //roles and players stored here.

        scoring: function() {
            // counting instances of an object
            let cardsSelected = pTestArray.map(function(item) {
                return item.voteSelection
            });
            // console.log("these are the cards selected", cardsSelected);
            let countedCards = cardsSelected.reduce(function(allCards, card) {
                if (card in allCards) {
                    allCards[card]++;
                } else {
                    allCards[card] = 1;
                }
                return allCards;
            }, {});
            // console.log("this is CountedName", countedCards);
            this.cardsCountedArray = countedCards;

            let posStoryTeller = pTestArray.map(function(e) {
                return e.role }).indexOf("storyTeller");

            console.log("this is the position of the story teller", posStoryTeller);

        },

        dealingHand: function(deckArray,nCards) {
        	let 

        	for (var i = nCards - 1; i >= 0; i--) {


        		
        	}

        }


            cards.createDeck();
        var shuffledDeck = cards.shuffleDeck(cards.oDeck);

        cardRef.set(shuffledDeck);

        cardRef.once("value", function(snap) {
            cards.sDeck = snap.val();
        });
