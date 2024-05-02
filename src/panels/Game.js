import { Div, FixedLayout, Panel, PanelHeader, PanelHeaderBack, PanelSpinner, Separator, WriteBar, WriteBarIcon, } from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import PropTypes from "prop-types";
import React from "react";

import { WhoIsFirst } from "../componets/WhoIsFirst.js";
import ActiveStep from "../componets/ActiveStep.js";
import TheEnd from "../componets/TheEnd.js";
import Chat from "../componets/Chat.js";
import ComlimentModal from "../componets/ComlimentModal.js";
import UserInfoModal from "../componets/UserInfoModal.js";

export const Game = ({ id, fetchedUser, socket, setModal }) => {
    const fixedLayoutInnerElRef = React.useRef();
    const routeNavigator = useRouteNavigator();
    const [ connecting, setConnecting ] = React.useState(false);

    const [ friend, setFriend ] = React.useState(null);
    const [ user, setUser ] = React.useState(null);
    const [ game, setGame ] = React.useState(null);
    const [ questions, setQuestions ] = React.useState(null);
    const [ messages, setMessages ] = React.useState();

    const [ answered, setAnswered ] = React.useState(null);
    const [ rateGame, setRateGame ] = React.useState(false);
    const [bottomPadding, setBottomPadding] = React.useState(0);
    const [ value, setValue ] = React.useState('');
    const [onlines, setOnlines] = React.useState(null);

    const nextQuestion = () => {
        console.log('turn:', game.turn)
        if(game.turn === user._id){
            const fields = { userId: friend._id, gameId: game._id }
            socket.emit('nextStep', fields);
            console.log('userId:',friend._id)
        } else {
            const fields = { userId: user._id, gameId: game._id }
            socket.emit('nextStep', fields);
            console.log('userId:',user._id)
        }
    }

    const setTurn = async (u_id) => {
        setConnecting(false)
        const fields = { 
            userId: u_id,
            gameId: game._id
        }
        socket.emit('setTurn', fields);
    }

    function isOnline(userId) {
        if(onlines){
            return Object.values(onlines).includes(userId);
        } else return false
    }

    const modalClose = () => { setModal(null)}

    const makeCompliment = () => {
        setModal(<ComlimentModal player={user} friend={friend} socket={socket} modalClose={modalClose}/>)
    }

    const userInfo = () => {
        const fields = { 
            vkid: user.vkid,
            friendId: friend._id
        }
        socket.emit('getUserCompliment', fields);
        setModal(<UserInfoModal friend={friend} socket={socket} modalClose={modalClose} isOnline={isOnline}/>)
    }

    const updateAnswered = async ( userId, answer, correct ) => {
        if (correct === 'none' || correct === '' || !correct){
            if (userId === answered.user1){
                const fields = { answer1: answer, answer2: 'none', correct: 'none', gameId: game._id, id: answered._id }
                socket.emit("upAnswered", fields)
            } else if (userId === answered.user2){
                const fields = { answer2: answer, answer1: 'none', correct: 'none', gameId: game._id, id: answered._id }
                socket.emit("upAnswered", fields)
            }
        } else {
            if (userId === answered.user1){
                const fields = { answer1: answer, answer2: 'none', correct: correct, gameId: game._id, id: answered._id }
                socket.emit("upAnswered", fields)
            } else {
                const fields = { answer2: answer, answer1: 'none', correct: correct, gameId: game._id, id: answered._id }
                socket.emit("upAnswered", fields)
            }
        }
    }

    const rateTheGame = () => {
        socket.emit("theEnd", { gameId: game._id, theme: game.theme });
        setRateGame(true)
    }

    const sendMessage = async () => {
        const fields = {
            senderId: user._id,
            content: value,
            gameId: game._id,
            date: +new Date(),
        };
        socket.emit("sendMessage", fields);
        setValue('')
        const data = { 
            vkid: user.vkid,
            gameId: game._id,
            status: false,
        };
        socket.emit('typing', data);
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

    const onClickBack = () => {
        const fields = { vkid: user.vkid };
        socket.emit('getGames', fields);
        socket.emit('games', fields);
        routeNavigator.go('/games')
    }

    const onChangeText = (e) => {
        let newValue = e.target.value
        setValue(newValue)
        if (newValue.length > 0) {
            const fields = { 
                vkid: user.vkid,
                gameId: game._id,
                status: true,
            };
            socket.emit('typing', fields);
        } else {
            const fields = { 
                vkid: user.vkid,
                gameId: game._id,
                status: false,
            };
            socket.emit('typing', fields);
        }
    }

    const timeout = setTimeout(()=>{
        if(game === null && fetchedUser){
            const fields = { vkid: fetchedUser.id };
            socket.emit('getGames', fields);
            socket.emit('games', fields);
            routeNavigator.go('/games')
        }
    },2000)

    React.useEffect(() => {
        if(game && user){
            const searchParams = { gameId: game._id, userId: user._id };
            socket.emit('join', searchParams);
        }
    },[game, user, socket]);

    React.useEffect(() => {
        socket.on("gameMessages", ({ data }) => {
            setMessages(data)
        });
    },[socket]);

    React.useEffect(() => {
        socket.on("deleteGame", ({ data }) => {
            if(data){
                routeNavigator.go('/home') 
            }
        });
    },[socket, routeNavigator]);

    React.useEffect(() => {
        socket.on("updatedGame", ({ data }) => {
            clearTimeout(timeout)
            if(game !== data) setGame(data)
            setConnecting(true)
        });
    },[socket, game, timeout]);

    React.useEffect(() => {
        socket.on("answered", (data) => {
            if(answered !== data.data)setAnswered(data.data)
        });
    },[socket, answered]);

    React.useEffect(() => {
        socket.on("questions", (data) => {
            if(questions !== data.data) setQuestions(data.data)
        });
    },[socket, questions]);

    React.useEffect(() => {
        socket.on("playingGame", (data) => {
            if(user !== data.data.user) setUser(data.data.user)
            if(friend !== data.data.friend) setFriend(data.data.friend)
        });
    },[socket, user, friend]);

    React.useEffect(() => {
        socket.on("error", ({ data }) => {
            console.log(data)
        });
    },[socket]);

    React.useEffect(()=>{
        socket.on("onlines", ({ data }) => {
            setOnlines(data);
        });
    },[socket])

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={onClickBack} />}>
            {game?.gameName}
            </PanelHeader>
            {connecting === false ? <PanelSpinner style={{height:'80vh'}}>Данные загружаются, пожалуйста, подождите...</PanelSpinner>:
            <Div>
                {game?.turn === null ? 
                    <WhoIsFirst user={user} friend={friend} setTurn={setTurn} game={game}/>
                    :
                    <>{rateGame === false ?
                    <ActiveStep
                        question={questions && questions[game.activeStep]}
                        answered={answered && answered} 
                        user={user}
                        game={game}
                        friend={friend}
                        updateAnswered={updateAnswered}
                        next={nextQuestion}
                        rateTheGame={rateTheGame}
                        questions={questions}
                        friendInfo={userInfo}
                        socket={socket}
                    />:
                    <TheEnd user={user} friend={friend} game={game} socket={socket} makeCompliment={makeCompliment} isOnline={isOnline}/>}
                </>}
            </Div>}
            <Div>
                <Chat messages={messages} user={user} socket={socket} id={fetchedUser.id}/>
            </Div>
            <div style={{ height: bottomPadding }} />
            <FixedLayout vertical="bottom" filled>
            <div ref={fixedLayoutInnerElRef}>
                <Separator wide />
                <WriteBar
                    after={value.length > 0 && <WriteBarIcon onClick={sendMessage} mode="send" />}
                    value={value}
                    onChange={onChangeText}
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
    fetchedUser: PropTypes.object,
    socket: PropTypes.object,
    setModal: PropTypes.func,
};
