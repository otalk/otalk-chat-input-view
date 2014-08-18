# otalk-chat-input-view

A chat input widget that can track typing states, and handle editing previous
messages.

## Installing

```sh
$ npm install otalk-chat-input-view
```

## Using

```javascript
var ChatInputView = require('otalk-chat-input-view');

var client = SomeRealtimeConnection();
var peer = SomeContactModel();

var view = new ChatInputView({
    sendChat: function (body, prevID) {
        client.sendChat({
            to: peer.id,
            body: body,
            replace: prevID
        });
    },
    sendChatState: function (state) {
        client.sendChatState({
            to: peer.id,
            chatState: state
        });
    },
    previousMessage: function () {
        return {
            id: peer.lastSentMessage.id,
            body: peer.lastSentMessage.body
        };
    }
});
```

## License

MIT

## Created By

If you like this, follow [@lancestout](http://twitter.com/lancestout) on twitter.
