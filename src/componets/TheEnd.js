import React from "react";
import PropTypes from 'prop-types';
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { Avatar, Button, ButtonGroup, Caption, Card, CellButton, Div, FormItem, PanelSpinner, Placeholder, Select, SimpleCell, Text } from "@vkontakte/vkui";
import { Icon20Favorite, Icon20DeleteOutline } from '@vkontakte/icons';

const TheEnd = ({ user, friend, game, socket, makeCompliment, isOnline }) => {
    const routeNavigator = useRouteNavigator();
    const [ connecting, setConnecting ] = React.useState(false);
    const [ answereds, setAnswereds ] = React.useState();
    const [ value, setValue ] = React.useState(5);
    const [ rating, setRating ] = React.useState();
    const [ disabled, setDisabled ] = React.useState(false);
    const [ canMake, setCanMake ] = React.useState(true);

    function countCorrectAnswers(personId) {
        try {
            let count = 0;
            answereds?.forEach((answered) => {
                if(answered.correct === 'none'){
                    if (answered.turn !== personId) {
                        if (answered.answer1 === answered.answer2) {
                            count++;
                        }
                    }
                } else {
                    if (answered.user1 === personId) {
                        if (answered.answer1 === answered.correct) {
                            count++;
                        }
                    } else {
                        if (answered.answer2 === answered.correct) {
                            count++;
                        }
                    }
                }
            });
            return count;
        } catch (error) {
            console.log(error)
        }
    }

    const removeGame = async () => {
        socket.emit("removeGame", { vkid: user.vkid, gameId: game._id });
    }

    const makeCompByFriend = () => {
        makeCompliment()
        setCanMake(false)
    }

    const RateGame = async () => {
        setCanMake(false)
        makeCompliment();
        const fields = {
            ratingId: rating._id,
            rate: value,
            gameId: game._id,
        }
        setDisabled(true)
        socket.emit("updateRating", fields);

        const data = {
            userId: friend.vkid,
            message: `${user.firstName} оценил игру в ${value} звезд`, 
            severity: 'success',
        }
        socket.emit("socketNotification", data);
    }

    React.useEffect(() => {
        socket.on("onTheEnd", ({ data }) => {
            console.log('data is come:', data)
            setRating(data.rating)
            setAnswereds(data.answereds)
            setConnecting(true)
        });
    },[socket]);

    React.useEffect(() => {
        socket.on("onRemoveGame", ({ data }) => {
            if(data) routeNavigator.go('/')
        });
    },[socket, routeNavigator]);

    return (
        <>
        { !connecting ? <PanelSpinner style={{height:'80vh'}}>Данные загружаются, пожалуйста, подождите...</PanelSpinner>
        :<>
            {rating !== undefined && 
            <Card>
                <Div>
                    <SimpleCell 
                        subhead={`Рейтинг игры: ${rating.rating}/5`} 
                        subtitle={`Оценок: ${rating.count}`}
                        after={<CellButton mode='danger' after={<Icon20DeleteOutline/>} onClick={removeGame}></CellButton>}
                    >
                    Вы играли в игру:<br/>{rating.theme}
                    </SimpleCell>
                </Div>
                <Div>
                    {friend &&
                        <SimpleCell
                        before={<Avatar size={40} src={friend.avaUrl}>
                            {isOnline(friend.vkid) && <Avatar.BadgeWithPreset preset="online" />}
                        </Avatar>}
                        subtitle={`Отгадано: ${countCorrectAnswers(friend._id)}`}
                    >
                        {friend.firstName}
                    </SimpleCell>}
                    {user && 
                        <SimpleCell
                        before={<Avatar size={40} src={user.avaUrl} />}
                        subtitle={`Отгадано: ${countCorrectAnswers(user._id)}`}
                    >
                        {user.firstName}
                    </SimpleCell>}
                </Div>
                {rating.games.includes(game._id) ?
                    <Placeholder
                        header="Спасибо"
                        action={canMake && <Button size="m" mode="tertiary" onClick={makeCompByFriend}>
                                    Подарить комплимент пользователю {friend?.firstName}
                                </Button>}
                    >
                        Вы уже поставили оценку
                    </Placeholder>
                :<>
                    {game.user1 === user._id ?
                        <Div style={{ alignItems:'center', justifyContent:'center', padding:'20px', display:'flex', textAlign:'center', flexDirection: 'column'}}>
                            <Text weight="1">Оцените игру вместе с {friend.firstName}</Text>
                            <ButtonGroup mode='vertical' align="center" gap='space'>
                                <FormItem top="Рейтинг">
                                    <Select
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    before={<Icon20Favorite/>}
                                    options={[
                                        { label: '1', value: 1 },
                                        { label: '2', value: 2 },
                                        { label: '3', value: 3 },{ label: '4', value: 4 },{ label: '5', value: 5 },
                                    ]}
                                    />
                                </FormItem>
                                <Button size="m" mode="tertiary" disabled={disabled} onClick={RateGame}>
                                Оценить
                                </Button>
                            </ButtonGroup>
                            <Caption weight="1">Только Вы можете поставить оценку</Caption>
                        </Div>:
                        <Div style={{ alignItems:'center', justifyContent:'center', padding:'20px', display:'flex', textAlign:'center', flexDirection: 'column'}}>
                            <Text weight="1">Оцените игру вместе</Text>
                            {canMake && 
                            <ButtonGroup mode='vertical' align="center" gap='space'>
                                <Button size="m" mode="tertiary" onClick={makeCompByFriend}>
                                    Подарить комплимент пользователю {friend?.firstName}
                                </Button>
                            </ButtonGroup>}
                            <Caption weight="1">
                            Только {friend?.firstName} может поставить оценку<br/>
                            Рейтинг игры: {rating.rating} <Icon20Favorite/>
                            </Caption>
                        </Div>}
                </>
                }
            </Card>}</>}
        </>
    );
};

export default TheEnd;

TheEnd.propTypes = {
    user: PropTypes.object,
    friend: PropTypes.object,
    game: PropTypes.object,
    socket: PropTypes.object,
    makeCompliment: PropTypes.func,
    isOnline: PropTypes.func,
};