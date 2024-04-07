import PropTypes from "prop-types";
import { Button, ModalCard, ModalRoot, Spacing, Text } from "@vkontakte/vkui";
import { Icon56InfoOutline } from '@vkontakte/icons'
import React from "react";

const InfoModal = ({ modalClose }) => {
    return (
        <ModalRoot activeModal={"UserInfoModal"} onClose={modalClose}>
            <ModalCard
                id="UserInfoModal"
                onClose={modalClose}
                icon={<Icon56InfoOutline />}
                subheader={<Text>Каждая игра стоит 1 монету. <br/>
                Монеты тратит только тот, кто создал игру, так что приглашенные игроки ничего не теряют.<br/><br/>
                Каждый игрок ежедневно может получить 1 монету бесплатно. <br/><br/>
                Если вы выполните задания, вы сможете получить по 3 монеты бесплатно. <br/><br/>
                Пользователи с премиум-подпиской ежедневно получают по 10 монет бесплатно.</Text>}
                actions={<React.Fragment>
                    <Spacing size={16} />
                    <Button
                    size="l"
                    mode="primary"
                    stretched
                    onClick={modalClose}
                    >
                    Хорошо
                    </Button>
                </React.Fragment>}
            />
        </ModalRoot>
    );
};

export default InfoModal;

InfoModal.propTypes = {
    modalClose: PropTypes.func,
};
