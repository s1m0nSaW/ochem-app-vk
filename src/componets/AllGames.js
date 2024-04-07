import React from "react";
import axios from "axios";
import { Group, List, ModalPage, ModalPageHeader, ModalRoot, PanelSpinner, SimpleCell } from "@vkontakte/vkui";
import { Icon16CrownCircleFillVkDating,  } from '@vkontakte/icons';
import PropTypes from 'prop-types';

const AllGames = ({ token, setModal }) => {
    const [rates, setRates] = React.useState(null);
    const [themes, setThemes] = React.useState();

    const questionsCount = (t) => {
        const themeObj = themes.filter((obj) => obj.theme === t);
        // Если объект найден, возвращаем значение count, иначе возвращаем null или другое значение по умолчанию
        return themeObj ? themeObj.length : null;
    }

    const onOpenQuestDialog = (_theme) => {
        if(themes){
            const themeObj = themes.filter((obj) => obj.theme === _theme);
            openModal(themeObj.slice(0,5));
        }
    }

    const openModal = (questions) => {
        setModal(
            <ModalRoot onClose={()=>setModal(null)} activeModal={'example'}>
                <ModalPage
                    id="example"
                    onClose={()=>setModal(null)}
                    settlingHeight={100}
                    header={
                    <ModalPageHeader>
                        Примеры вопросов
                    </ModalPageHeader>
                    }
                >
                    <Group>
                        <List>
                            {questions.map((quest) => {
                                return (
                                    <SimpleCell 
                                    key={quest._id}>
                                        {quest.text}
                                    </SimpleCell>
                                );
                                })}
                        </List>
                    </Group>
                </ModalPage>
            </ModalRoot>
        )
    }

    React.useEffect(()=>{
        const getRates = async () => {
            try {
                const data = { token: token }
                const _rates = await axios.post('https://ochem.ru/api/all-rates', data)
                if(_rates) {
                    setRates(_rates.data)
                }
            } catch (err) {
                console.warn(err)
            }
        }
        const getThemes = async () => {
            const data = { token: token }
            await axios.post('https://ochem.ru/api/all-quest', data)
            .then((data) => {
                setThemes(data.data)
            })
            .catch(err => console.warn(err));
        };
        getThemes();
        getRates();

    },[token])

    return (
        <>{rates === null ? <PanelSpinner style={{ height:'50vh'}} >Данные загружаются, пожалуйста, подождите...</PanelSpinner>:
        <List>
            {rates?.map((rate) => (
                <SimpleCell
                    key={rate._id} 
                    subtitle={themes && `Количество вопросов: ${questionsCount(rate.theme)}`}
                    onClick={()=>onOpenQuestDialog(rate.theme)}
                >
                    {rate.theme}&nbsp;{rate.forSponsor && <Icon16CrownCircleFillVkDating style={{
                        display: 'inline-block',
                        verticalAlign: 'text-top',
                    }}/>}
                </SimpleCell>
            ))}
        </List>}
        </>
    );
};

export default AllGames;

AllGames.propTypes = {
    token:PropTypes.string,
    setModal: PropTypes.func,
};