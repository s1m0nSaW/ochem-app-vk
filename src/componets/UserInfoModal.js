import React from "react";
import Compliments from "./Compliments";
import PropTypes from "prop-types";
import { Avatar, Gradient, ModalPage, ModalRoot, Title } from "@vkontakte/vkui";
import axios from "axios";

const UserInfoModal = ({ friend, token, modalClose }) => {
    const [compliments, setCompliments] = React.useState(null);

    React.useEffect(() => {
        const getComps = async () => {
            const fields = { id: friend._id, token };
            await axios
                .post(`https://ochem.ru/api/compliments`, fields)
                .then((data) => {
                    setCompliments(data.data);
                })
                .catch((err) => {
                    console.warn(err);
                });
        };
        getComps();
    }, [friend, token]);

    return (
        <ModalRoot activeModal={'UserInfoModal'} onClose={modalClose}>
            <ModalPage
                id='UserInfoModal'
                onClose={modalClose}
                height="70%"
            >
                <Gradient
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: 32,
                    }}
                    mode="tint"
                >
                    <Avatar size={96} src={friend.avaUrl} />
                    <Title
                        style={{ marginBottom: 8, marginTop: 20 }}
                        level="2"
                        weight="2"
                    >
                        {friend.firstName}
                    </Title>
                </Gradient>
                {compliments && <Compliments comps={compliments.reverse()}/>}
            </ModalPage>
        </ModalRoot>
    );
};

export default UserInfoModal;

UserInfoModal.propTypes = {
    friend: PropTypes.object,
    token: PropTypes.string,
    modalClose: PropTypes.func,
};
