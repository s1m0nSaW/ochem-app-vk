import PropTypes from "prop-types";
import bridge from "@vkontakte/vk-bridge";
import { Button, IconButton, Image, ModalCard, ModalRoot, SimpleCell, Spacing } from "@vkontakte/vkui";
import { Icon28Users3Outline, Icon28Notifications, Icon28FavoriteOutline, 
    Icon28AdvertisingOutline, Icon28CheckCircleOff, Icon28CheckCircleOutline } from '@vkontakte/icons';
import coins from '../img/item1.jpg'
import React from "react";
import axios from "axios";

const TasksModal = ({ modalClose, token, setPlayer, vkid }) => {
    const [ notifications, setNotifications] = React.useState(false);
    const [ favorite, setFavorite ] = React.useState(false);
    const [ recomended, setRecomended ] = React.useState(false);
    const [ joined, setJoined ] = React.useState(false);

    const recomend = () => {
        bridge.send('VKWebAppRecommend')
        .then((data) => { 
            if (data.result) {
            // Мини-приложение порекомендовано
            setRecomended(true)
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
    }

    const joinGroup = () => {
        bridge.send('VKWebAppJoinGroup', {
            group_id: 225433186
            })
            .then((data) => { 
              if (data.result) {
                // Пользователь подписался на сообщество
                console.log(data)
                setJoined(true)
              }
            })
            .catch((error) => {
              // Ошибка
              console.log(error);
            });
    }

    const addToFavorite = () => {
        bridge.send('VKWebAppAddToFavorites')
        .then((data) => { 
            if (data.result) {
            // Мини-приложение или игра добавлены в избранное
            setFavorite(true)
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
    }

    const allowNotifications = () => {
        bridge.send('VKWebAppAllowNotifications')
        .then((data) => { 
            if (data.result) {
            // Разрешение на отправку уведомлений мини-приложением или игрой получено
            setNotifications(true)
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
    }

    const setPromoter = async () => {
        const data = { token: token, vkid: vkid, status: 'promoter', dailyRsvp: 3 }
        await axios.patch('https://ochem.ru/api/rsvp-date', data)
        .then((data)=>setPlayer(data.data))
        .catch((err)=>{
            console.warn(err); 
        });
        modalClose();
    }

    React.useEffect(()=>{
        bridge.send('VKWebAppGetLaunchParams')
        .then((data) => { 
            if (data) {
                // Параметры запуска получены
                if(data.vk_are_notifications_enabled === 1) setNotifications(true)
                if(data.vk_is_favorite === 1) setFavorite(true)
                if(data.vk_is_recommended === 1) setRecomended(true)
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });

        bridge.send('VKWebAppGetGroupInfo', {
            group_id: 225433186
            })
            .then((data) => { 
              if (data.is_member === 1) {
                // Данные о сообществе получены
                setJoined(true)
              }
            })
            .catch((error) => {
              // Ошибка
              console.log(error);
            });
    },[])

    return (
        <ModalRoot activeModal={"TasksModal"} onClose={modalClose}>
            <ModalCard
                id="TasksModal"
                onClose={modalClose}
                icon={<Image borderRadius="l" src={coins} size={72} />}
                header='Задания'
                subheader='Выполни задания и каждый день получай 3 монеты бесплатно.'
                actions={notifications && favorite && recomended && joined &&
                    <React.Fragment>
                        <Spacing size={16} />
                        <Button
                        size="l"
                        mode="primary"
                        stretched
                        onClick={setPromoter}
                        >
                        Готово
                        </Button>
                    </React.Fragment>
                }
            >
                <SimpleCell
                    expandable="auto"
                    before={<Icon28Users3Outline />}
                    after={joined === true ? <Icon28CheckCircleOutline/>:
                    <IconButton onClick={joinGroup} aria-label="group">
                        <Icon28CheckCircleOff />
                    </IconButton>}
                >
                    Вступи в группу
                </SimpleCell>
                <SimpleCell
                    expandable="auto"
                    before={<Icon28Notifications />}
                    after={notifications === true ? <Icon28CheckCircleOutline/>:
                    <IconButton onClick={allowNotifications} aria-label="notifications">
                        <Icon28CheckCircleOff />
                    </IconButton>}
                >
                    Подпишись на уведомления
                </SimpleCell>
                <SimpleCell
                    expandable="auto"
                    before={<Icon28FavoriteOutline />}
                    after={favorite === true ? <Icon28CheckCircleOutline/>:
                    <IconButton onClick={addToFavorite} aria-label="favorite">
                        <Icon28CheckCircleOff />
                    </IconButton>}
                >
                    Добавь в избранное
                </SimpleCell>
                <SimpleCell
                    expandable="auto"
                    before={<Icon28AdvertisingOutline />}
                    after={recomended === true ? <Icon28CheckCircleOutline/>:
                    <IconButton onClick={recomend} aria-label="adversing">
                        <Icon28CheckCircleOff />
                    </IconButton>}
                >
                    Рекомендуй приложение
                </SimpleCell>
            </ModalCard>
        </ModalRoot>
    );
};

export default TasksModal;

TasksModal.propTypes = {
    modalClose: PropTypes.func,
    token: PropTypes.string,
    setPlayer: PropTypes.func,
    vkid: PropTypes.number,
};
