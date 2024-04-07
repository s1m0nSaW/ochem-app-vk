import { Panel, Placeholder, Spinner } from "@vkontakte/vkui";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { useEffect } from "react";
import PropTypes from 'prop-types';

export const Preload = ({ id, loading, getPlayer, player }) => {
    const routeNavigator = useRouteNavigator();
    //routeNavigator.push('persik')

    useEffect(() => {
        getPlayer();
        if (loading === false) {
            if (player === null) {
                routeNavigator.go("/intro");
            } else {
                if(player.status === 'firstTime'){
                    routeNavigator.go("/intro");
                } else {
                    routeNavigator.go("/home");
                }
            }
        }
    }, [getPlayer, player, loading, routeNavigator]);

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
    loading: PropTypes.bool.isRequired,
    getPlayer: PropTypes.func.isRequired,
    player: PropTypes.object,
};