let avatarObj = {
    avURL: 'https://api.adorable.io/avatars/face',
    attrList: ['eyes', 'nose', 'mouth'],
    eyes: ['eyes1', 'eyes2', 'eyes3', 'eyes4', 'eyes5', 'eyes6', 'eyes7', 'eyes9', 'eyes10'],
    nose: ['nose2', 'nose3', 'nose4', 'nose5', 'nose6', 'nose7', 'nose8', 'nose9'],
    mouth: ['mouth1', 'mouth3', 'mouth5', 'mouth6', 'mouth7', 'mouth9', 'mouth10', 'mouth11'],
    eyesUsed: [],
    noseUsed: [],
    mouthUsed: [],
    colors : ['#FF69B4', '#E6E6FA', '#FFA07A', '#66CDAA', '#DA70D6', '#FF6347'],
    getRandom: function(array) {
        return Math.floor(Math.random() * array.length);
    },
    genAvatarURL: function(color) {
        //grab object URL
        let curURL = this.avURL;
        //remove hash from hex color, since API doesnt want it
        let urlColor = color.substr(1);

        //map through attribute list to gather random pieces
        this.attrList.map(function(value) {
            let obj = avatarObj;
            let curList = obj[value];
            let itemToReturn = curList.splice(obj.getRandom(curList), 1)[0];
            obj[value + 'Used'].push(itemToReturn);
            return itemToReturn;
            // loop though pieces to append to url
        }).forEach(function(mapReturn) {
            curURL += '/' + mapReturn;
        })

        //add color specied by param
        curURL += '/' + urlColor;

        return curURL;
    }
}

//cloudify setup
$.cloudinary.config({ cloud_name: 'dymlxkpuq', api_key: '136738843422229' })

//unit tests
apiTests = {
    testAvatars: function(div) {
        let players = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
        players.forEach(function(value) {
            $(div).append($('<img>').addClass('avatar').attr('src', avatarObj.genAvatarURL()))
        })
    },
    testCards: function(div) {
        for (let i = 1; i < 99; i++) {
            if (i < 10) {
                $(div).append($.cloudinary.image('card_0000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
            } else {
                $(div).append($.cloudinary.image('card_000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
            }
        }
    }
}

const fireConfig = {
    apiKey: "AIzaSyBY_Xzums7MHPwKGLdSQ_uR9q3nTq76E5w",
    authDomain: "dixit-e12e5.firebaseapp.com",
    databaseURL: "https://dixit-e12e5.firebaseio.com",
    projectId: "dixit-e12e5",
    storageBucket: "dixit-e12e5.appspot.com",
    messagingSenderId: "225414607503"
};
firebase.initializeApp(fireConfig);
