const socket = io();    // connect to the server socket

// elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = document.querySelector("input")
const $messageFormButton = document.querySelector("button")
const $sendLocationButton = document.getElementById('sendLocation')
const $messages = document.getElementById("messages")

// templates
const messageTemplate = document.getElementById("message-template").innerHTML
const locationMessageTemplate = document.getElementById("location-message-template").innerHTML
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML

// options
const { username, topic } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scrolloffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Event Handlers
// listen to the event 'message' from server
socket.on("topicData", ({topic, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        topic,
        users
    })
    document.getElementById("sidebar").innerHTML = html
})

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment( message.createdAt ).format( 'hh:mm:ss a' )
    });
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
});

// listen to the event `locationmessage` from server
socket.on("locationMessage", (url) => {
    console.log(url);
    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format( 'hh:mm:ss a' )
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll()
})

// click send message button
$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // disable
    $messageFormButton.setAttribute("disabled", "disabled")

    const message = event.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        // enable
        $messageFormButton.removeAttribute("disabled")

        // remove content in the input box
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if (error) {
            return console.log(error);
        }

        console.log("Message delivered...")
    });
});

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported...');
    }

    $sendLocationButton.setAttribute("disabled", "disabled")

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute("disabled")
            console.log("Location shared...")
        });
    });
});

socket.emit("start", { username, topic }, (error) => {
    if (error) {
        alert(error)
    }
})
