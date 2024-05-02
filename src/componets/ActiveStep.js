import React from "react";
import PropTypes from "prop-types";
import { Avatar, Button, ButtonGroup, Card, Div, Group, SimpleCell, Subhead, Text } from "@vkontakte/vkui";

const ActiveStep = ({ question, answered, user, game, friend, updateAnswered, next, rateTheGame, questions, friendInfo, socket }) => {
    const [ variant, setVariant ] = React.useState(0);
    const [onlines, setOnlines] = React.useState(null);

    const handleClick = (i) => {
        if(variant === 0){
            setVariant(i)
            if(i === 1)updateAnswered(user._id, question.answer1, question.correct)
            if(i === 2)updateAnswered(user._id, question.answer2, question.correct)
            if(i === 3)updateAnswered(user._id, question.answer3, question.correct)
            if(i === 4)updateAnswered(user._id, question.answer4, question.correct)
        }
    }

    const nextStep = () => {
        setVariant(0);
        next()
    }

    function isOnline(userId) {
        if(onlines){
            return Object.values(onlines).includes(userId);
        } else return false
    }

    React.useEffect(()=>{
        socket.on("onlines", ({ data }) => {
            setOnlines(data);
        });
    },[socket])

    React.useEffect(()=>{
        if (answered){
            if(user._id === answered.user1){
                if(answered.answer1 === question.answer1) setVariant(1)
                if(answered.answer1 === question.answer2) setVariant(2)
                if(answered.answer1 === question.answer3) setVariant(3)
                if(answered.answer1 === question.answer4) setVariant(4)
            } else if (user._id === answered.user2){
                if(answered.answer2 === question.answer1) setVariant(1)
                if(answered.answer2 === question.answer2) setVariant(2)
                if(answered.answer2 === question.answer3) setVariant(3)
                if(answered.answer2 === question.answer4) setVariant(4)
            } 
            if(answered.answer1 === 'none' && answered.answer2 === 'none') setVariant(0)
        }

    },[answered, question, user])
    return (<>
        {answered && <React.Fragment>
        {answered.answer1 !== 'none' && answered.answer2 !== 'none' ?
        <Card>
        {answered.correct === 'none' ? 
            <Div>
            {game.turn === user._id ?
                <>
                {answered.answer1 === answered.answer2 ?
                    <div style={{ padding: 20 }}>
                        <Subhead>{friend.firstName} отгадал(-а)</Subhead>
                        <Text>Вопрос {game.activeStep + 1}/{questions.length}: {question?.text}</Text>
                    </div>
                    :
                    <div style={{ padding: 20 }}>
                        <Subhead>{friend.firstName} не отгадал(-а)</Subhead>
                        <Text>Вопрос {game.activeStep + 1}/{questions.length}: {question?.text}</Text>
                    </div>
                    }
                </>:<>
                {answered.answer1 === answered.answer2 ?
                    <div style={{ padding: 20 }}>
                        <Subhead>Вы отгадали</Subhead>
                        <Text>Вопрос {game.activeStep + 1}/{questions.length}: {question?.text}</Text>
                    </div>:
                    <div style={{ padding: 20 }}>
                        <Subhead>Вы не отгадали</Subhead>
                        <Text>Вопрос {game.activeStep + 1}/{questions.length}: {question?.text}</Text>
                    </div>
                }
                </>
            }
            </Div>
            :
            <div style={{ padding: 20 }}>
                {question._id === answered.questionId && <Text variant="body2">Правильный ответ: <b>{question?.correct}</b></Text>}
                {question._id === answered.questionId && <Text variant="body1">Вопрос {game.activeStep + 1}/{questions.length}: <b>{question?.text}</b></Text>}
            </div>
            }
            <Div>
            {answered.user1 === user._id ? 
                <Group>
                    <SimpleCell
                        before={<Avatar size={40} src={user.avaUrl} />}
                        subtitle={`Ответ: ${answered?.answer1}`}
                    >
                        {user.firstName}
                    </SimpleCell>
                    <SimpleCell
                        before={<Avatar size={40} src={friend.avaUrl} onClick={()=>friendInfo()}>
                            {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                        </Avatar>}
                        subtitle={`Ответ: ${answered?.answer2}`}
                    >
                        {friend.firstName}
                    </SimpleCell>
                </Group>:
                <Group>
                    <SimpleCell
                        before={<Avatar size={40} src={friend.avaUrl} onClick={()=>friendInfo()}>
                            {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                        </Avatar>}
                        subtitle={`Ответ: ${answered?.answer1}`}
                    >
                        {friend.firstName}
                    </SimpleCell>
                    <SimpleCell
                        before={<Avatar size={40} src={user.avaUrl} />}
                        subtitle={`Ответ: ${answered?.answer2}`}
                    >
                        {user.firstName}
                    </SimpleCell>
                </Group>}
            </Div>
            {game.activeStep + 1 === questions.length ?
                <Div>
                <Button variant="contained" onClick={rateTheGame}>Результаты</Button>
                </Div>
                :
                <Div>
            {game.user1 === user._id && 
                <Button variant="contained" onClick={nextStep}>Следующий вопрос</Button>}
            </Div>}
        </Card>
        :<Card>
            {game.turn === user._id ? 
            <Div>
                {question.correct === 'none' || question.correct === '' || !question.correct ?
                <SimpleCell
                    before={<Avatar size={40} src={friend.avaUrl} onClick={()=>friendInfo()}>
                        {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                    </Avatar>}
                    subtitle="Вы отвечаете"
                >
                    {friend.firstName} отгадывает
                </SimpleCell>:
                <SimpleCell
                    before={<Avatar size={40} src={friend.avaUrl} onClick={()=>friendInfo()}>
                        {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                    </Avatar>}
                >
                    Отвечают оба игрока
                </SimpleCell>}
            </Div>:
            <Div>
                {question.correct === 'none' || question.correct === '' || !question.correct ?
                <SimpleCell
                        before={<Avatar size={40} src={friend.avaUrl} onClick={()=>friendInfo()}>
                            {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                        </Avatar>}
                    subtitle="Вы отгадываете"
                >
                    {friend.firstName} отвечает
                </SimpleCell>:
                <SimpleCell
                    before={<Avatar size={40} src={friend.avaUrl} onClick={()=>friendInfo()}>
                        {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                    </Avatar>}
                >
                    Отвечают оба игрока
                </SimpleCell>}
            </Div>}
            <div style={{ padding: 20 }}>
                <Subhead>Вопрос {game.activeStep + 1}/{questions.length}:</Subhead>
                <Text>{question.text}</Text>
            </div>
            <Div>
                <ButtonGroup mode="vertical" gap='space' stretched>
                `   <Button
                    size="s"
                    disabled={variant!==0 && variant!==1} 
                    onClick={()=>handleClick(1)}
                    mode={variant===1 ? "primary":"outline"} 
                    appearance={variant===1 ? "positive":"neutral"}
                    stretched>
                    {question.answer1}
                    </Button>
                    <Button
                    size="s"
                    disabled={variant!==0 && variant!==2} 
                    onClick={()=>handleClick(2)}
                    mode={variant===2 ? "primary":"outline"} 
                    appearance={variant===2 ? "positive":"neutral"}
                    stretched>
                    {question.answer2}
                    </Button>
                    {question.answer3 && <Button
                    size="s"
                    disabled={variant!==0 && variant!==3} 
                    onClick={()=>handleClick(3)}
                    mode={variant===3 ? "primary":"outline"} 
                    appearance={variant===3 ? "positive":"neutral"}
                    stretched>
                    {question.answer3}
                    </Button>}
                    {question.answer4 && <Button
                    size="s"
                    disabled={variant!==0 && variant!==4} 
                    onClick={()=>handleClick(4)}
                    mode={variant===4 ? "primary":"outline"} 
                    appearance={variant===4 ? "positive":"neutral"}
                    stretched>
                    {question.answer4}
                    </Button>}
                </ButtonGroup>
            </Div>
        </Card>}
        </React.Fragment>}</>
    );
};

export default ActiveStep;

ActiveStep.propTypes = {
    question: PropTypes.object,
    answered: PropTypes.object,
    user: PropTypes.object,
    game: PropTypes.object,
    friend: PropTypes.object,
    questions: PropTypes.array,
    updateAnswered: PropTypes.func, 
    next: PropTypes.func, 
    rateTheGame: PropTypes.func, 
    friendInfo: PropTypes.func,
    socket: PropTypes.object,
};