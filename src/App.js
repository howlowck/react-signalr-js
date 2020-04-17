import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import './App.css';


function App(props) {
  const connectEndpoint = useSelector(state => state.connectEndpoint)
  const joinEndpoint = useSelector(state => state.joinEndpoint)
  const sendEndpoint = useSelector(state => state.sendEndpoint)
  const userId = useSelector(state => state.userId)
  const messages = useSelector(state => state.messages)
  const connected = useSelector(state => state.connected)
  const messageValue = useSelector(state => state.messageValue)
  const groupNameValue = useSelector(state => state.groupNameValue)
  // const connectionId = useSelector(state => state.connectionId)
  const groupJoined = useSelector(state => state.joined)
  const members = useSelector(state => state.members)

  const dispatch = useDispatch()
  const onSendFunc = props.onSendClick
  const onJoinFunc = props.onJoinClick
  const onConnectFunc = props.onConnectClick
  return (
    <div >
      <h3>Your UserId: {userId}</h3>
      <hr></hr>
      <h3>{connected ? 'Connected' : 'Connect'} to your SignalR Hub {connected ? '(Refresh to Disconnect)' : ''}</h3>
      <form onSubmit={evt => evt.preventDefault()}>
        <input placeholder="Connect Endpoint ie. {fnx-url}/api{?code=key} (don't include /negotiate)" value={connectEndpoint} onChange={(evt) => dispatch({ type: 'SET_CONNECT_ENDPOINT', endpoint: evt.target.value })} style={{width: 400}} disabled={connected} /><br/>
        <input placeholder="Join Endpoint ie. {fnx-url}/api/addToGroup{?code=key}" value={joinEndpoint} onChange={(evt) => dispatch({ type: 'SET_JOIN_ENDPOINT', endpoint: evt.target.value })} style={{width: 400}} disabled={connected}/><br />
        <input placeholder="Send Endpoint ie. {fnx-url}/api/messages{?code=key}" value={sendEndpoint} onChange={(evt) => dispatch({ type: 'SET_SEND_ENDPOINT', endpoint: evt.target.value })} style={{width: 400}} disabled={connected}/>
        <button onClick={() => { onConnectFunc(connectEndpoint, userId) }} disabled={!(connectEndpoint && joinEndpoint && sendEndpoint) || connected}>{connected ? 'Connected' : 'Connect'}</button>
      </form>
      <br />
      Join Group: 
      <form onSubmit={evt => evt.preventDefault()}>
        <input value={groupNameValue} onChange={(evt) => dispatch({ type: 'SET_GROUP_VALUE', value: evt.target.value })} disabled={groupJoined} />
        <button onClick={() => { onJoinFunc(joinEndpoint, groupNameValue, userId) }} disabled={!connected || groupJoined}>Join</button>
      </form>
      <br />
      {groupJoined? `Send Message To ${groupJoined}:`:`Send:`}
      <form onSubmit={evt => evt.preventDefault()}>
        <input value={messageValue} onChange={(evt) => dispatch({ type: 'SET_MESSAGE', value: evt.target.value })} /> 
        <button onClick={() => { onSendFunc(sendEndpoint, groupNameValue, messageValue); dispatch({ type: 'SET_MESSAGE', value: '' }) }} disabled={!groupJoined}>Send</button>
      </form>
      <br /><br />
      {renderGroupMessages(groupJoined, members, userId, messages)}
    </div>
  );
}

const renderGroupMessages = (groupJoined, members, userId, messages) => {
  if (groupJoined){
    return <div className="groupMessages">
        <h3>Messages from "{groupJoined}" Group</h3>
        <h4>Members</h4>
        <div className="members">
          {members.map(_ => {
            if (_ === userId) {
              return <span key={_} style={{background: 'blue', color: 'white', padding: 5}}>You</span>
            } else {
              return <span key={_} style={{padding: 5, border: '1px gray solid'}}>{_}</span>
            }
          })}
        </div>
        <h4>Messages</h4>
        <div id="messages">
          {messages.map((_, index) => {
            return (
              <div key={index}>{_.message} <span style={{fontSize: 13}}> ({userId === _.userId ? `from ME`: `from ${_.userId}`})</span></div>
            )
          })}
        </div>
      </div>
  }
  return ''
}

export default App;
