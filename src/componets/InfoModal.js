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
                Монеты тратит только тот, <b>кто создал игру</b>, так что приглашенные игроки ничего не теряют.<br/><br/>
                Каждый игрок ежедневно может получить <b>1 монету бесплатно</b>. <br/><br/>
                Если вы выполните задания, вы сможете получить по <b>3 монеты бесплатно</b>. <br/><br/>
                Пользователи с премиум-подпиской ежедневно получают по <b>10 монет бесплатно</b>. <br/><br/>
                Так же можно получить <b>бесплатные монеты</b> посмотрев видеоролик. (Максимум 2 монеты в день)</Text>}
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
