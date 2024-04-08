import { Panel, PanelHeader, Button, Group, Avatar, RichCell, ButtonGroup, CellButton } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Icon28AddCircleFillBlue, Icon28GameCircleFillBlue, Icon16CrownCircleFillVkDating, Icon24InfoCircleOutline, Icon12Coins,
  Icon12Add, Icon12Clock, Icon24CrownCircleFillVkDating, Icon28GiftCircleFillRed } from '@vkontakte/icons'
import Snack from '../componets/Snack';
import ModalCards from '../componets/ModalCard';
import Compliments from '../componets/Compliments';
import InfoModal from '../componets/InfoModal';
import SubscribeModal from './Subscribe';
import Coins from './Coins'
import TasksModal from '../componets/TasksModal';

//Сервисный ключ доступа c7e29d85c7e29d85c7e29d8581c4f5f9a3cc7e2c7e29d85a2396e9f88a7c3a00de34a3c
//защищенный ключ U0hwJw6k2EgpXr9LuqyG

export const Home = ({ id, fetchedUser, player, token, getPlayer, setModal, socket, setPlayer }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const [snackbar, setSnackbar] = useState(false);
  const [severity, setSeverity] = useState('info');
  const [message, setMessage] = useState('');
  const [comps, setComps] = useState([]);

  const onCloseSnack = () => {
    setMessage('');
    setSeverity('info');
    setSnackbar(false);
  }

  const onOpenSnackBar = (mes, sev) => {
    setMessage(mes);
    setSeverity(sev);
    setSnackbar(true);
  }

  function parseMillisecondsIntoReadableTime(milliseconds){
    //Get hours from milliseconds
    var hours = milliseconds / (1000*60*60);
    var absoluteHours = Math.floor(hours);
    var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
  
    //Get remainder from hours and convert to minutes
    var minutes = (hours - absoluteHours) * 60;
    var absoluteMinutes = Math.floor(minutes);
    var m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;
  
    return h + ' часов ' + m + ' минут';
  }

  const handleFreeRsvp = async () => {
    if(player.rsvpStatus){
        const data = { token: token }
        console.log(token)
        await axios.patch('https://ochem.ru/api/rsvp-date', data)
        .then((data)=>setPlayer(data.data))
        .catch((err)=>{
            console.warn(err); 
        });
    } else {
        const date = +new Date()
        const timeToTrue = parseMillisecondsIntoReadableTime(player.rsvpDate - date)
        getPlayer()
        onOpenSnackBar(`Ежедневные бесплатные монеты через ${timeToTrue}`, 'info')
    }
  }

  const newGame = () => {
      setModal(<ModalCards 
                  onCloseModals={()=>setModal(null)} 
                  token={token} 
                  getPlayer={getPlayer} 
                  name={first_name} 
                  onOpenSnackBar={onOpenSnackBar}
                  player={player}
                  user={fetchedUser}
                  socket={socket}
                />)
  }

  const openInfo = () => {
    setModal(<InfoModal modalClose={()=>setModal(null)}/>)
  }

  const openTasks = () => {
    setModal(<TasksModal modalClose={()=>setModal(null)} token={token} setPlayer={setPlayer} vkid={player.vkid}/>)
  }

  const getSubscribe = () => {
    setModal(<SubscribeModal modalClose={()=>setModal(null)} getPlayer={getPlayer} onOpenSnackBar={onOpenSnackBar}/>)
  }

  const buyCoins = () => {
    setModal(<Coins modalClose={()=>setModal(null)} getPlayer={getPlayer} token={token} player={player} onOpenSnackBar={onOpenSnackBar}/>)
  }

  useEffect(()=>{
    const getComps = async () => {
      const fields = { id: player._id, token}
      await axios.post(`https://ochem.ru/api/compliments`, fields).then((data)=>{
          setComps(data.data)
      }).catch((err)=>{
          console.warn(err);
      });
  };
    if(player === null){
      getPlayer()
    } else {
      const searchParams = { userId: player._id };
      socket.emit('joinUser', searchParams);
      getComps()
    }
  },[player, getPlayer, socket, token])

  return (
      <Panel id={id}>
          <PanelHeader>Главная</PanelHeader>
          {fetchedUser && (
              <Group>
                  <RichCell
                      before={photo_200 && <Avatar src={photo_200} />}
                      text={city?.title}
                      after={<RichCell.Icon aria-hidden>
                        <Icon24InfoCircleOutline onClick={openInfo}/>
                      </RichCell.Icon>}
                      actions={
                          <ButtonGroup mode='vertical' gap="m" stretched>
                              <Button mode="secondary" size="s" after={<Icon12Coins/>} before={<Icon12Clock/>} stretched 
                              onClick={handleFreeRsvp}>
                              Ежедневно бесплатно +{player?.dailyRsvp}
                              </Button>
                              <Button mode="primary" size="s" after={<Icon12Coins/>} before={<Icon12Add/>} stretched
                              onClick={buyCoins}>
                              Всего монет для игр: {player?.rsvp}
                              </Button>
                          </ButtonGroup>
                      }
                      multiline
                  >
                      {`${first_name} ${last_name}`}{" "}
                      {player?.status === 'sponsor' && <Icon16CrownCircleFillVkDating style={{
                        display: 'inline-block',
                        verticalAlign: 'text-top',
                      }}/>}
                  </RichCell>
              </Group>
          )}
          {comps.length !== 0 && <Compliments comps={comps.reverse()}/>}
          <Group>
            <CellButton onClick={newGame} centered before={<Icon28AddCircleFillBlue />}>
            Новая игра
            </CellButton>
            <CellButton onClick={()=>routeNavigator.go('/games')} centered before={<Icon28GameCircleFillBlue />}>
            Мои игры
            </CellButton>
            {player?.status === 'none' && <CellButton onClick={openTasks} centered before={<Icon28GiftCircleFillRed />}>
            Задания
            </CellButton>}
            {player?.status !== 'sponsor' && <CellButton onClick={getSubscribe} centered before={<Icon24CrownCircleFillVkDating />}>
            Premium
            </CellButton>}
          </Group>
          {snackbar && <Snack severity={severity} message={message} onExit={onCloseSnack}/>}
      </Panel>
  );
};

Home.propTypes = {
  id: PropTypes.string.isRequired,
  getPlayer: PropTypes.func,
  setModal: PropTypes.func,
  setPlayer: PropTypes.func,
  token:PropTypes.string,
  fetchedUser: PropTypes.object,
  player: PropTypes.object,
  socket: PropTypes.object,
};
