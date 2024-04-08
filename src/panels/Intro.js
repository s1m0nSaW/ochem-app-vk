import React from "react";
import { Button, Panel, PanelHeader, PanelHeaderBack, Placeholder } from "@vkontakte/vkui";
import PropTypes from "prop-types";
import bridge from "@vkontakte/vk-bridge";

import photo1 from "../img/photo1.png";
import photo2 from "../img/photo2.png";
import photo3 from "../img/photo3.png";
import photo4 from "../img/photo4.png";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import axios from "axios";

export const Intro = ({ id, fetchedUser, player, changeToken, changePlayer }) => {
    const routeNavigator = useRouteNavigator();
    const [step, setStep] = React.useState(1);

    const nextStep = () => {
        setStep(step + 1)
    }
    const alreadyRegistered = async () => {
        if (fetchedUser) {
            try {
                const fields = {
                    vkid: fetchedUser.id,
                }
                const data = await axios.post('https://ochem.ru/api/get-token', fields);
        
                if (data.data.token) {
                    changeToken(data.data.token, data.data.tokenDate.toString())
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
                    changePlayer(data.data.user)
                    routeNavigator.go('/home')
                } 
            } catch (err) {
                console.log(err);
                routeNavigator.go('/')
            }
        }
    }

    const registration = async () => {
        if(player){
            alreadyRegistered()
        } else {
            if (fetchedUser) {
                try {
                    const fields = {
                        status: 'none',
                        vkid: fetchedUser.id,
                        firstName: fetchedUser.first_name,
                        avaUrl: fetchedUser.photo_200,
                    }
                    const data = await axios.post('https://ochem.ru/api/auth/register', fields);
            
                    if (data.data.token) {
                        changeToken(data.data.token, data.data.tokenDate.toString())
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
                        changePlayer(data.data.user)
                        routeNavigator.go('/home')
                    } 
                } catch (err) {
                    console.log(err);
                    routeNavigator.go('/')
                }
            }
        }
    };

    React.useEffect(()=>{
        if(player !== null) {
            if(player.status !== 'firstTime'){
                routeNavigator.go('/')
            }
        }
    },[player,routeNavigator])

    return (
        <Panel id={id}>
            {step !== 1 && <PanelHeader before={<PanelHeaderBack onClick={()=>setStep(step - 1)} />}/>}
            {step === 1 && <Placeholder
                header="Больше никаких неловких моментов"
                    icon={<img height={300} className="header__logo" src={photo1} alt="logo"/>}
                action={
                    <Button size="m" onClick={nextStep}>
                        ИНТЕРЕСНО
                    </Button>
                }
                stretched
                >
                Приложение, которое упрощает процесс знакомства с помощью игры.
            </Placeholder>}
            {step === 2 && <Placeholder
                header="Лучше узнать друг друга"
                    icon={<img height={300} className="header__logo" src={photo2} alt="logo"/>}
                action={
                    <Button size="m" onClick={nextStep}>
                    ОТЛИЧНО
                    </Button>
                }
                stretched
                >
                Это игра для двоих, один отвечает на вопрос, другой должен угадать этот ответ, затем роли меняются.
            </Placeholder>}
            {step === 3 && <Placeholder
                header="Проверь свою интуицию"
                    icon={<img height={300} className="header__logo" src={photo3} alt="logo"/>}
                action={
                    <Button size="m" onClick={nextStep}>
                    ПОПРОБОВАТЬ
                    </Button>
                }
                stretched
                >
                Сможешь ли ты угадать ответ собеседника, смотря на его фотографию?
            </Placeholder>}
            {step === 4 && <Placeholder
                header="Веселитесь вместе и узнавайте друг друга"
                    icon={<img height={300} className="header__logo" src={photo4} alt="logo"/>}
                action={
                    <Button size="m" onClick={()=>registration()}>
                    НАЧАТЬ ИГРАТЬ
                    </Button>
                }
                stretched
                >
                Это отличный способ узнать о своем собеседнике больше, найти общие интересы и преодолеть начальные стеснения.
            </Placeholder>}
        </Panel>
    );
};

Intro.propTypes = {
    id: PropTypes.string.isRequired,
    changeToken: PropTypes.func,
    changePlayer: PropTypes.func,
    player: PropTypes.object,
    fetchedUser: PropTypes.shape({
        id: PropTypes.number,
        photo_200: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        city: PropTypes.shape({
          title: PropTypes.string,
        }),
      }),
};