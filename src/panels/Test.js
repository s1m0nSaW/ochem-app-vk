import { Button, Group, IconButton, List, Panel, PanelHeader, PanelHeaderBack, SimpleCell, Text } from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import PropTypes from "prop-types";
import React from "react";
import axios from "axios";
import { Icon16CrownCircleFillVkDating, Icon28Done } from '@vkontakte/icons';

export const Test = ({ id }) => {
    const routeNavigator = useRouteNavigator();
    const [token, setToken] = React.useState(null);
    const [user, setUser] = React.useState(null)
    const [disabled, setDisabled] = React.useState(false);
    const [games, setGames] = React.useState(null);

    const getToken = async () => {
        setDisabled(true)
        const fields = {
            vkid: 4448662,
        }
        await axios.post('https://ochem.ru/api/get-token', fields)
        .then((data)=>{
            setToken(data.data.token)
            setUser(data.data.user)
            setDisabled(false)
        })
        .catch((err)=>{
            console.log(err)
            setDisabled(false)
        });
    }

    const getGames = async () => {
        const fields = {
            games: user.gamesIn,
            token: token
        }
        await axios.post('https://ochem.ru/api/games', fields).then((data)=>{
            setGames(data.data);
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
                console.log('Игра принята', 'success')
            }
        }).catch((err)=>{
            console.warn(err); 
        });
    }

    return (
        <Panel id={id}>
            <PanelHeader
                before={
                    <PanelHeaderBack onClick={() => routeNavigator.back()} />
                }
            >
                Test
            </PanelHeader>
            <Group>
                <Button disabled={disabled} onClick={() => getToken()}>{disabled ? 'Waiting...':"Get Token"}</Button>
                {token && <Text>{token}</Text>}
            </Group>
            <Group>
                <Button onClick={() => getGames()}>Get Games</Button>
                <List>
                {games?.map((game) => (
                    <SimpleCell
                        key={game._id} 
                        subtitle={`Количество вопросов: ${game.theme}`}
                        onClick={()=>console.log(game.theme)}
                        before={
                            <IconButton onClick={()=>acceptGame(game)}>
                                <Icon28Done />
                            </IconButton>
                        }
                    >
                        {game.theme}&nbsp;{game.forSponsor && <Icon16CrownCircleFillVkDating style={{
                            display: 'inline-block',
                            verticalAlign: 'text-top',
                        }}/>}
                    </SimpleCell>
                ))}
                </List>
            </Group>
        </Panel>
    );
};

Test.propTypes = {
    id: PropTypes.string.isRequired,
};
