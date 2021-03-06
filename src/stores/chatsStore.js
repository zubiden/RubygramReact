import { createSlice } from "@reduxjs/toolkit";
import ChannelsManager from "../channels/ChannelsManager";
import store from "../store";

const TYPING_TIMEOUT = 5000;

const initialState = {
    chats: []
}

const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        addChat(state, action) {
            const chat = state.chats.find(chat => chat.id === action.payload.id)
            if (chat) {
                //update info
                chat.last_at = action.payload.last_at;
                chat.preview = action.payload.preview;
            } else {
                if (!action.payload.last_at) return state; // no messages
                state.chats = [...state.chats, action.payload].sort(chatComparator);
            }
        },
        setChats(state, action) {
            state.chats = action.payload.sort(chatComparator);
        },
        removeChat(state, action) {
            state.chats = state.chats.filter(el => el.id !== action.payload.id);
        },
        clearChats(state, action) {
            state.chats = []
        },
        appendChatMessage(state, action) {
            const message = action.payload;
            const chat = state.chats.find(chat => chat.id === message.conversation_id);
            if (chat) {
                chat.preview = message.body;
                chat.last_at = message.created_at;
                chat.action = ""; // reset typing
                state.chats.sort(chatComparator);
            } else {
                ChannelsManager.chats.requestChatInfo(message.conversation_id); // message from new chat
            }
        },
        setTyping(state, action) {
            const id = action.payload;
            const chat = state.chats.find(chat => chat.id === id);
            if(chat) {
                chat.action = "Typing";
                chat.actionEnd = Date.now() + TYPING_TIMEOUT;

                setTimeout(() => {
                    store.dispatch(checkTyping());
                }, TYPING_TIMEOUT);
            }
        },

        checkTyping(state, action) {
            const now = Date.now();
            state.chats.forEach(chat => {
                if(chat.actionEnd < now) {
                    chat.action = "";
                }
            })
        },

        updateChatsAvatar(state, action) {
            const user = action.payload;
            state.chats.forEach(chat => {
                if(chat.sender_id === user.id) chat.sender = user;
                if(chat.recipient_id === user.id) chat.recipient = user;
            })
        }
    },
})

// TODO return only last message
function chatComparator(chat1, chat2) {
    return chat2.last_at.localeCompare(chat1.last_at); //desc
}

// Reducer
export default chatsSlice.reducer;

// Actions
export const {
    addChat,
    removeChat,
    setChats,
    clearChats,
    appendChatMessage,
    setTyping,
    checkTyping,
    updateChatsAvatar,
} = chatsSlice.actions;

//Selectors

export const selectChats = (state) => state.chats.chats;