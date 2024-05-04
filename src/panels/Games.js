import { Alert, Counter, Group, HorizontalScroll, Panel, PanelHeader, PanelHeaderBack, Tabs, TabsItem } from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

import AllGames from "../componets/AllGames.js";
import GamesList from "../componets/GamesList.js";
import Snack from "../componets/Snack.js";

export const Games = ({ id, fetchedUser, setModal, socket, onResetSnack, onChangePage }) => {
    const [snackbar, setSnackbar] = useState(false);
    const [severity, setSeverity] = useState('info');
    const [message, setMessage] = useState('');
    const [selected, setSelected] = useState('my');
    const routeNavigator = useRouteNavigator();
    const [incomingRequestsCount, setIncomingRequestsCount] = useState(0);
    const [outgoingRequestsCount, setOutgoingRequestsCount] = useState(0);
    const [player, setPlayer] = useState(null);
    const [games, setGames] = useState(null);

    const onCloseSnack = () => {
        setMessage('');
        setSeverity('info');
        setSnackbar(false);
    }

    const onClickBack = () => {
        if(player?.status !== "sponsor"){
            onChangePage()
        }
        const fields = { vkid: fetchedUser.id };
        socket.emit('getUser', fields);
        routeNavigator.go('/home')
    }

    const onClickAll = () => {
        if(player?.status !== "sponsor"){
            onChangePage()
        }
        setGames(null)
        const fields = { vkid: fetchedUser.id };
        socket.emit('getAllGames', fields);
        setSelected("all")
    }

    const onClickMy = () => {
        if(player?.status !== "sponsor"){
            onChangePage()
        }
        setGames(null)
        const fields = { vkid: fetchedUser.id };
        socket.emit('games', fields);
        setSelected("my")
    }

    const onClickIn = () => {
        if(player?.status !== "sponsor"){
            onChangePage()
        }
        setGames(null)
        const fields = { vkid: fetchedUser.id };
        socket.emit('gamesIn', fields);
        setSelected("in")
    }

    const onClickOut = () => {
        if(player?.status !== "sponsor"){
            onChangePage()
        }
        setGames(null)
        const fields = { vkid: fetchedUser.id };
        socket.emit('gamesOut', fields);
        setSelected("out")
    }

    const removeGame = (gameId) => {
        setModal(
            <Alert
                actions={[
                    {
                    title: 'Отмена',
                    mode: 'cancel',
                    },
                    {
                    title: 'Удалить',
                    mode: 'destructive',
                    action: () =>{
                        const fields = { vkid: fetchedUser.id, gameId: gameId };
                        socket.emit('removeGame', fields);
                    },
                    },
                ]}
                actionsLayout="horizontal"
                dismissButtonMode="inside"
                onClose={()=>setModal(null)}
                header="Удаление игры"
                text="Вы уверены, что хотите удалить все данные игры для всех пользователей, включая сообщения?"
            />
        );
        
    }

    const acceptGame = async (gameId) => {
        const fields = { gameId: gameId };
        socket.emit('acceptGame', fields);
        const data = { vkid: fetchedUser.id };
        socket.emit('getGames', data);
        setSelected("my")
    }
    
    const setGame = async (gameId) => {
        const fields = { vkid: fetchedUser.id, gameId: gameId };
        socket.emit('setGame', fields);
    }

    const timeout = setTimeout(()=>{
        if(player === null && fetchedUser){
            const fields = { vkid: fetchedUser.id };
            socket.emit('getUser', fields);
            socket.emit('getGames', fields);
            socket.emit('games', fields);
        }
    },2000)

    useEffect(()=>{
        socket.on("onRemoveGame", ({ data }) => {
            if(data){
                setGames(null)
                const fields = { vkid: fetchedUser.id };
                socket.emit('getGames', fields);
                if(selected === "my") {
                    socket.emit('games', fields);
                    setSelected("my")
                }
                if(selected === "in") {
                    socket.emit('gamesIn', fields);
                    setSelected("in")
                }
                if(selected === "out") {
                    socket.emit('gamesOut', fields);
                    setSelected("out")
                }
            } 
        });
    },[socket, selected, fetchedUser])

    useEffect(()=>{
        socket.on("myGames", ({ data }) => {
            if(data.games !== games){
                setGames(data);
                onResetSnack('close')
                clearTimeout(timeout)
            }
        });
    },[socket, games, onResetSnack, timeout])

    useEffect(()=>{
        socket.on("updatedUser", ({ data }) => {
            if(data.user !== player){
                setPlayer(data.user)
                clearTimeout(timeout)
            } 
        });
    },[socket, player, timeout])

    useEffect(() => {
        socket.on("incoming", ({ data }) => {
            setIncomingRequestsCount(data)
        });
        socket.on("outgoing", ({ data }) => {
            setOutgoingRequestsCount(data)
        });
    },[socket]);

    return (
        <Panel id={id}>
            <PanelHeader
                before={
                    <PanelHeaderBack onClick={onClickBack} />
                }
            >
                Мои игры
            </PanelHeader>
            <Group>
                <Tabs
                    withScrollToSelectedTab
                    scrollBehaviorToSelectedTab="center"
                >
                    <HorizontalScroll arrowSize="m">
                        <TabsItem
                            id="all"
                            selected={selected === "all"}
                            onClick={onClickAll}
                            aria-controls="tab-all"
                        >
                            Все игры
                        </TabsItem>
                        <TabsItem
                            id="my"
                            selected={selected === "my"}
                            onClick={onClickMy}
                            aria-controls="tab-my"
                        >
                            Мои игры
                        </TabsItem>
                        <TabsItem
                            id="in"
                            selected={selected === "in"}
                            onClick={onClickIn}
                            aria-controls="tab-in"
                            after={incomingRequestsCount !== 0 && <Counter size="s" mode="prominent">
                            {incomingRequestsCount}
                            </Counter>}
                        >
                            Входящие
                        </TabsItem>
                        <TabsItem
                            id="out"
                            selected={selected === "out"}
                            onClick={onClickOut}
                            aria-controls="tab-out"
                            after={outgoingRequestsCount !== 0 && <Counter size="s" mode="prominent">
                            {outgoingRequestsCount}
                            </Counter>}
                        >
                            Отправленные
                        </TabsItem>
                    </HorizontalScroll>
                </Tabs>
            </Group>
            <Group>
                {selected === "all" && (
                    <AllGames setModal={setModal} socket={socket} />
                )}
                {selected === "my" && (
                    <GamesList
                        page={"my"}
                        games={games}
                        acceptGame={acceptGame}
                        removeGame={removeGame}
                        setGame={setGame}
                    />
                )}
                {selected === "in" && (
                    <GamesList
                        page={"in"}
                        games={games}
                        acceptGame={acceptGame}
                        removeGame={removeGame}
                        setGame={setGame}
                    />
                )}
                {selected === "out" && (
                    <GamesList
                        page={"out"}
                        games={games}
                        acceptGame={acceptGame}
                        removeGame={removeGame}
                        setGame={setGame}
                    />
                )}
            </Group>
            {snackbar && (
                <Snack
                    severity={severity}
                    message={message}
                    onExit={onCloseSnack}
                />
            )}
        </Panel>
    );
};

Games.propTypes = {
    id: PropTypes.string.isRequired,
    setModal: PropTypes.func,
    socket: PropTypes.object,
    fetchedUser: PropTypes.object,
    onResetSnack: PropTypes.func,
    onChangePage: PropTypes.func,
};
