import { Panel, Placeholder, Spinner } from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';

export const Preload = ({ id, socket, user }) => {
    const routeNavigator = useRouteNavigator();
    const [ ready, setReady ] = useState(false);
    const [player, setPlayer] = useState( null );

    useEffect(()=>{
        socket.on("updatedUser", ({ data }) => {
            setPlayer(data.user)
        });
    },[socket])

    useEffect(() => {
        if(user){
            const searchParams = { userId: user.id };
            socket.emit('joinUser', searchParams);
            setReady(true)
        }
        
        if (player) {
            if (player.firstName === '$2b$10$T72I44FcHBIcS81xrkFY3e2TJwaaTVLFp7d5wuddKeVEuc2.3WR0G') {
                routeNavigator.go("/intro");
            } else {
                if(player.status === 'firstTime'){
                    routeNavigator.go("/intro");
                } else {
                    routeNavigator.go("/home");
                }
            }
        }
    }, [player, routeNavigator, socket, user]);

    useEffect(()=>{
        if(ready === true) {
            const searchParams = { vkid: user.id };
            socket.emit('getUser', searchParams);
            setReady(false)
        }
    },[ socket, user, ready])

    return (
        <Panel id={id}>
            <Placeholder stretched>
                <Spinner
                    size="large"
                />
            </Placeholder>
        </Panel>
    );
};

Preload.propTypes = {
    id: PropTypes.string.isRequired,
    user: PropTypes.object,
    socket: PropTypes.object,
};