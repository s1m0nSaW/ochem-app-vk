import { Counter, Group, HorizontalScroll, Panel, PanelHeader, PanelHeaderBack, Tabs, TabsItem } from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";

import AllGames from "../componets/AllGames.js";
import GamesList from "../componets/GamesList.js";
import Snack from "../componets/Snack.js";

export const Games = ({ id, token, player, getPlayer, setModal, setGame, socket }) => {
    const [snackbar, setSnackbar] = useState(false);
    const [severity, setSeverity] = useState('info');
    const [message, setMessage] = useState('');
    const [selected, setSelected] = useState('my')
    const routeNavigator = useRouteNavigator();
    const [incomingRequestsCount, setIncomingRequestsCount] = useState(0);
    const [outgoingRequestsCount, setOutgoingRequestsCount] = useState(0);

    const onCloseSnack = () => {
        setMessage('');
        setSeverity('info');
        setSnackbar(false);
    }
    
    const onOpenSnackBar = (mes, sev) => {
        setMessage(mes);
        setSeverity(sev);
        setSnackbar(true);
    }

    const onUpdateUserGames = (userID, message, severity) => {
        socket.emit("upGames", { userId: userID });
        const data = {
            userId: userID,
            message: message, 
            severity: severity,
        }
        socket.emit("socketNotification", data);
    };

    useEffect(() => {
        socket.on("updateGames", ({ data }) => {
            if(data) getPlayer();
        });
    },[socket, getPlayer]);

    useEffect(()=>{
        const getIncoming = async () => {
            const fields = {
                games: player.gamesIn, token
            }
            await axios.post('https://ochem.ru/api/games', fields).then((data)=>{
                setIncomingRequestsCount(data.data.length)
            }).catch((err)=>{
                console.warn(err); 
            });
        }
        const getOutgoing = async () => {
            const fields = {
                games: player.gamesOut, token
            }
            await axios.post('https://ochem.ru/api/games', fields).then((data)=>{
                setOutgoingRequestsCount(data.data.length)
            }).catch((err)=>{
                console.warn(err); 
            });
        }
        if(player){
            getIncoming();
            getOutgoing();
        } else {
            routeNavigator.go('/home')
        }
    },[ player, token, routeNavigator]);

    return (
        <Panel id={id}>
            <PanelHeader
                before={
                    <PanelHeaderBack onClick={() => routeNavigator.back()} />
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
                            onClick={() => setSelected("all")}
                            aria-controls="tab-all"
                        >
                            Все игры
                        </TabsItem>
                        <TabsItem
                            id="my"
                            selected={selected === "my"}
                            onClick={() => setSelected("my")}
                            aria-controls="tab-my"
                        >
                            Мои игры
                        </TabsItem>
                        <TabsItem
                            id="in"
                            selected={selected === "in"}
                            onClick={() => setSelected("in")}
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
                            onClick={() => setSelected("out")}
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
                    <AllGames token={token} setModal={setModal} />
                )}
                {selected === "my" && (
                    <GamesList
                        token={token}
                        content={player?.games}
                        page={"my"}
                        onSuccess={onOpenSnackBar}
                        getPlayer={getPlayer}
                        setGame={setGame}
                        socket={socket}
                        player={player}
                        onUpdate={onUpdateUserGames}
                    />
                )}
                {selected === "in" && (
                    <GamesList
                        token={token}
                        content={player?.gamesIn}
                        page={"in"}
                        onSuccess={onOpenSnackBar}
                        getPlayer={getPlayer}
                        socket={socket}
                        player={player}
                        onUpdate={onUpdateUserGames}
                    />
                )}
                {selected === "out" && (
                    <GamesList
                        token={token}
                        content={player?.gamesOut}
                        page={"out"}
                        onSuccess={onOpenSnackBar}
                        getPlayer={getPlayer}
                        socket={socket}
                        player={player}
                        onUpdate={onUpdateUserGames}
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
    token:PropTypes.string,
    getPlayer: PropTypes.func,
    setModal: PropTypes.func,
    setGame: PropTypes.func,
    player: PropTypes.shape({
        _id: PropTypes.string,
        status: PropTypes.string,
        dailyRsvp: PropTypes.number,
        rsvp: PropTypes.number,
        rsvpStatus: PropTypes.bool,
        rsvpDate: PropTypes.number,
        games: PropTypes.array,
        gamesOut: PropTypes.array,
        gamesIn: PropTypes.array,
    }),
    socket: PropTypes.object,
};
