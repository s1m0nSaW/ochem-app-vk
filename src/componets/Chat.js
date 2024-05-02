import { Text } from "@vkontakte/vkui";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import PropTypes from "prop-types";

const Chat = ({ messages, user, socket, id }) => {
    const scrollableRef = React.useRef(null);
    const [typing, setTyping] = React.useState(false)

    React.useEffect(() => {
        socket.on("typingMessage", ({ data }) => {
            if(id !== data.vkid){
                setTyping(data.status)
            }
        });
    },[socket, id]);

    return (
        <ScrollableFeed innerRef={scrollableRef}>
            {typing && <div
            style={{
                margin: 5,
                //backgroundColor: user._id === message.senderId ? 'green' : 'grey',
                border: '1px solid grey',
                borderRadius: '10px 10px 10px 0px',
                marginLeft: '0px',
                width: 'fit-content',
                padding: 5,
                }}
            >
                <Text>   <i>Пишет...</i>   </Text>
            </div>}
            {messages?.map((message) =>
                <div key={message.date}
                    style={{
                        margin: 5,
                        //backgroundColor: user._id === message.senderId ? 'green' : 'grey',
                        border: user._id === message.senderId ? '1px solid green' : '1px solid grey',
                        borderRadius: user._id === message.senderId ? '10px 10px 0px 10px' : '10px 10px 10px 0px',
                        marginLeft: user._id === message.senderId ? 'auto' : '0px',
                        width: 'fit-content',
                        padding: 5,
                    }}>
                    <Text>{message.content}</Text>
                </div>
            )}
        </ScrollableFeed>
    );
};

export default Chat;

Chat.propTypes = {
    messages: PropTypes.array,
    user: PropTypes.object,
    socket: PropTypes.object,
    id: PropTypes.number,
};
