import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import * as signalR from '@microsoft/signalr'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import shortid from 'shortid'

const defaultState = {
  connectEndpoint: localStorage.getItem('react-signalr/connectEndpoint') || '',
  joinEndpoint: localStorage.getItem('react-signalr/joinEndpoint') || '',
  sendEndpoint: localStorage.getItem('react-signalr/sendEndpoint') || '',
  userId: '',
  groupNameValue: '', 
  messageValue: '', 
  connected: false,
  groupJoined: null,
  // connectionId: null,
  messages: [],
  members: []
}

const userId = shortid.generate();
console.log('userId:', userId)

const store = createStore((prev = defaultState, action ) => {
  if (action.type === 'SET_CONNECT_ENDPOINT') {
    localStorage.setItem('react-signalr/connectEndpoint', action.endpoint)
    return {
      ...prev,
      connectEndpoint: action.endpoint
    } 
  }

  if (action.type === 'SET_JOIN_ENDPOINT') {
    localStorage.setItem('react-signalr/joinEndpoint', action.endpoint)
    return {
      ...prev,
      joinEndpoint: action.endpoint
    } 
  }

  if (action.type === 'SET_SEND_ENDPOINT') {
    localStorage.setItem('react-signalr/sendEndpoint', action.endpoint)
    return {
      ...prev,
      sendEndpoint: action.endpoint
    } 
  }

  if (action.type === 'SET_USER_ID') {
    return {
      ...prev,
      userId: action.value
    }
  }

  if (action.type === 'SET_GROUP_VALUE') {
    return {
      ...prev,
      groupNameValue: action.value
    }
  }

  if (action.type === 'SET_MESSAGE') {
    return {
      ...prev,
      messageValue: action.value
    }
  }

  if (action.type === 'SIGNALR_CONNECTED') {
    return {
      ...prev,
      connected: true
      // connectionId: action.connectionId
    }
  }

  if (action.type === 'GROUP_JOINED') {
    return {
      ...prev,
      joined: action.groupName
    }
  }

  if (action.type === 'NEW_MESSAGE') {
    return {
      ...prev,
      messages: [...prev.messages, action.message]
    }
  }

  if (action.type === 'SET_MEMBERS') {
    return {
      ...prev,
      members: action.members
    }
  }

  return prev
})

store.dispatch({type: 'SET_USER_ID', value: userId})

const connectHub = (connectEndpoint, userId) => {
  let connection = new signalR.HubConnectionBuilder()
  .withUrl(`${connectEndpoint}&userId=${userId}`, {
    transport: signalR.HttpTransportType.WebSockets
  })
  .build();

  connection.on("group:newMessage", data => {
    console.log('group:newMessage payload', data)
    store.dispatch({type: 'NEW_MESSAGE', message: data})
  });

  connection.on("group:memberJoined", data => {
    console.log('group:memberJoined payload', data)
    if (data.newMember === userId) {
      store.dispatch({type: 'GROUP_JOINED', groupName: data.groupName})
    }
  });

  connection.on("group:memberLeft", data => {
    console.log('group:memberLeft payload', data)
  });

  connection.on("global:newMessage", data => {
    console.log('global:newMessage payload', data)
  });

  connection.on("user:newMessage", data => {
    console.log('user:newMessage payload', data)
  });

  connection.on("global:memberLeft", data => {
    console.log('global:memberLeft payload', data)
  });

  connection
  .start()
  .then((info) => {
    console.log('connectionId:', connection.connectionId)
    const { connectionId } = connection
    console.log('invoking send')
    console.log('connected to signalR')
    store.dispatch({ type: 'SIGNALR_CONNECTED', connectionId })
    // sendMessage(`hello from initial load ${Date().toString()}`)
  });
}


const sendMessage = (sendEndpoint, message, group) => {
  return fetch(`${sendEndpoint}&userId=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messageData: {message, userId},
      // userId,
      targetGroupName: group
    })
  })
}

const joinGroup = (joinEndpoint, name, userId) => {
  console.log('joining group...')
  return fetch(`${joinEndpoint}&groupName=${name}&userId=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      groupName: name,
      userId
    })
  })
  .catch((err) => {console.log(err)})
  .then(() => {
    
  })
}



ReactDOM.render(
  <Provider store={store}>
    <App onConnectClick={connectHub} onSendClick={sendMessage} onJoinClick={joinGroup} />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
