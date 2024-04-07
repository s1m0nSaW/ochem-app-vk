import { Div, Group, Header, HorizontalCell, HorizontalScroll, Image, Popover, Text } from "@vkontakte/vkui";
import PropTypes from "prop-types";

const Compliments = ({ comps }) => {

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
                                    <Image size={128} src={compliment.image} />
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
