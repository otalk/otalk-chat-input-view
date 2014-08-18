var _ = require('underscore');
var View = require('ampersand-view');


var ChatInputView = View.extend({
    template: '<textarea autocomplete="off"></textarea>',

    bindings: {
        editing: {
            type: 'booleanClass'
        },
        typing: {
            type: 'booleanClass'
        },
        paused: {
            type: 'booleanClass'
        },
        placeholder: {
            type: 'attribute',
            selector: 'textarea',
            name: 'placeholder'
        }
    },

    events: {
        keydown: 'handleKeyDown',
        keyup: 'handleKeyUp'
    },

    props: {
        editing: 'boolean',
        typing: 'boolean',
        paused: 'boolean',
        active: 'boolean',
        placeholder: 'string',
        prevMessageID: 'string'
    },

    initialize: function (spec) {
        this._sendChatState = spec.sendChatState || function () {};
        this._sendChat = spec.sendChat || function () {};
        this._previousMessage = spec.previousMessage || function () {};

        if (spec.template) {
            this.template = spec.template;
        }

        this.bind('change:active', this.handleActive);
    },

    render: function () {
        this.renderWithTemplate();
        this.cacheElements({
            chatInput: 'textarea'
        });
        return this;
    },

    handleActive: function () {
        if (this.active) {
            this._sendChatState('active');
        } else {
            this._sendChatState('inactive');
        }
    },

    handleKeyDown: function (e) {
        var arrowKeys = {
            37: true,
            38: true,
            39: true,
            40: true
        };

        if (e.which === 13 && !e.shiftKey) {
            this.sendChat();
            e.preventDefault();
        } else if (e.which === 38 && this.chatInput.value === '') {
            var prev = this._previousMessage();
            if (prev) {
                this.editing = true;
                this.composing = true;
                this.chatInput.value = prev.body;
                this.prevMessageID = prev.id;
            } else {
                this.editing = false;
                this.prevMessageID = undefined;
            }

            e.preventDefault();
        } else if (e.which === 40 && this.editing) {
            this.editing = false;
            e.preventDefault();
        } else if (!arrowKeys[e.which] && !e.ctrlKey && !e.metaKey && (!this.typing || this.paused)) {
            this.typing = true;
            this.paused = false;
            this._sendChatState('composing');
        }
    },

    handleKeyUp: function () {
        if (this.typing && this.chatInput.value.length === 0) {
            this.typing = false;
            this._sendChatState('active');
        } else if (this.typing) {
            this.handlePausedTyping();
        }
    },

    handlePausedTyping: _.debounce(function () {
        if (this.typing && !this.paused) {
            this.paused = true;
            this._sendChatState('paused');
        }
    }, 3000),

    sendChat: function () {
        var val = this.chatInput.value;

        if (val) {
            if (this.editing) {
                this._sendChat(val, this.prevMessageID);
            } else {
                this._sendChat(val);
            }
        }

        this.editing = false;
        this.typing = false;
        this.paused = false;
        this.chatInput.value = '';
    }
});


module.exports = ChatInputView;
