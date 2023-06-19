export function useKeyListener(props) {
    const { target, event, callbacks } = props;

    function handleEvent(e) {
        Object.keys(callbacks).forEach( key => {
            if (e.key === key)
                callbacks[key](e);

        });
    }

    function connect() {
        target.addEventListener(event, handleEvent);
    }

    function disconnect() {
        target.removeEventListener(event, handleEvent);
    }

    return {
        connect,
        disconnect
    };
}
