import { Snackbar } from "@vkontakte/vkui";
import { Icon28ErrorCircleOutline, Icon28InfoCircleOutline, Icon28CheckCircleOutline  } from '@vkontakte/icons';
import PropTypes from 'prop-types';

const Snack = ({ severity, message, onExit }) => {
    if(severity === 'info'){
        return (
            <Snackbar
                onClose={onExit}
                before={
                    <Icon28InfoCircleOutline fill="var(--vkui--color_background_accent)" />
                }
            >
                {message}
            </Snackbar>
        );
    } else if(severity === 'success'){
        return (
            <Snackbar
                onClose={onExit}
                before={
                    <Icon28CheckCircleOutline  fill="var(--vkui--color_icon_positive)" />
                }
            >
                {message}
            </Snackbar>
        );
    } else if(severity === 'error'){
        return (
            <Snackbar
                onClose={onExit}
                before={
                    <Icon28ErrorCircleOutline fill="var(--vkui--color_icon_negative)" />
                }
            >
                {message}
            </Snackbar>
        );
    }
    
};

export default Snack;

Snack.propTypes = {
    severity: PropTypes.string,
    message: PropTypes.string,
    onExit: PropTypes.func,
};
