import { Div, FixedLayout, Panel, PanelHeader, PanelHeaderBack, PanelSpinner, Separator, WriteBar, WriteBarIcon, } from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import PropTypes from "prop-types";
import React from "react";
import axios from "axios";

import { WhoIsFirst } from "../componets/WhoIsFirst.js";
import ActiveStep from "../componets/ActiveStep.js";
import TheEnd from "../componets/TheEnd.js";
import Chat from "../componets/Chat.js";
import ComlimentModal from "../componets/ComlimentModal.js";
import UserInfoModal from "../componets/UserInfoModal.js";

export const Game = ({ id, game, user, token, setGame, socket, setModal }) => {
    const fixedLayoutInnerElRef = React.useRef();
    const routeNavigator = useRouteNavigator();
    const [ connecting, setConnecting ] = React.useState(false);
    const [ friend, setFriend ] = React.useState(null);
    const [ questions, setQuestions ] = React.useState(null);
    const [ messages, setMessages ] = React.useState();
    const [ answered, setAnswered ] = React.useState(null);
    const [ rateGame, setRateGame ] = React.useState(false);
    const [bottomPadding, setBottomPadding] = React.useState(0);
    const [ value, setValue ] = React.useState('');

    const getGame = async () => {
        const fields = { token: token }
        await axios.post(`https://ochem.ru/api/game/${game._id}`, fields).then((data)=>{
            setGame(data.data)
        }).catch((err)=>{
            console.warn(err);
        });
    };

    const nextQuestion = () => {
        if(game.turn === user._id){
            setTurn(friend._id, game.activeStep + 1)
        } else {
            setTurn(user._id, game.activeStep + 1)
        }
    }

    const setTurn = async (u_id, step) => {
        setConnecting(false)
        const fields = { userId: u_id, token: token }
        await axios.post(`https://ochem.ru/api/begin-game/${game._id}`, fields).catch((err)=>{console.warn(err);});
        newAnswered(u_id, step);
        socket.emit("updateGame", { gameId: game._id });
    }

    const modalClose = () => { setModal(null)}

    const makeCompliment = () => {
        setModal(<ComlimentModal player={user} friend={friend} socket={socket} token={token} modalClose={modalClose}/>)
    }

    const userInfo = () => {
        setModal(<UserInfoModal friend={friend} token={token} modalClose={modalClose}/>)
    }

    const newAnswered = (u_id,step) => {
        const data = {
            token: token,
            questionId: questions[step]._id,
            gameId: game._id,
            turn: u_id,
            user1: game.user1,
            user2: game.user2,
            answer1: 'none',
            answer2: 'none',
        }
        axios.post(`https://ochem.ru/api/answer`, data)
        .then((data)=>{
            updateGame(data.data._id, step)
        })
        .catch((err)=>console.warn(err));
    }

    const updateGame = (answeredId, activeStep) => {
        const fields = { answeredId, activeStep, token }
        axios.post(`https://ochem.ru/api/up-game/${game._id}`, fields)
        .then((data)=>setGame(data.data))
        .catch((err)=>{console.warn(err);});
        socket.emit("updateGame", { gameId: game._id });
    }

    const updateAnswered = async ( userId, answer, correct ) => {
        if (correct === 'none' || correct === '' || !correct){
            if (userId === answered.user1){
                const fields = { answer1: answer, answer2: 'none', correct: 'none', token }
                await axios.post(`https://ochem.ru/api/up-answer/${answered._id}`, fields).catch((err)=>{console.warn(err);});
                socket.emit("upAnswered", { gameId: game._id, answeredId: answered._id })
            } else if (userId === answered.user2){
                const fields = { answer2: answer, answer1: 'none', correct: 'none', token }
                await axios.post(`https://ochem.ru/api/up-answer/${answered._id}`, fields).catch((err)=>{console.warn(err);});
                socket.emit("upAnswered", { gameId: game._id, answeredId: answered._id })
            }
        } else {
            if (userId === answered.user1){
                const fields = { answer1: answer, answer2: 'none', correct: correct, token }
                await axios.post(`https://ochem.ru/api/up-answer/${answered._id}`, fields).catch((err)=>{console.warn(err);});
                socket.emit("upAnswered", { gameId: game._id, answeredId: answered._id })
            } else {
                const fields = { answer2: answer, answer1: 'none', correct: correct, token }
                await axios.post(`https://ochem.ru/api/up-answer/${answered._id}`, fields).catch((err)=>{console.warn(err);});
                socket.emit("upAnswered", { gameId: game._id, answeredId: answered._id })
            }
        }
        getGame();
    }

    const rateTheGame = () => {
        setRateGame(true)
        socket.emit("updateGame", { gameId: game._id });
    }

    const sendMessage = async () => {
        const fields = {
            senderId: user._id,
            content: value,
            gameId: game._id,
            date: +new Date(),
            token,
        };
        await axios.post(`https://ochem.ru/api/message`, fields).catch((err)=>{console.warn(err);});
        socket.emit("sendMessage", fields);
        const data = {
            userId: friend._id,
            message: `Сообщение от ${user.firstName}`, 
            severity: 'info'
        }
        socket.emit("socketNotification", data);
        setValue('')
    };

    const updateBottomPadding = () => {
        const el = fixedLayoutInnerElRef.current;
        if (el) {
            const height = el.offsetHeight;
            if (height !== bottomPadding) {
                setBottomPadding(height);
            }
        }
    };

    React.useEffect(() => {
        const searchParams = { gameId: game?._id, userId: user?._id };
        socket.emit('join', searchParams);
    },[game, user, socket]);

    React.useEffect(() => {
        const getMessages = async () => {
            const data = { token }
            await axios.post(`https://ochem.ru/api/messages/${game._id}`, data).then((data)=> setMessages(data.data.reverse())).catch((err)=>{console.warn(err);});
        };

        socket.on("message", ({ data }) => {
            if(data) getMessages()
        });
    },[socket, id, game, token]);

    React.useEffect(() => {
        socket.on("deleteGame", ({ data }) => {
            if(data){
                routeNavigator.go('/home') 
            }
        });
    },[socket, routeNavigator]);

    React.useEffect(() => {
        const updateGame = async (_id) => {
            const fields = { token: token }
            await axios.post(`https://ochem.ru/api/game/${_id}`, fields).then((data)=>{
                setGame(data.data)
            }).catch((err)=>{
                console.warn(err);
            });
        };
        socket.on("update", ({ data }) => {
            updateGame(data.gameId)
        });
    },[socket, setGame, token]);

    React.useEffect(() => {
        const updateAnswered = async (id) => {
            const data = { token }
                await axios.post(`https://ochem.ru/api/answer/${id}`, data).then((data)=>{
                setAnswered(data.data)
            }).catch((err)=>{
                console.warn(err);
            });
        };
        socket.on("answered", ({ data }) => {
            updateAnswered(data.aswId)
        });
    },[socket, token]);

    React.useEffect(()=>{
        const getQuestions = async () => {
            const fields = { theme: game.theme, token: token };
            await axios.post(`https://ochem.ru/api/questions`, fields).then((data)=>{
                setQuestions(data.data)
                //console.log('questions получены')
            }).catch((err)=>{console.warn(err);});
        };

        const getUser2 = async () => {
            let friend
            if(game.user1 === user._id){
                friend = game.user2
            } else { friend = game.user1 }
            const data = { id: friend }
            await axios.post(`https://ochem.ru/api/get-user`, data).then((data)=>{
                setConnecting(true);
                setFriend(data.data)
            }).catch((err)=>{console.warn(err);});
        };

        const getAnswered = async () => {
            if(game.answered) {
                const data = { token }
                await axios.post(`https://ochem.ru/api/answer/${game.answered}`, data).then((data)=>{
                    setAnswered(data.data)
                    //console.log('answered получен')
                }).catch((err)=>{
                    console.warn(err);
                });
            }
        };

        const getMessages = async () => {
            const data = { token }
            await axios.post(`https://ochem.ru/api/messages/${game._id}`, data).then((data)=> setMessages(data.data.reverse())).catch((err)=>{console.warn(err);});
        };

        if(game) {
            getQuestions();
            getAnswered();
            getMessages();
            getUser2();
        } else {
            routeNavigator.go('/home')
        }
    },[game, user, routeNavigator, token]);

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.back()} />}>
            {game.gameName}
            </PanelHeader>
            {connecting === false ? <PanelSpinner style={{height:'80vh'}}>Данные загружаются, пожалуйста, подождите...</PanelSpinner>:
            <Div>
                {game?.turn === null ? 
                    <WhoIsFirst user={user} friend={friend} setTurn={setTurn} game={game}/>
                    :<>{answered && game && rateGame === false ? <ActiveStep
                        question={questions[game.activeStep]}
                        answered={answered} 
                        user={user}
                        game={game}
                        friend={friend}
                        updateAnswered={updateAnswered}
                        next={nextQuestion}
                        rateTheGame={rateTheGame}
                        questions={questions}
                        friendInfo={userInfo}
                    />:
                    <TheEnd user={user} friend={friend} game={game} token={token} socket={socket} makeCompliment={makeCompliment}/>}
                </>}
            </Div>}
            <Div>
                <Chat messages={messages} user={user}/>
            </Div>
            <div style={{ height: bottomPadding }} />
            <FixedLayout vertical="bottom" filled>
            <div ref={fixedLayoutInnerElRef}>
                <Separator wide />
                <WriteBar
                after={value.length > 0 && <WriteBarIcon onClick={sendMessage} mode="send" />}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onHeightChange={() => updateBottomPadding()}
                placeholder="Сообщение"
                />
            </div>
            </FixedLayout>
        </Panel>
    );
};

Game.propTypes = {
    id: PropTypes.string.isRequired,
    game: PropTypes.object,
    user: PropTypes.object,
    token: PropTypes.string,
    setGame: PropTypes.func,
    socket: PropTypes.object,
    setModal: PropTypes.func,
};
