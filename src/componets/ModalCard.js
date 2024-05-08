import { Avatar, Button, ButtonGroup, Group, Header, ModalCard, ModalPage, ModalPageHeader, ModalRoot, Search, SimpleCell, Spacing, Title } from "@vkontakte/vkui";
import React from "react";
import PropTypes from 'prop-types';
import bridge from "@vkontakte/vk-bridge";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";

import { Icon56UserCircleOutline, Icon16CrownCircleFillVkDating } from '@vkontakte/icons'

const FRIENDS = 'friends';
const THEMES = 'themes';
const SHARE = 'share';

const ModalCards = ({ onCloseModals, user, onOpenSnackBar, player, socket, friends }) => {
    const [activeModal, setActiveModal] = React.useState(FRIENDS);
    const [modalHistory, setModalHistory] = React.useState([]);
    const [friend, setFriend] = React.useState(null);
    const [themes, setThemes] = React.useState([]);
    const [player2, setPlayer2] = React.useState(null);
    const [search, setSearch] = React.useState('');
    const [onlines, setOnlines] = React.useState(null);
    const [friendIsRegistred, setFriendIsRegistred] = React.useState(false);
    const [gameId, setGameId] = React.useState(null);
    const routeNavigator = useRouteNavigator();

    const onChange = (e) => {
        setSearch(e.target.value);
    };

    const play = () => {
        if(gameId !== null){
            const fields = { vkid: user.id, gameId: gameId };
            socket.emit('setGame', fields);
            routeNavigator.go('/game')
            onCloseModals()
        }
    }

    const newGame = async (gameTheme) => {
        if(player.rsvp < 1){
            onOpenSnackBar('Не хватает монет чтобы создать игру', 'error')
        } else {
            const fields = {
                playerId1: user.id, 
                playerId2: player2.vkid,
                theme: gameTheme.theme,
            }
            socket.emit('newGame', fields);
            socket.emit("upGames", { userId: friend.vkid });
            if(friendIsRegistred){
                play();
            } else {
                changeActiveModal(SHARE);
            }
        }
    }

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
        changeActiveModal(THEMES)
    }

    const confirmTheme = (_theme) => {
        if(_theme.forSponsor){
            if(player.status === 'sponsor'){
                newGame(_theme)
            } else {
                onOpenSnackBar('Необходима подписка Premium', 'error')
            }
        } else {
            newGame(_theme);
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
        socket.on("newGameId", ({ data }) => {
            setGameId(data.id)
        });
    },[socket])

    React.useEffect(()=>{
        socket.on("friend", ({ data }) => {
            setPlayer2(data.player);
            setFriendIsRegistred(data.registred);
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
                id={FRIENDS}
                onClose={() => changeActiveModal(null)}
                settlingHeight={100}
                height={'70%'}
                header={
                <ModalPageHeader>
                    Игра для друзей
                </ModalPageHeader>
                }
            >
                <Search
                    value={search}
                    onChange={onChange}
                />
                {randomUserFriends}
            </ModalPage>
            <ModalPage
                id={THEMES}
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
            <ModalCard
                id={SHARE}
                onClose={() => changeActiveModal(null)}
                icon={ friend ? 
                    <Avatar
                        src={friend.photo_200}
                        size={72}
                    />:
                    <Icon56UserCircleOutline />
                }
                header={<Title level="3">Это приложение пока неизвестно пользователю {friend?.first_name} {friend?.last_name}.<br/>
                Поделитесь ссылкой, чтобы он узнал о нём и присоединиться к игре</Title>}
                actions={
                    <React.Fragment>
                        <Spacing size={16} />
                        <ButtonGroup size="s" stretched mode="vertical">
                            <Button
                                key="allow"
                                size="l"
                                mode="primary"
                                stretched
                                onClick={test}
                            >
                                Поделиться
                            </Button>
                            <Button
                                key="deny"
                                size="l"
                                mode="secondary"
                                stretched
                                onClick={play}
                            >
                                Пропустить
                            </Button>
                        </ButtonGroup>
                    </React.Fragment>
                }
            />
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
