import { Button, ButtonGroup, Image, ModalCard, ModalRoot, Spacing } from "@vkontakte/vkui";
import bridge from "@vkontakte/vk-bridge";
import React from "react";
import PropTypes from "prop-types";

import coins from "../img/coins.png";

const Coins = ({ getPlayer, player, modalClose, onOpenSnackBar, socket }) => {
    const [availableAds, setAvailableAds] = React.useState(false);

    const buyRsvp = (item) => {
        bridge
            .send("VKWebAppShowOrderBox", {
                type: "item", // Всегда должно быть 'item'
                item: item, // Идентификатор товара
            })
            .then((data) => {
                console.log("Покупка состоялась.", data);
                getPlayer();
                onOpenSnackBar(`Покупка состоялась.`, 'success')
            })
            .catch((e) => {
                console.log("Ошибка!", e);
                onOpenSnackBar(`Ошибка при покупке.`, 'error')
            });
    };

    // Обработчик нажатия кнопки "Посмотрите рекламу"
    const fooButtonClick = async () => {
        // Показать рекламу
        bridge
            .send("VKWebAppShowNativeAds", { ad_format: "reward" })
            .then(async (data) => {
                if (data.result){
                    // Успех
                    const data = { vkid: player.vkid }
                    socket.emit('afterAds', data);
                    onOpenSnackBar(`Реклама показана. Вы получите одну монету.`, 'success');
                // Ошибка
                } else onOpenSnackBar(`Реклама не показана.`, 'error');
            })
            .catch((error) => {
                console.log(error); /* Ошибка */
            });
    }

    React.useEffect(()=>{
        bridge
            .send("VKWebAppCheckNativeAds", { ad_format: "reward" })
            .then((data) => {
                if (data.result) {
                    // Предзагруженная реклама есть.
                    // Теперь можно создать кнопку
                    // "Посмотрите рекламу".
                    setAvailableAds(true)
                } else {
                    console.log("Рекламные материалы не найдены.");
                }
            })
            .catch((error) => {
                console.log(error); /* Ошибка */
            });
    },[])

    return (
        <ModalRoot activeModal={"CoinsModal"} onClose={modalClose}>
            <ModalCard
                id="CoinsModal"
                onClose={modalClose}
                icon={<Image borderRadius="l" src={coins} size={72} />}
                header='Монеты для игры'
                subheader='Покупайте монеты, наслаждайтесь игрой и переходите на новый уровень общения.'
                actions={<React.Fragment>
                    <Spacing size={16} />
                    <ButtonGroup mode='vertical' gap='m' stretched>
                    <Button size="l" mode="primary" stretched onClick={() => buyRsvp("sale_item_1")}>
                    10 монет за 40 голосов
                    </Button>
                    <Button size="l" mode="primary" stretched onClick={() => buyRsvp("sale_item_2")}>
                    25 монет за 64 голоса
                    </Button>
                    <Button size="l" mode="primary" stretched onClick={()=>buyRsvp('sale_item_3')}>
                    50 монет за 93 голоса
                    </Button>
                    {availableAds && player?.adsStatus === true && (
                        <Button size="l" mode="primary" stretched onClick={fooButtonClick}>
                        1 монета за просмотр видео
                        </Button>
                    )}
                </ButtonGroup>
                </React.Fragment>}
            />
        </ModalRoot>
    );
};

export default Coins;

Coins.propTypes = {
    onOpenSnackBar: PropTypes.func,
    getPlayer: PropTypes.func,
    modalClose: PropTypes.func,
    player: PropTypes.object,
    socket: PropTypes.object,
};
