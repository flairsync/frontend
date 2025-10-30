import React, { useEffect } from 'react'
type Props = {
    url?: string
}
const LemonPaymentOverlay = (props: Props) => {

    useEffect(() => {
        if (props.url) {
            window.LemonSqueezy.Url.Open(props.url);
        }
    }, [props]);

    return (
        <div>LemonPaymentOverlay</div>
    )
}

export default LemonPaymentOverlay