import React from "react";
import axios from "axios";
import { List, PanelSpinner, Placeholder, SimpleCell, Text } from "@vkontakte/vkui";
import { Icon16CrownCircleFillVkDating, Icon28PlayCircleFillAzure, Icon28Done, Icon28Delete, Icon56BlockOutline } from '@vkontakte/icons';
import PropTypes from 'prop-types';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

const GamesList = ({ token, content, page, onSuccess, getPlayer, setGame, socket, onUpdate, player }) => {
    const routeNavigator = useRouteNavigator();
    const [games, setGames] = React.useState(null);

    const selectGame = (_game) => {
        if(page === 'my'){
            setGame(_game)
            routeNavigator.go('/game')
        }
    }

    const removeGame = async (game) => {
        socket.emit("removeGame", { gameID: game._id});
        const fields = {
            token: token,
            game: game._id,
            user1:game.user1,
            user2:game.user2,
            status: game.status,
        }
        await axios.post(`https://ochem.ru/api/del-game`, fields).then((data)=>{
            if(data) {
                onSuccess('Игра удалена', 'success')
                if(player._id === game.user1){
                    onUpdate(game.user2, `${player.nickname} удалил игру`, 'error')
                } else {
                    onUpdate(game.user1, `${player.nickname} удалил игру`, 'error')
                }
                getPlayer();
            }
        }).catch((err)=>{
            console.warn(err); 
        });
    }

    const acceptGame = async (game) => {
        const fields = {
            token: token
        }
        await axios.post(`https://ochem.ru/api/join/${game._id}`, fields).then((data)=>{
            if(data) {
                onSuccess('Игра принята', 'success');
                if(player._id === game.user1){
                    onUpdate(game.user2, `${player.nickname} согласен играть`, 'success')
                } else {
                    onUpdate(game.user1, `${player.nickname} согласен играть`, 'success')
                }
                getPlayer();
            }
        }).catch((err)=>{
            console.warn(err); 
        });
    }

    const deleteGame = async (game) => {
        if (window.confirm('Вы действительно хотите удалить игру?')) {
            removeGame(game);
        }
    }

    React.useEffect(()=>{
        const _getGames = async () => {
            const fields = {
                games: content,
                token: token
            }
            await axios.post('https://ochem.ru/api/games', fields).then((data)=>{
                setGames(data.data);
            }).catch((err)=>{
                console.warn(err); 
            });
        }
        if(content){
            _getGames();
        }
    },[token, content ]);

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
                            {page === 'my' && <Icon28Delete onClick={()=>deleteGame(game)}/>}
                            {page === 'in' && <Icon28Delete onClick={()=>removeGame(game)}/>}
                            {page === 'out' && <Icon28Delete onClick={()=>removeGame(game)}/>}
                        </>
                        }
                        before={
                            <>
                                {page === 'my' &&
                                    <Icon28PlayCircleFillAzure  onClick={()=>selectGame(game)}/>}
                                {page === 'in' &&
                                    <Icon28Done onClick={()=>acceptGame(game)}/>}
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
    token:PropTypes.string,
    content:PropTypes.array,
    page:PropTypes.string,
    onSuccess:PropTypes.func,
    getPlayer: PropTypes.func,
    setGame: PropTypes.func,
    socket: PropTypes.object,
    player: PropTypes.object,
    onUpdate: PropTypes.func,
};