import { Avatar, Button, ButtonGroup, Group, ModalCard, ModalPage, ModalPageHeader, ModalRoot, SimpleCell, Spacing, Title } from "@vkontakte/vkui";
import React from "react";
import PropTypes from 'prop-types';
import bridge from "@vkontakte/vk-bridge";
import axios from "axios";

import { Icon56UserCircleOutline, Icon16CrownCircleFillVkDating } from '@vkontakte/icons'

const MODAL_CARD_NOTIFICATIONS = 'notifications';
const MODAL_CARD_CHAT_INVITE = 'chat-invite';
const MODAL_PAGE_WITH_FIXED_HEIGHT = 'fixed-height';

const ModalCards = ({ onCloseModals, token, getPlayer, user, onOpenSnackBar, player, socket }) => {
    const [activeModal, setActiveModal] = React.useState(MODAL_CARD_CHAT_INVITE);
    const [modalHistory, setModalHistory] = React.useState([]);
    const [friend, setFriend] = React.useState(null);
    const [themes, setThemes] = React.useState([]);
    const [gameTheme, setGameTheme] = React.useState(null);
    const [player2, setPlayer2] = React.useState(null);

    const getFriend = async () => {
        bridge
            .send("VKWebAppGetFriends")
            .then(async (data) => {
                if (data) {
                    // Данные о пользователях
                    setFriend(data.users[0]);
                    const params = { vkid: data.users[0].id }
                    await axios.post('https://ochem.ru/api/auth', params)
                    .then((data)=>{
                        setPlayer2(data.data)
                        //console.log("user est ", data.data)
                    }).catch(async (err)=>{
                        console.log(err);
                        const fields = {
                            vkid: data.users[0].id,
                            status: 'firstTime',
                            firstName: data.users[0].first_name,
                            avaUrl: data.users[0].photo_200,
                        }
                        await axios.post('https://ochem.ru/api/auth/register', fields)
                        .then((data)=>setPlayer2(data.data.user))
                        .catch((err)=>console.log(err));
                    })
                }
            })
            .catch((error) => {
                // Ошибка
                console.log(error);
            });
    };

    const confirmTheme = (_theme) => {
        if(_theme.forSponsor){
            if(player.status === 'sponsor'){
                setGameTheme(_theme);
                changeActiveModal(MODAL_CARD_NOTIFICATIONS);
            } else {
                onOpenSnackBar('Необходима подписка Premium', 'error')
            }
        } else {
            setGameTheme(_theme);
            changeActiveModal(MODAL_CARD_NOTIFICATIONS);
        }
    }

    const checkPlayer2 = async () => {
        newGame(player2)
    }

    const newGame = async (_player) => {
        if(player.rsvp < 1){
            onOpenSnackBar('Не хватает монет чтобы создать игру', 'error')
        } else {
            let _turn = null
            if(gameTheme.quiz === true) _turn = _player._id;

            const fields = {
                gameName: `Игра ${user.first_name} & ${friend.first_name}`,
                theme: gameTheme.theme,
                quiz: gameTheme.quiz,
                forSponsor: gameTheme.forSponsor,
                user1: player._id,
                user2: _player._id,
                userUrl1: user.photo_200, 
                userUrl2: friend.photo_200,
                turn: _turn,
                token: token,
            }
            await axios.post('https://ochem.ru/api/new-game', fields).then((data)=>{
                if(data){
                    socket.emit("upGames", { userId: friend._id });
                    const fields = {
                        userId: friend._id,
                        message:`${user.first_name} пригласил поиграть`, 
                        severity: 'info',
                    }
                    socket.emit("socketNotification", fields);
                    getPlayer();
                    onOpenSnackBar('Игра создана', 'success')
                    onCloseModals()
                }
            }).catch((err)=>{
                console.warn(err); 
                onOpenSnackBar('Не удалось создать игру', 'error')
                onCloseModals()
            });
        }
    }

    const test = () => {
        bridge.send('VKWebAppShare', {
          link: 'https://vk.com/app51864614'
          })
          .then((data) => { 
            if (data.result) {
              // Запись размещена
              onOpenSnackBar('Приложение отправлено', 'success')
            }
          })
          .catch((error) => {
            // Ошибка
            console.log(error);
          });
      }

    const changeActiveModal = (activeModal) => {
        activeModal = activeModal || null;
        let localModalHistory = modalHistory ? [...modalHistory] : [];
    
        if (activeModal === null) {
          localModalHistory = [];
          onCloseModals()
        } else if (modalHistory.indexOf(activeModal) !== -1) {
          localModalHistory = localModalHistory.splice(0, localModalHistory.indexOf(activeModal) + 1);
        } else {
          localModalHistory.push(activeModal);
        }
    
        setActiveModal(activeModal);
        setModalHistory(localModalHistory);
    };

    const modalBack = () => {
        changeActiveModal(modalHistory[modalHistory.length - 2]);
    };

    React.useEffect(()=>{
        const getThemes = async () => {
            try {
                const data = { token: token }
                const _rates = await axios.post('https://ochem.ru/api/all-rates', data)
                if(_rates) {
                    setThemes(_rates.data)
                }
            } catch (err) {
                console.warn(err)
            }
        }
        getThemes()
    },[token])

    return (
        <ModalRoot activeModal={activeModal} onClose={modalBack}>
            <ModalCard
                id={MODAL_CARD_NOTIFICATIONS}
                onClose={() => changeActiveModal(null)}
                icon={ friend ? 
                    <Avatar
                        src={friend.photo_200}
                        size={72}
                    />:
                    <Icon56UserCircleOutline />
                }
                header={<Title level="3">Создать новую игру<br/>с {friend?.first_name} {friend?.last_name}<br/>на тему {gameTheme?.theme}?</Title>}
                actions={
                    <React.Fragment>
                        <Spacing size={16} />
                        <ButtonGroup size="s" stretched mode="vertical">
                            <Button
                                key="deny"
                                size="l"
                                mode="secondary"
                                stretched
                                onClick={test}
                            >
                                Отправить приложение
                            </Button>
                            <Button
                                key="allow"
                                size="l"
                                mode="primary"
                                stretched
                                onClick={checkPlayer2}
                            >
                                Создать
                            </Button>
                        </ButtonGroup>
                    </React.Fragment>
                }
            />
            <ModalCard
                id={MODAL_CARD_CHAT_INVITE}
                onClose={() => changeActiveModal(null)}
                icon={ friend ? 
                    <Avatar
                        src={friend.photo_200}
                        size={72}
                    />:
                    <Icon56UserCircleOutline />
                }
                header="Выберите друга"
                subheader={friend ? `Играть с ${friend.first_name} ${friend.last_name}`:"Приглашение в игру"}
                actions={
                    <React.Fragment>
                        <Spacing size={8} />
                        <ButtonGroup size="l" mode="vertical" stretched>
                            <Button
                                key="join"
                                size="l"
                                mode="primary"
                                stretched
                                onClick={getFriend}
                            >
                                Выбрать друга
                            </Button>
                            <Button
                                disabled={!friend}
                                key="copy"
                                size="l"
                                mode="secondary"
                                stretched
                                onClick={() => changeActiveModal(MODAL_PAGE_WITH_FIXED_HEIGHT)}
                            >
                                Далее
                            </Button>
                        </ButtonGroup>
                    </React.Fragment>
                }
            >
                <Spacing size={20} />
            </ModalCard>
            <ModalPage
                id={MODAL_PAGE_WITH_FIXED_HEIGHT}
                onClose={modalBack}
                settlingHeight={100}
                height={'70%'}
                header={
                <ModalPageHeader>
                    Выбрать тему игры
                </ModalPageHeader>
                }
            >
                <Group>
                    {themes.map((theme) => {
                    return (
                        <SimpleCell key={theme._id} subtitle={`Рейтинг: ${theme.rating}/5`} onClick={()=>confirmTheme(theme)}>
                        {theme.theme}{" "}{theme.forSponsor &&  <Icon16CrownCircleFillVkDating style={{
                        display: 'inline-block',
                      }}/>}
                        </SimpleCell>
                    );
                    })}
                </Group>
            </ModalPage>
        </ModalRoot>
    );
};

export default ModalCards;

ModalCards.propTypes = {
    onCloseModals: PropTypes.func,
    token:PropTypes.string,
    getPlayer: PropTypes.func,
    onOpenSnackBar: PropTypes.func,
    player: PropTypes.shape({
        _id: PropTypes.string,
        status: PropTypes.string,
        dailyRsvp: PropTypes.number,
        rsvp: PropTypes.number,
        rsvpStatus: PropTypes.bool,
        rsvpDate: PropTypes.number,
    }),
    user: PropTypes.shape({
        photo_200: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        city: PropTypes.shape({
            title: PropTypes.string,
        }),
    }),
    socket: PropTypes.object,
};
