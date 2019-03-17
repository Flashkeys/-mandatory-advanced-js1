import React from 'react';
import ReactDOM from 'react-dom';
import openSocket from 'socket.io-client';
import moment from 'moment';
import EmojiPicker from 'emoji-picker-react';
import JSEMOJI from 'emoji-js';

import './style.css';
const socket = openSocket('http://ec2-13-53-66-202.eu-north-1.compute.amazonaws.com:3000/');
const jsemoji = new JSEMOJI();
jsemoji.img_set = 'emojione';
jsemoji.img_sets.emojione.path = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chatMessages: [],
      userName: undefined,
      showEmoji: false
    }
    this.userName = React.createRef();
    this.chatMessage = React.createRef();
    this.logout = this.logout.bind(this)
    this.handleEmoji = this.handleEmoji.bind(this)



    socket.on('messages', value => {
      this.setState({ chatMessages: value })
    })

    socket.on('new_message', value => {
      console.log(value);

      this.setState({ chatMessages: [...this.state.chatMessages, value] })
    })

  }

  SendData() {
    socket.emit("message", { username: this.state.userName, content: this.chatMessage.current.value });
    this.setState({ chatMessages: [...this.state.chatMessages, { username: this.state.userName, content: this.chatMessage.current.value }] });  // see our own msg
    this.chatMessage.current.value = '';
  }

  enterUsername() {
    const validateName = /^[a-z]{3,10}$/
    if (this.userName.current.value.match(validateName)) {
      this.setState({ userName: this.userName.current.value })
    }
    else {
      alert('please enter a valid username')
    }
  }
  logout() {
    this.setState({ userName: undefined })
  }

  handleEmoji(code, e) {
    this.chatMessage.current.value += `:${e.name}:`;
    this.setState({ showEmoji: false })
  }
  

  render() {
    const { chatMessages, userName, showEmoji } = this.state;   // deconstructing
    return (
      <div>
        {userName &&    // if loged in
          <div id="mario-chat">
            <div id="head-container">
              <div />
              <h2>Welcome {userName}</h2>
              <button className="exit" onClick={this.logout} >X </button>
            </div>
            <div id="chat-window">
              <div id="output">
                <ul>
                  {chatMessages.map((value, key) => {   // loop the msg on the page.
                    const emojiReg = /:.+?:/g
                    const URL = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                    const regex = new RegExp(URL);
                    let content = value.content;
                    const match = content.match(regex);
                    if (content.match(regex)) {
                      content = content.replace(regex, `<a href=${match} target="__blank">${match}</a>`);
                    }

                    const icon = content.match(emojiReg);
                    if (icon) {
                      let emojiPic = jsemoji.replace_colons(`:${icon}:`);
                      content = content.replace(emojiReg, emojiPic);
                    }
                    return (
                      <li key={key} dangerouslySetInnerHTML={{ __html: `<p><strong>${value.username}</strong>:  ${content} <span id='time'>${moment(value.timestamp).format('DD MMMM YY, h:mm:ss')}</span></p>` }} />)
                  }
                  )
                  }
                </ul>
              </div>
            </div>
            <div className="content">
              {showEmoji && <EmojiPicker onEmojiClick={this.handleEmoji} />}
              <input type="text" placeholder="Message" ref={this.chatMessage} />
              <span id="show-emoji" onClick={() => this.setState({ showEmoji: !this.state.showEmoji })}>{'😎'}</span>
            </div>
            <button className="btn" onClick={() => this.SendData()}>Send</button>
          </div>}
        {!userName &&
          <div id="mario-chat">
            <input type="text" ref={this.userName} placeholder='please enter username' /> <br />
            <button className="btn" onClick={() => this.enterUsername()}>Join chat</button>
          </div>}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
