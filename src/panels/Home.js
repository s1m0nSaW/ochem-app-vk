import { Panel, PanelHeader, Button, Group, Avatar, RichCell, ButtonGroup, CellButton, PanelSpinner, Badge } from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
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

export const Home = ({ id, fetchedUser, setModal, socket, onResetSnack, onChangePage }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const [player, setPlayer] = useState(null);
  const [snackbar, setSnackbar] = useState(false);
  const [severity, setSeverity] = useState('info');
  const [message, setMessage] = useState('');
  const [comps, setComps] = useState([]);
  const [gamesInCount, setGamesInCount] = useState(0);

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

  const handleFreeRsvp = () => {
    if(player.rsvpStatus){
      onResetSnack('open')
      const fields = { vkid: fetchedUser.id };
      socket.emit('getFreeRsvp', fields);
    } else {
      const date = +new Date()
      const timeToTrue = parseMillisecondsIntoReadableTime(player.rsvpDate - date)
      onOpenSnackBar(`Ежедневные бесплатные монеты через ${timeToTrue}`, 'info')
    }
  }

  const getPlayer = () => {
    const fields = { vkid: fetchedUser.id };
    setTimeout(()=>{
      socket.emit('getUser', fields);
    },2000)
  }

  const myGames = () => {
    if(player.status !== "sponsor"){
      onChangePage()
    }
    const fields = { vkid: fetchedUser.id };
    socket.emit('getGames', fields);
    socket.emit('getUser', fields);
    socket.emit('games', fields);
    routeNavigator.go('/games')
  }

  const getFriends = (token) => {
    bridge.send('VKWebAppCallAPIMethod', {
      method: 'friends.get',
      params: {
        v: '5.199',
        access_token: token,
        fields: 'photo_200,photo_100,nickname,first_name'
      }})
      .then((data) => { 
        if (data.response) {
          // Метод API выполнен
          if(player.status !== "sponsor"){
            onChangePage()
          }
          newGame(data.response.items)
        } 
      })
      .catch((error) => {
        // Ошибка
        console.log(error);
      });
  }

  const getToken = () => {
    onResetSnack('open')
    bridge.send('VKWebAppGetAuthToken', { 
      app_id: 51864614, 
      scope: 'friends'
      })
      .then( (data) => { 
        if (data.access_token) {
          // Ключ доступа пользователя получен
          getFriends(data.access_token)
        } else {
          onOpenSnackBar(`Чтобы приложение могло получить доступ к вашему списку друзей, необходимо предоставить ему соответствующие права доступа.`, 'error')
        }
      })
      .catch( (error) => {
        // Ошибка
        console.log(error);
      });
  }

  const newGame = (friends) => {
    const fields = { vkid: fetchedUser.id };
    socket.emit('getThemes', fields);
    onResetSnack('close')
    setModal(<ModalCards 
                onCloseModals={()=>setModal(null)} 
                name={first_name} 
                onOpenSnackBar={onOpenSnackBar}
                user={fetchedUser}
                player={player}
                socket={socket}
                friends={friends}
              />)
  }

  const openInfo = () => {
    setModal(<InfoModal modalClose={()=>setModal(null)}/>)
  }

  const openTasks = () => {
    setModal(<TasksModal modalClose={()=>setModal(null)} vkid={fetchedUser.id} socket={socket}/>)
  }

  const getSubscribe = () => {
    setModal(<SubscribeModal modalClose={()=>setModal(null)} getPlayer={getPlayer} onOpenSnackBar={onOpenSnackBar}/>)
  }

  const buyCoins = () => {
    setModal(<Coins modalClose={()=>setModal(null)} getPlayer={getPlayer} player={player} onOpenSnackBar={onOpenSnackBar}/>)
  }

  const timeout = setTimeout(()=>{
    if(player === null && fetchedUser){
        const fields = { vkid: fetchedUser.id };
        socket.emit('getUser', fields);
    }
  },2000)

  useEffect(()=>{
    const checkPromoter = async () => {
      let tasks = 0
      if(player !== null) {
        if(player.status === 'promoter'){
          bridge.send('VKWebAppGetLaunchParams')
          .then((data) => { 
              if (data) {
                // Параметры запуска получены
                if(data.vk_are_notifications_enabled === 1) tasks +=1
                if(data.vk_is_favorite === 1) tasks +=1
              }
          })
          .catch((error) => {
              // Ошибка
              console.log(error);
          });
  
          bridge.send('VKWebAppGetGroupInfo', {
              group_id: 225433186
              })
              .then(async (data) => { 
                if (data.is_member === 1) {
                  // Данные о сообществе получены
                  tasks +=1
                  if(tasks < 3) {
                    const data = { vkid: fetchedUser.id }
                    socket.emit('checkPromoter', data);
                  }
                }
              })
              .catch((error) => {
                // Ошибка
                console.log(error);
              });
        }
      }
    }
    checkPromoter();
  },[fetchedUser, player, socket])

  useEffect(()=>{
    socket.on("updatedUser", ({ data }) => {
      if(data.user !== player){
        clearTimeout(timeout)
        setPlayer(data.user)
        onResetSnack('close');
      } 
    });
  },[socket, onResetSnack, player, fetchedUser, timeout])

  useEffect(()=>{
    socket.on("compliments", ({ data }) => {
      if(data.compliments !== comps){
        setComps(data.compliments)
      }
    });
  },[socket, comps])

  useEffect(() => {
    socket.on("incoming", ({ data }) => {
      setGamesInCount(data)
    });
  },[socket]);

  return (
      <Panel id={id}>
          <PanelHeader>Главная</PanelHeader>
          {player ? (<>
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
              
          {comps.length !== 0 && <Compliments comps={comps}/>}
          <Group>
            <CellButton onClick={getToken} before={<Icon28AddCircleFillBlue />}>
            Новая игра с другом
            </CellButton>
            <CellButton onClick={myGames} badgeAfterTitle={gamesInCount !== 0 && <Badge>Есть новые</Badge>} before={<Icon28GameCircleFillBlue />}>
            Мои игры
            </CellButton>
            {player?.status === 'none' && <CellButton onClick={openTasks} before={<Icon28GiftCircleFillRed />}>
            Задания
            </CellButton>}
            {player?.status !== 'sponsor' && <CellButton onClick={getSubscribe} before={<Icon24CrownCircleFillVkDating />}>
            Premium
            </CellButton>}
          </Group>
          </>):<PanelSpinner style={{height:'80vh'}}>Данные загружаются, пожалуйста, подождите...</PanelSpinner>}
          {snackbar && <Snack severity={severity} message={message} onExit={onCloseSnack}/>}
      </Panel>
  );
};

Home.propTypes = {
  id: PropTypes.string.isRequired,
  setModal: PropTypes.func,
  fetchedUser: PropTypes.object,
  socket: PropTypes.object,
  onResetSnack: PropTypes.func,
  onChangePage: PropTypes.func,
};
