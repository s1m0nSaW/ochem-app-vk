import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import axios from 'axios';
import { io } from 'socket.io-client';

import { Persik, Home, Intro, Preload, Games, Test, Game } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';
import Snack from './componets/Snack.js';

const socket = io("https://ochem.ru", {
  withCredentials: true,
  transports: ["polling", "xhr-polling"],
});

socket.on("connect_error", (err) => {
  // the reason of the error, for example "xhr poll error"
  console.log(err);
});

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.PRELOAD } = useActiveVkuiLocation();
  const [fetchedUser, setUser] = useState(null);
  const [player, setPlayer] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [tokenDate, setTokenDate] = useState();
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [modal, setModal] = useState(null);
  const [game, setGame] = useState(null);

  const changeModal = (_modal) => {
    setModal(_modal);
  }
  const changeGame = (_game) => {
    setGame(_game);
  }

  const changeToken = (t, d) => {
    setToken(t)
    setTokenDate(d)
  }

  const getToken = () => {
    bridge.send('VKWebAppStorageGet', {
      keys: [
        'token',
        'tokenDate',
      ]})
      .then((data) => { 
        if (data.keys) {
          // Значения получены
          const _token = data.keys.find(key => key.key === 'token').value;
          const _tokenDate = data.keys.find(key => key.key === 'tokenDate').value;
          setToken(_token);
          setTokenDate(parseFloat(_tokenDate))
        }
      })
      .catch((error) => {
        // Ошибка
        console.log(error);
      });
  }

  const getPlayer = async () => {
    if(popout === null){
      setPopout(<ScreenSpinner size="large" />)
    }
    if(!token){
      getToken()
    }
    const date = +new Date();
    try {
      if(fetchedUser !== null){
        if(tokenDate <= date){
          const params = { vkid: fetchedUser.id }
          const data = await axios.post('https://ochem.ru/api//get-token', params)
          if(data){ 
            setPlayer(data.data.user)
            bridge.send('VKWebAppStorageSet', {
              key: 'token',
              value: data.data.token
             })
             .then((data) => { 
               if (data.result) {
                 // Значение переменной задано
                 console.log(data.result);
               }
             })
             .catch((error) => {
               // Ошибка
               console.log(error);
             });
          bridge.send('VKWebAppStorageSet', {
              key: 'tokenDate',
              value: data.data.tokenDate.toString()
             })
             .then((data) => { 
               if (data.result) {
                 // Значение переменной задано
                 console.log(data.result);
               }
             })
             .catch((error) => {
               // Ошибка
               console.log(error);
             });
            setLoading(false)
            setPopout(null)
          } else {
            setLoading(false)
            setPopout(null)
          }
        } else {
          const params = { vkid: fetchedUser.id }
          const data = await axios.post('https://ochem.ru/api/auth', params)
          if(data){ 
            setPlayer(data.data)
            setLoading(false)
            setPopout(null)
          } else {
            setLoading(false)
            setPopout(null)
          }
        }
      }
    } catch (err) {
        console.log(err)
        setLoading(false)
        setPopout(null)
    }
    checkPromoter();
  }

  const updatePlayer = (data) => {
    setPlayer(data)
  }

  const onCloseSnack = () => {
    setPopout(null);
  }

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
                if(data.vk_is_recommended === 1) tasks +=1
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
                if(tasks < 4) {
                  const data = { token: token, vkid: fetchedUser.id, status: 'none', dailyRsvp: 1 }
                  await axios.patch('https://ochem.ru/api/rsvp-date', data)
                  .then((data)=>setPlayer(data.data))
                  .catch((err)=>{
                      console.warn(err); 
                  });
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

  useEffect(() => {
    const handleSuccessOpen = (message, severity) => {
      setPopout(<Snack severity={severity} message={message} onExit={onCloseSnack}/>);
    };

    socket.on("notification", ({ data }) => {
      handleSuccessOpen(data.message, data.severity);
    });
  },[]);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUser(user);
    }
    fetchData();
  }, []);

  return (
    <SplitLayout popout={popout} modal={modal}>
      <SplitCol>
        <View activePanel={activePanel}>
          <Preload id="preload" fetchedUser={fetchedUser} loading={loading} getPlayer={getPlayer} player={player}/>
          <Intro id="intro" fetchedUser={fetchedUser} player={player} changeToken={changeToken} changePlayer={updatePlayer}/>
          <Home id="home" fetchedUser={fetchedUser} player={player} token={token} getPlayer={getPlayer} setModal={changeModal} socket={socket} setPlayer={updatePlayer}/>
          <Persik id="persik" />
          <Games id="games" token={token} player={player} setModal={changeModal} setGame={changeGame} getPlayer={getPlayer} socket={socket}/>
          <Game id="game" game={game} user={player} token={token} setGame={changeGame} socket={socket} setModal={changeModal}/>
          <Test id="test" />
        </View>
      </SplitCol>
    </SplitLayout>
  );
};
