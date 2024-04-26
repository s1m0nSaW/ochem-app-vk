import { Div, Group, Header, HorizontalCell, HorizontalScroll, Image, Popover, Text } from "@vkontakte/vkui";
import PropTypes from "prop-types";

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

const Compliments = ({ comps }) => {

    const getImage = (id) => {
        const foundItem = compliments.find(comp => comp.id === id);
        return foundItem.photo_300
    }

    return (
        <Group header={<Header mode="tertiary" indicator={comps.length}>Комплименты</Header>}>
            <HorizontalScroll>
                <div style={{ display: "flex" }}>
                    {comps.map(
                        (compliment) => (
                            <Popover
                                key={compliment._id}
                                trigger="click"
                                placement="bottom"
                                role="tooltip"
                                aria-describedby="tooltip-1"
                                content={
                                    <Div>
                                    <Text>{compliment.name}</Text>
                                    </Div>
                                }
                            >
                                <HorizontalCell
                                    id="tooltip-1"
                                    size="l"
                                >
                                    <Image size={128} src={getImage(compliment.price)} />
                                </HorizontalCell>
                            </Popover>
                            
                        )
                    )}
                </div>
            </HorizontalScroll>
        </Group>
    );
};

export default Compliments;

Compliments.propTypes = {
    comps: PropTypes.array,
}
