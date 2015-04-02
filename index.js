var throttle = require('lodash.throttle');
var debounce = require('lodash.debouce');
var View = require('ampersand-view');


var ChatInputView = View.extend({
    template: '<textarea data-hook="chat-input" autocomplete="off"></textarea>',

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
            name: 'placeholder',
            hook: 'chat-input'
        }
    },

    events: {
        keydown: 'handleKeyDown',
        keyup: 'handleKeyUp',
        input: 'handleInput'
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
        if (spec.template) {
            this.template = spec.template;
        }

        if (spec.sendChatState) {
            this.bind('chatstate', spec.sendChatState);
        }

        if (spec.sendChat) {
            this.bind('chat', spec.sendChat);
        }

        this._previousMessage = spec.previousMessage || function () {};

        this.bind('change:active', this.handleActive);
    },

    render: function () {
        this.renderWithTemplate();
        this.cacheElements({
            chatInput: 'textarea'
        });

        this.chatInputStyle = getComputedStyle(this.chatInput);
        return this;
    },

    handleActive: function () {
        if (this.active) {
            this.sendChatState('active');
        } else {
            this.sendChatState('inactive');
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
            this.sendChatState('composing');
        }
    },

    handleKeyUp: function () {
        this.resizeInput();
        if (this.typing && this.chatInput.value.length === 0) {
            this.typing = false;
            this.sendChatState('active');
        } else if (this.typing) {
            this.handlePausedTyping();
        }
    },

    handleInput: function () {
        this.resizeInput();
        if (!this.typing) {
            this.typing = true;
            this.sendChatState('composing');
        }
        this.trigger('input', this.chatInput.value);
    },

    handlePausedTyping: debounce(function () {
        if (this.typing && !this.paused) {
            this.paused = true;
            this.sendChatState('paused');
        }
    }, 3000),

    sendChat: function () {
        var val = this.chatInput.value;

        if (val) {
            if (this.editing) {
                this.trigger('chat', val, this.prevMessageID);
            } else {
                this.trigger('chat', val);
            }
        }

        this.editing = false;
        this.typing = false;
        this.paused = false;
        this.chatInput.value = '';
    },

    sendChatState: function (state) {
        this.trigger('chatstate', state);
    },

    resizeInput: throttle(function () {
        this.trigger('resize');
    }, 300)
});


module.exports = ChatInputView;
