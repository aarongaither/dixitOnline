// Initialize Firebase
var config = {
    apiKey: "AIzaSyBY_Xzums7MHPwKGLdSQ_uR9q3nTq76E5w",
    authDomain: "dixit-e12e5.firebaseapp.com",
    databaseURL: "https://dixit-e12e5.firebaseio.com",
    projectId: "dixit-e12e5",
    storageBucket: "dixit-e12e5.appspot.com",
    messagingSenderId: "225414607503"
};

firebase.initializeApp(config);

$.cloudinary.config({ cloud_name: 'dymlxkpuq', api_key: '136738843422229' })

let players = {
    pName: "",
    currScore: 0,
    currHand: [],
    currSelection: "",
    role: "" //storyTeller||player
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

let cards = {
    oDeck: [],
    sDeck: [],
    createDeck: function() {
        let array = [];

        for (i = 1; i < 99; i++) {
            if (i < 10) {
                array.push($.cloudinary.image('card_0000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
            } else {
                array.push($.cloudinary.image('card_000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
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
        console.log("this is before the for loop");

        for (i = tArray.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = tArray[i];
            tArray[i] = tArray[j];
            tArray[j] = temp;

            console.log("this is inside the for loop ", i, j)
        }
        this.sDeck = tArray;
        return tArray;
    },

    displaySpecifcCard: function(div, array, pos) {
        $(div).append(array[pos]);
    },

    testCards: function(div, array) {
        $(div).empty();
        for (let i = 0; i < 99; i++) {
            $(div).append(array[i]);
        }
    }
}

let game = {
    cardsCountedArray: [],

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

        let posStoryTeller = pTestArray.map(function(e){return e.role}).indexOf("storyTeller");

        console.log("this is the position of the story teller",posStoryTeller);

    }
}
