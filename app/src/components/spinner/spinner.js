import React from "react";

const Spinner = ({active}) => {
    return (
        <div className={acrive ? 'spinner active' : 'spinner'}>
            <div uk-spinner="ratio: 3"></div>
        </div>
    )
}

export default Spinner;