import React from "react";
import { Button, Panel, PanelHeader, PanelHeaderBack, Placeholder } from "@vkontakte/vkui";
import PropTypes from "prop-types";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";

import photo1 from "../img/photo1.png";
import photo2 from "../img/photo2.png";
import photo3 from "../img/photo3.png";
import photo4 from "../img/photo4.png";

export const Intro = ({ id, fetchedUser, socket, onResetSnack }) => {
    const routeNavigator = useRouteNavigator();
    const [step, setStep] = React.useState(1);
    const [player, setPlayer] = React.useState(null);

    const nextStep = () => {
        setStep(step + 1)
    }

    const alreadyRegistered = () => {
        const fields = {vkid: fetchedUser.id,}
        socket.emit('already', fields);
        routeNavigator.go("/home");
    }

    const registration = async () => {
        if(player.firstName !== '$2b$10$T72I44FcHBIcS81xrkFY3e2TJwaaTVLFp7d5wuddKeVEuc2.3WR0G'){
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
                    socket.emit('register', fields);
                    routeNavigator.go("/home");
                    
                } catch (err) {
                    console.log(err);
                }
            }
        }
    };

    const timeout = setTimeout(()=>{
        if(player === null && fetchedUser){
            const fields = { vkid: fetchedUser.id };
            socket.emit('getUser', fields);
            routeNavigator.go('/')
        }
    },2000)

    React.useEffect(()=>{
        socket.on("updatedUser", ({ data }) => {
            setPlayer(data.user)
            clearTimeout(timeout)
            onResetSnack('close')
        });
    },[socket, onResetSnack, timeout])

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
                Это игра для двоих, один отвечает на вопрос, другой должен угадать этот ответ, затем роли меняются.<br/>
                Чтобы поиграть вместе, вам сначала нужно добавить друг друга в друзья во «ВКонтакте».
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
    fetchedUser: PropTypes.object,
    socket: PropTypes.object,
    onResetSnack: PropTypes.func,
};