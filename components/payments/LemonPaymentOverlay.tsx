import React, { useEffect } from 'react'
type Props = {
    url?: string,
    onOverlayClosed: () => void,
    onCheckoutSuccess: () => void,
}
const LemonPaymentOverlay = (props: Props) => {

    useEffect(() => {

        if (props.url) {
            window.LemonSqueezy.Url.Open(props.url);

        }
    }, [props]);

    useEffect(() => {
        window.LemonSqueezy.Setup({

            eventHandler(event) {
                console.log("EVENTTTTTTTTT ----");
                console.log(event);
                console.log("EVENTTTTTTTTT ----");
                if (event == "close") {
                    props.onOverlayClosed();
                }
                //@ts-ignore
                if (event.event == "Checkout.Success") {
                    props.onCheckoutSuccess();
                    window.LemonSqueezy.Url.Close();
                }
            },
        })
    }, []);

    return (
        <div></div>
    )
}

export default LemonPaymentOverlay