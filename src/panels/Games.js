import { Group, HorizontalScroll, Panel, PanelHeader, PanelHeaderBack, Tabs, TabsItem } from "@vkontakte/vkui";
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
    const [player, setPlayer] = useState(null);
    const [games, setGames] = useState(null);
    const [ onlines, setOnlines ] = useState(null);

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

    function isOnline(userId) {
        if(onlines){
            return Object.values(onlines).includes(userId);
        } else return false
    }
    
    const setGame = async (gameId) => {
        const fields = { vkid: fetchedUser.id, gameId: gameId };
        socket.emit('setGame', fields);
        routeNavigator.go('/game')
    }

    const timeout = setTimeout(()=>{
        if(games === null){
            if(fetchedUser){
                const fields = { vkid: fetchedUser.id };
                socket.emit('getUser', fields);
                socket.emit('getGames', fields);
                if(selected === "my") {
                    socket.emit('games', fields);
                    setSelected("my")
                }
            }
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
            } 
        });
    },[socket, selected, fetchedUser])

    useEffect(()=>{
        socket.on("myGames", ({ data }) => {
            clearTimeout(timeout)
            if(data.games !== games){
                setGames(data);
                onResetSnack('close')
            }
        });
    },[socket, games, onResetSnack, timeout])

    useEffect(()=>{
        socket.on("updatedUser", ({ data }) => {
            clearTimeout(timeout)
            if(data.user !== player){
                setPlayer(data.user)
            } 
        });
    },[socket, player, timeout])

    useEffect(()=>{
        socket.on("onlines", ({ data }) => {
            setOnlines(data);
        });
    },[socket])

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
                    </HorizontalScroll>
                </Tabs>
            </Group>
            <Group>
                {selected === "all" && (
                    <AllGames setModal={setModal} socket={socket} />
                )}
                {selected === "my" && (
                    <GamesList
                        games={games}
                        setGame={setGame}
                        userId={player._id}
                        isOnline={isOnline}
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
