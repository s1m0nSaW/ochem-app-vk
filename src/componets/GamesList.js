import React from "react";
import { List, PanelSpinner, Placeholder, SimpleCell, Text } from "@vkontakte/vkui";
import { Icon16CrownCircleFillVkDating, Icon28PlayCircleFillAzure, Icon28Done, Icon28Delete, Icon56BlockOutline } from '@vkontakte/icons';
import PropTypes from 'prop-types';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

const GamesList = ({ page, games, acceptGame, removeGame, setGame }) => {
    const routeNavigator = useRouteNavigator();

    const selectGame = (gameId) => {
        if(page === 'my'){
            setGame(gameId)
            routeNavigator.go('/game')
        }
    }

    const deleteGame = async (game) => {
        if (window.confirm('Вы действительно хотите удалить игру?')) {
            removeGame(game);
        }
    }

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
                            <>
                                {page === 'my' && <Icon28Delete onClick={()=>deleteGame(game._id)}/>}
                                {page === 'in' && <Icon28Delete onClick={()=>deleteGame(game._id)}/>}
                                {page === 'out' && <Icon28Delete onClick={()=>deleteGame(game._id)}/>}
                            </>
                        }
                        before={
                            <>
                                {page === 'my' &&
                                    <Icon28PlayCircleFillAzure  onClick={()=>selectGame(game._id)}/>}
                                {page === 'in' &&
                                    <Icon28Done onClick={()=>acceptGame(game._id)}/>}
                                </>
                        }
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