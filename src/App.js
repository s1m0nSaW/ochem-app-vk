import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import { io } from 'socket.io-client';

import { Home, Intro, Preload, Games, Test, Game } from './panels';
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
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [modal, setModal] = useState(null);
  const [availableAds, setAvailableAds] = useState(false);
  const [count, setCount] = useState(0)

  const changeModal = (_modal) => {
    setModal(_modal);
  }

  const onResetSnack = (reset) => {
    if(reset === 'close'){
      setPopout(null);
    } else (
      setPopout(<ScreenSpinner size="large" />)
    )
    
  }

  const onChangePage = () => {
    setCount(count + 1)
    if(count > 7){
      setCount(0);
      if(availableAds === true){
        setPopout(<ScreenSpinner size="large" />)
        setTimeout(()=>{
          setPopout(null);
          bridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' })
          .then((data) => {
            if (data.result)
              console.log('Реклама показана');
            else
              console.log('Ошибка при показе');
          })
          .catch((error) => { console.log(error); /* Ошибка */ });
        },2000)
      }
    }
  }

  useEffect(() => {
    const handleSuccessOpen = (message, severity) => {
      setPopout(<Snack severity={severity} message={message} onExit={()=>setPopout(null)}/>);
    };

    socket.on("notification", ({ data }) => {
      setTimeout(()=>{
        handleSuccessOpen(data.message, data.severity);
      },1000)
    });
  },[]);

  useEffect(() => {
    async function fetchData() {
      bridge.send('VKWebAppCheckNativeAds', { ad_format: 'interstitial'})
      .then((data) => {
        if (data.result) {
            setAvailableAds(true)
        } else {
            console.log("Рекламные материалы не найдены.");
        }
    })
    .catch((error) => {
        console.log(error); /* Ошибка */
    });
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUser(user);
      if(user){
        const data = { userId: user.id };
        socket.emit('joinUser', data);
        const searchParams = { vkid: user.id };
        socket.emit('getUser', searchParams);
        socket.emit('getGames', searchParams);
        socket.emit('games', searchParams);
      }
    }
    fetchData();
  }, []);

  return (
    <SplitLayout popout={popout} modal={modal}>
      <SplitCol>
        <View activePanel={activePanel}>
          <Preload id="preload" user={fetchedUser} socket={socket}/>
          <Intro id="intro" fetchedUser={fetchedUser} socket={socket} onResetSnack={onResetSnack}/>
          <Home id="home" fetchedUser={fetchedUser} setModal={changeModal} socket={socket} onResetSnack={onResetSnack} onChangePage={onChangePage}/>
          <Games id="games" fetchedUser={fetchedUser} setModal={changeModal} socket={socket} onResetSnack={onResetSnack} onChangePage={onChangePage}/>
          <Game id="game" fetchedUser={fetchedUser} socket={socket} setModal={changeModal}/>
          <Test id="test" />
        </View>
      </SplitCol>
    </SplitLayout>
  );
};
