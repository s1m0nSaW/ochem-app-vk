import { Avatar, Card, CardGrid, Cell, Div, Group, Title, } from "@vkontakte/vkui";
import PropTypes from "prop-types";

export const WhoIsFirst = ({ user, friend, game, setTurn }) => {
    return (
        <Group>
            <CardGrid size="l">
            {user._id === game.user1 ?
                <Card>
                <Div>
                    <Title  level="1">
                    Выбор игрока
                    </Title>
                    <Title  level="3">
                    Определите кто будет отвечать первый
                    </Title>
                </Div>
                <Div>
                    <Group>
                        {user&&
                            <Cell before={<Avatar src={user.avaUrl} />} onClick={()=>setTurn(user._id)}>
                                {user.firstName}
                            </Cell>}
                        {friend&&
                            <Cell before={<Avatar src={friend.avaUrl} />} onClick={()=>setTurn(friend._id)}>
                                {friend.firstName}
                            </Cell>}
                    </Group>
                </Div>
                </Card>:
                <Card>
                    <Title  level="1">
                    Выбор игрока
                    </Title>
                    <Title  level="1">
                    Пригласившему игроку нужно сделать выбор кто будет отвечать первый
                    </Title>
                </Card>}
            </CardGrid>
        </Group>
    );
};

WhoIsFirst.propTypes = {
    user: PropTypes.object,
    friend: PropTypes.object,
    game: PropTypes.object,
    setTurn: PropTypes.func,
};
