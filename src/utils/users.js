const users = []

// addUser, removeUser, getUser, getUserInRoom
const addUser = ({ id, username, topic }) => {
    username = username.trim().toLowerCase()
    topic = topic.trim().toLowerCase()

    if (!username || !topic) {
        return {
            error: "Username and topic are requred!"
        }
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.topic === topic
    })

    if (existingUser) {
        return {
            error: "The username is already in use"
        }
    }

    users.push({ id, username, topic })
    return {
        user: {id, username, topic}
    }
}

const removeUser = (id) => {
    const index = users.findIndex( user => user.id === id )

    if ( index !== -1 ) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInTopic = ( topic ) => {
    return users.filter( user => user.topic === topic )
}

export {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInTopic
}
