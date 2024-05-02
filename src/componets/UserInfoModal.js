import React from "react";
import Compliments from "./Compliments";
import PropTypes from "prop-types";
import { Avatar, ModalCard, ModalRoot } from "@vkontakte/vkui";

const UserInfoModal = ({ friend, socket, modalClose, isOnline }) => {
    const [compliments, setCompliments] = React.useState(null);

    React.useEffect(() => {
        socket.on("userCompliments", ({ data }) => {
            setCompliments(data.compliments)
        });
    },[socket]);

    return (
        <ModalRoot activeModal={'UserInfoModal'} onClose={modalClose}>
            <ModalCard
                id="UserInfoModal"
                onClose={modalClose}
                icon={<Avatar size={96} src={friend.avaUrl}>
                    {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                </Avatar>}
                header={friend.firstName}
            >
                {compliments && <Compliments comps={compliments.reverse()}/>}
            </ModalCard>
        </ModalRoot>
    );
};

export default UserInfoModal;

UserInfoModal.propTypes = {
    friend: PropTypes.object,
    socket: PropTypes.object,
    modalClose: PropTypes.func,
    isOnline: PropTypes.func,
};
