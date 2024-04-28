import PropTypes from "prop-types";
import { Button, ButtonGroup, Image, ModalCard, ModalRoot, Spacing, Text } from "@vkontakte/vkui";
import bridge from "@vkontakte/vk-bridge";
import { Icon16CrownCircleFillVkDating } from '@vkontakte/icons'
import React from "react";

import crown from '../img/crown.png'

const SubscribeModal = ({ modalClose, getPlayer, onOpenSnackBar }) => {

    const buyRsvp = (item) => {
        bridge.send('VKWebAppShowSubscriptionBox', { 
            action: 'create',
            item: item, // Идентификатор подписки в приложении 'sale_item_subscription_1'
            })
            .then( (data) => {
              console.log('Покупка прошла успешно', data);
              getPlayer()
              onOpenSnackBar(`Покупка состоялась.`, 'success')
              modalClose()
            }) 
            .catch( (e) => {
              console.log('Ошибка!', e);
            })
    };

    return (
        <ModalRoot activeModal={"SubscribeModal"} onClose={modalClose}>
            <ModalCard
            onClose={modalClose}
            id="SubscribeModal"
            icon={<Image borderRadius="l" src={crown} size={72} />}
            header="Premium"
            subheader={<Text>
                - <b>10 монет</b> ежедневно<br/>
                - значок <b>Premium</b> <Icon16CrownCircleFillVkDating style={{
                        display: 'inline-block',
                        verticalAlign: 'text-top',
                      }}/><br/>
                - доступ ко всем играм
            </Text>}
            actions={
                <React.Fragment>
                <Spacing size={16} />
                <ButtonGroup mode='vertical' gap='m' stretched>
                    <Button size="l" mode="primary" stretched onClick={()=>buyRsvp('sale_item_subscription_1')}>
                    1 месяц за 85 голосов
                    </Button>
                    <Button size="l" mode="primary" stretched onClick={()=>buyRsvp('sale_item_subscription_2')}>
                    3 месяца за 143 голоса
                    </Button>
                </ButtonGroup>
                </React.Fragment>
            }
            />
        </ModalRoot>
    );
};

export default SubscribeModal;

SubscribeModal.propTypes = {
    modalClose: PropTypes.func,
    getPlayer: PropTypes.func,
    onOpenSnackBar: PropTypes.func,
};