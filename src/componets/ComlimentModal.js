import { Group, HorizontalCell, HorizontalScroll, Image, ModalCard, ModalRoot } from "@vkontakte/vkui";
import bridge from "@vkontakte/vk-bridge";
import axios from "axios";
import PropTypes from "prop-types";

const COMPLIMENTS = 'compliments';

import CompImage0 from "../img/comp0.png";
import CompImage1 from "../img/comp1.png";
import CompImage2 from "../img/comp2.png";
import CompImage3 from "../img/comp3.png";
import CompImage4 from "../img/comp4.png";
import CompImage5 from "../img/comp5.png";
import CompImage6 from "../img/comp6.png";
import CompImage7 from "../img/comp7.png";
import CompImage8 from "../img/comp8.png";
import CompImage9 from "../img/comp9.png";
import CompImage10 from "../img/comp10.png";
import CompImage11 from "../img/comp11.png";
import CompImage12 from "../img/comp12.png";

const compliments = [
    {
        id: 1,
        title: "Бесплатно",
        item: "comp_item_1",
        photo_300: CompImage1,
        name: "Бесплатный 1",
        price: 0,
    },
    {
        id: 2,
        title: "Бесплатно",
        item: "comp_item_2",
        photo_300: CompImage2,
        name: "Бесплатный 2",
        price: 0,
    },
    {
        id: 3,
        title: "Бесплатно",
        item: "comp_item_3",
        photo_300: CompImage3,
        name: "Бесплатный 3",
        price: 0,
    },
    {
        id: 4,
        title: "5 голосов",
        item: "comp_item_4",
        photo_300: CompImage4,
        name: "5 голосов 1",
        price: 5,
    },
    {
        id: 5,
        title: "5 голосов",
        item: "comp_item_4",
        photo_300: CompImage5,
        name: "5 голосов 2",
        price: 5,
    },
    {
        id: 6,
        title: "5 голосов",
        item: "comp_item_4",
        photo_300: CompImage6,
        name: "5 голосов 3",
        price: 5,
    },
    {
        id: 7,
        title: "5 голосов",
        item: "comp_item_4",
        photo_300: CompImage7,
        name: "5 голосов 4",
        price: 5,
    },
    {
        id: 8,
        title: "5 голосов",
        item: "comp_item_4",
        photo_300: CompImage8,
        name: "5 голосов 5",
        price: 5,
    },
    {
        id: 9,
        title: "5 голосов",
        item: "comp_item_4",
        name: "5 голосов 6",
        photo_300: CompImage9,
        price: 5,
    },
    {
        id: 10,
        title: "10 голосов",
        item: "comp_item_5",
        photo_300: CompImage10,
        name: "10 голосов 1",
        price: 10,
    },
    {
        id: 11,
        title: "10 голосов",
        item: "comp_item_5",
        photo_300: CompImage11,
        name: "10 голосов 2",
        price: 10,
    },
    {
        id: 12,
        title: "10 голосов",
        item: "comp_item_5",
        photo_300: CompImage12,
        name: "10 голосов 3",
        price: 10,
    },
    {
        id: 13,
        title: "50 голосов",
        item: "comp_item_10",
        photo_300: CompImage0,
        name: "50 голосов 1",
        price: 50,
    },
];

const ComlimentModal = ({ player, friend, socket, token, modalClose }) => {

    const createCompliment = async ( compliment ) => {
        const foundItem = compliments.find(comp => comp.name === compliment);
        const data = {
            from: player._id,
            to: friend._id,  // не забудь заменить нв friend._id
            price: foundItem.id,
            image: foundItem.photo_300,
            name: `От пользователя ${player.firstName}`,
            token
        }
    
        await axios.post(`https://ochem.ru/api/compliment`, data).then((data)=>{
            if(data) {
                const fields = {
                    userId: friend._id,
                    message: `${player.firstName} подарил вам комплимент`, 
                    severity: 'info'
                }
                socket.emit("socketNotification", fields);
                const _fields = {
                    userId: player._id,
                    message: `Комплимент успешно подарен`, 
                    severity: 'success'
                }
                socket.emit("socketNotification", _fields);
            }
        }).catch((err)=>{
            console.warn(err);
            const _fields = {
                userId: player._id,
                message: `Ошибка при создании комплимента`, 
                severity: 'error'
            }
            socket.emit("socketNotification", _fields);
        });
        modalClose()
    }

    const giveCopliment = ( item, title, name ) => {
        if( title === "Бесплатно" ){
            createCompliment(name)
        } else {
            bridge
                .send("VKWebAppShowOrderBox", {
                    type: "item", // Всегда должно быть 'item'
                    item: item, // Идентификатор товара
                })
                .then((data) => {
                    console.log("Покупка состоялась.", data);
                    createCompliment(name)
                })
                .catch((e) => {
                    console.log("Ошибка!", e);
                    const _fields = {
                        userId: player._id,
                        message: `Ошибка при покупке комплимента`, 
                        severity: 'error'
                    }
                    socket.emit("socketNotification", _fields);
                    modalClose()
                });
        }
    }

    return (
        <ModalRoot activeModal={COMPLIMENTS} onClose={modalClose}>
            <ModalCard
                id={COMPLIMENTS}
                onClose={modalClose}
                header="Подарите комплимент"
            >
                <Group>
                    <HorizontalScroll>
                        <div style={{ display: "flex" }}>
                            {compliments.map(
                                (compliment) => (
                                    <HorizontalCell
                                        onClick={() => giveCopliment(compliment.item, compliment.title, compliment.name)}
                                        key={compliment.id}
                                        size="l"
                                        header={compliment.title}
                                    >
                                        <Image size={128} src={compliment.photo_300} />
                                    </HorizontalCell>
                                )
                            )}
                        </div>
                    </HorizontalScroll>
                </Group>
            </ModalCard>
        </ModalRoot>
    );
};

export default ComlimentModal;

ComlimentModal.propTypes = {
    player: PropTypes.object,
    friend: PropTypes.object,
    socket: PropTypes.object,
    token: PropTypes.string,
    modalClose: PropTypes.func,
};
