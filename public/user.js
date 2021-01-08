//Connect to socket.io
const socket = io();
//Get elements
const messages = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const nickForm = document.getElementById('setNick');
const nickError = document.getElementById('nickError');
const nickBox = document.getElementById('nickname');
const users = document.getElementById('users');
const handle = document.getElementById('handle');
const content = document.querySelector('.content');
//Bot list commands
const aki_speak = ['Hellooo', 'How are you today', 'Oh you again.', 'You bored again boy?', 'Welcome to the rice fields', 'Are you more a Cat or a Dog person?', 'i am here , you need something ?', 'I see that the assassins have failed.'];
const aki_roast = ['Oh darling you look rosted enough.', 'Mirrors can\'t talk. Lucky for you ,they can\'t laugh either.', 'Some day you\'ll go far...and i hope you stay there.', 'i love what you\'ve done with your hair. How do you get it to come out of the nostrils like that?'];
const aki_anime = ['Bleach', 'Vinland Saga', 'High School Of The Dead', 'One Piece', 'My Hero Academia', 'Fairy Tail', 'The God Of High School', 'Tokyo Ghoul', 'Made in Abyss', 'Castle in The Sky'];
const aki_movie = ['Black Widow', 'Avengers:Endgame', 'Harry Potter Movies', 'Lord of The Rings', 'Wonder Woman 1984', 'Ready Player One', 'Ghost In The Shell', 'Monster Hunter', 'Spiderman Far From Home'];


//Get message and append it
socket.on('message', data => {
    console.log(data)
    appendMessages(data)

    //Scroll down
    content.scrollTop = content.scrollHeight;
})

//Retrieve messages from database
socket.on('output-message', data => {
    if (data.length) {
        data.forEach(message => {
            appendMessages(message);
        })
    }
})

//Handle username input
nickForm.addEventListener('submit', e => {
    e.preventDefault()
    socket.emit('chatuser', nickForm.nickname.value, function (data) {
        if (data) {
            document.getElementById('nickWrap').style.display = "none";
            document.getElementById('logoBG').style.display = "none";
            document.getElementById('contentWrap').style.display = "block";
            //Auto scroll bottom
            content.scrollTop = content.scrollHeight - content.clientHeight;
        } else {
            nickError.innerHTML = 'That username is already taken.';
        }
    })
    nickForm.nickname.value = '';
})

//Usernames and appendind to users html
socket.on('usernames', data => {
    var html = '';
    for (var i = 0; i < data.length; i++) {
        html += '<i class="fas fa-hashtag"></i> ' + data[i] + '<br>'
    }
    users.innerHTML = html;

})

//User is typing
socket.on('typing', function (data, user) {
    if (data) {
        feedback.innerHTML = '<p><em>' + user + ' is typing a message...</em></p>';
        content.scrollTop = content.scrollHeight;
    } else {
        feedback.innerHTML = '';
    }

});

//Handle input message
msgForm.addEventListener('keydown', e => {
    if (e.which === 13 && e.shiftKey == false) {
        e.preventDefault()
        //Bot
        if (msgForm.msg.value.startsWith('!aki-speak')) {
            msgForm.msg.value = '';
            appendBot(aki_speak[Math.floor(Math.random() * aki_speak.length)]);
            content.scrollTop = content.scrollHeight;
        }
        else if (msgForm.msg.value.startsWith('!aki-roast')) {
            msgForm.msg.value = '';
            appendBot(aki_roast[Math.floor(Math.random() * aki_roast.length)]);
            content.scrollTop = content.scrollHeight;
        }
        else if (msgForm.msg.value.startsWith('!aki-anime')) {
            msgForm.msg.value = '';
            appendBot(aki_anime[Math.floor(Math.random() * aki_anime.length)]);
            content.scrollTop = content.scrollHeight;
        }
        else if (msgForm.msg.value.startsWith('!aki-movie')) {
            msgForm.msg.value = '';
            appendBot(aki_movie[Math.floor(Math.random() * aki_movie.length)]);
            content.scrollTop = content.scrollHeight;
        }
        else {
            //Empty input
            var prazno = msgForm.msg.value;
            prazno = prazno.trim();

            if (!prazno) {
                return false;
            }
            //Emit message
            socket.emit('chatmessage', msgForm.msg.value)
            msgForm.msg.value = '';
        }
    }

})

//Handle for user is typing
msgForm.addEventListener('keyup', function () {
    if (handle.value.length > 0) {
        socket.emit('typing', handle.value);
    } else {
        socket.emit('typing', '');
    }
});

//Build out message div(DOM) + secured if user is typing HTML syntax
function appendMessages(message) {
    const div = document.createElement('div');
    div.classList.add('messages');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.nick;
    p.innerHTML += `<span> ${message.date}</span>`;
    div.appendChild(p);
    const pp = document.createElement('p');
    pp.classList.add('text');
    pp.innerText = message.msg;
    div.appendChild(pp);

    document.querySelector('.chat-messages').appendChild(div);
}

//Append bot
function appendBot(message) {
    const div = document.createElement('div');
    div.classList.add('messages');
    div.innerHTML = `<div><p class="meta">Aki-bot</p><p class="text" style="color: #65d6ce;">${message}</p></div>`
    document.querySelector('.chat-messages').appendChild(div);
}

//Aki-bot
function aki() {
    document.getElementById('aki').removeAttribute('style');
}

function akiHide() {
    document.getElementById('aki').setAttribute('style', "display:none;");
}

function getAki(em) {
    handle.value += em.innerHTML;
}

//Emojis
function emoji() {
    document.getElementById('emoji').removeAttribute('style');
}

function emojiHide() {
    document.getElementById('emoji').setAttribute('style', "display:none;");
}

function getEmoji(em) {
    handle.value += em.innerHTML;
}