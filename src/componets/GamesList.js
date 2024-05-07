import React from "react";
import { List, PanelSpinner, Placeholder, SimpleCell, Text } from "@vkontakte/vkui";
import { Icon16CrownCircleFillVkDating, Icon28PlayCircleFillAzure, Icon28Done, Icon28Delete, Icon56BlockOutline } from '@vkontakte/icons';
import PropTypes from 'prop-types';

const GamesList = ({ page, games, acceptGame, removeGame, setGame }) => {

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
                        after={
                            <Icon28Delete/>
                        }
                        before={
                            <>
                                {page === 'my' &&
                                    <Icon28PlayCircleFillAzure/>}
                                {page === 'in' &&
                                    <Icon28Done/>}
                                </>
                        }
                        onClick={()=> {
                            if (page === 'in') {
                                acceptGame(game._id);
                            } else if (page === 'my') {
                                setGame(game._id);
                            } else if (page === 'out') {
                                removeGame(game._id);
                            }
                        }}
                    >
                        {game.gameName}
                    </SimpleCell>
                ))}
            </List>:
            <Placeholder 
                icon={<Icon56BlockOutline />}
                header={<>
                    {page === 'my' && 'У Вас ещё нет игр'}
                    {page === 'in' && 'У Вас нет входящих заявок на игры'}
                    {page === 'out' && 'У Вас нет отправленных заявок на игры'}
                </>}
            >
                Вы можете создать новую игру на главной странице профиля
            </Placeholder>}
        </React.Fragment>}
        </>
    );
};

export default GamesList;

GamesList.propTypes = {
    page:PropTypes.string,
    games: PropTypes.array,
    acceptGame: PropTypes.func,
    removeGame: PropTypes.func,
    setGame: PropTypes.func,
};