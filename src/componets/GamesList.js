import React from "react";
import { Avatar, List, PanelSpinner, Placeholder, SimpleCell, Text } from "@vkontakte/vkui";
import { Icon16CrownCircleFillVkDating, Icon56BlockOutline } from '@vkontakte/icons';
import PropTypes from 'prop-types';

const GamesList = ({ games, setGame, userId, isOnline }) => {

    return (
        <>
        {games === null ? <PanelSpinner style={{height:'50vh'}}>Данные загружаются, пожалуйста, подождите...</PanelSpinner>:
        <React.Fragment>
        {games.length !== 0 ?
            <List>
                {games?.map((game) => (
                    <SimpleCell
                        key={game._id} 
                        subtitle={<Text>Тема: {game.theme}&nbsp;{game.forSponsor && <Icon16CrownCircleFillVkDating style={{
                            display: 'inline-block',
                            verticalAlign: 'text-top',
                        }}/>}</Text>}
                        before={ userId === game.user1 ? 
                            <Avatar size={40} src={game.userUrl2}>
                                {isOnline(game.user2vkid) && <Avatar.BadgeWithPreset preset="online" />}
                            </Avatar>
                            :<Avatar size={40} src={game.userUrl1}>
                                {isOnline(game.user1vkid) && <Avatar.BadgeWithPreset preset="online" />}
                            </Avatar>
                        }
                        onClick={()=> {setGame(game._id)}}
                    >
                        {game.gameName}
                    </SimpleCell>
                ))}
            </List>:
            <Placeholder 
                icon={<Icon56BlockOutline />}
                header={'У Вас ещё нет игр'}
            >
                Вы можете создать новую игру на главной странице профиля
            </Placeholder>}
        </React.Fragment>}
        </>
    );
};

export default GamesList;

GamesList.propTypes = {
    games: PropTypes.array,
    setGame: PropTypes.func,
    userId: PropTypes.string,
    isOnline: PropTypes.func,
};