import { Avatar, Button, ButtonGroup, Group, Header, ModalCard, ModalPage, ModalPageHeader, ModalRoot, Search, SimpleCell, Spacing, Title } from "@vkontakte/vkui";
import React from "react";
import PropTypes from 'prop-types';
import bridge from "@vkontakte/vk-bridge";

import { Icon56UserCircleOutline, Icon16CrownCircleFillVkDating } from '@vkontakte/icons'

const MODAL_CARD_NOTIFICATIONS = 'notifications';
const MODAL_CARD_CHAT_INVITE = 'chat-invite';
const MODAL_PAGE_WITH_FIXED_HEIGHT = 'fixed-height';

const ModalCards = ({ onCloseModals, user, onOpenSnackBar, player, socket, friends }) => {
    const [activeModal, setActiveModal] = React.useState(MODAL_CARD_CHAT_INVITE);
    const [modalHistory, setModalHistory] = React.useState([]);
    const [friend, setFriend] = React.useState(null);
    const [themes, setThemes] = React.useState([]);
    const [gameTheme, setGameTheme] = React.useState(null);
    const [player2, setPlayer2] = React.useState(null);
    const [search, setSearch] = React.useState('');
    const [onlines, setOnlines] = React.useState(null);

    const onChange = (e) => {
        setSearch(e.target.value);
    };

    const onClickFriend = (friend) => {
        setFriend(friend);
        const params = { 
            vkid: user.id,
            playerId: friend.id,
            status: 'firstTime',
            firstName: friend.first_name,
            avaUrl: friend.photo_200,
        }
        socket.emit("newPlayer", params);
        changeActiveModal(MODAL_PAGE_WITH_FIXED_HEIGHT)
    }

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

    const newGame = async () => {
        if(player.rsvp < 1){
            onOpenSnackBar('Не хватает монет чтобы создать игру', 'error')
        } else {
            let _turn = null
            if(gameTheme.quiz === true) _turn = player2._id;

            const fields = {
                playerId1: user.id, 
                playerId2: player2.vkid, 
                turn: _turn, 
                theme: gameTheme.theme,
            }
            socket.emit('newGame', fields);
            socket.emit("upGames", { userId: friend.vkid });
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

    function isOnline(userId) {
        if(onlines){
            return Object.values(onlines).includes(userId);
        } else return false
    }

    const usersFiltered = friends.filter(
        ({ first_name }) => first_name.toLowerCase().indexOf(search.toLowerCase()) > -1,
    );

    const randomUserFriends = (
        <React.Fragment>
            <Group
                header={
                <Header mode="secondary" indicator={friends.length}>
                    Друзья
                </Header>
                }
            >
                {usersFiltered.map((user) => {
                return (
                    <SimpleCell 
                    before={<Avatar src={user.photo_100}>{isOnline(user.id) && <Avatar.BadgeWithPreset preset="online" />}</Avatar>} 
                    key={user.id} 
                    onClick={()=>onClickFriend(user)}
                    >
                    {user.first_name} {user.last_name}
                    </SimpleCell>
                );
                })}
            </Group>
        </React.Fragment>
    );

    React.useEffect(()=>{
        socket.on("ratings", ({ data }) => {
            setThemes(data.ratings)
        });
    },[socket])

    React.useEffect(()=>{
        socket.on("friend", ({ data }) => {
            setPlayer2(data.player)
        });
    },[socket, user])

    React.useEffect(()=>{
        socket.on("onlines", ({ data }) => {
            setOnlines(data);
        });
    },[socket])

    return (
        <ModalRoot activeModal={activeModal} onClose={modalBack}>
            <ModalPage
                id={MODAL_CARD_CHAT_INVITE}
                onClose={() => changeActiveModal(null)}
                settlingHeight={100}
                height={'70%'}
                header={
                <ModalPageHeader>
                    Выберите друга
                </ModalPageHeader>
                }
            >
                <Search
                    value={search}
                    onChange={onChange}
                />
                {randomUserFriends}
            </ModalPage>
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
                                key="allow"
                                size="l"
                                mode="primary"
                                stretched
                                onClick={newGame}
                            >
                                Создать
                            </Button>
                            <Button
                                key="deny"
                                size="l"
                                mode="secondary"
                                stretched
                                onClick={test}
                            >
                                Отправить приложение
                            </Button>
                        </ButtonGroup>
                    </React.Fragment>
                }
            />
            <ModalPage
                id={MODAL_PAGE_WITH_FIXED_HEIGHT}
                onClose={modalBack}
                settlingHeight={100}
                height={'70%'}
                header={
                <ModalPageHeader>
                    Выберите тему игры
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
    onOpenSnackBar: PropTypes.func,
    player: PropTypes.object,
    user: PropTypes.object,
    socket: PropTypes.object,
    friends: PropTypes.array,
};
