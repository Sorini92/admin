import React from "react";

const Panel = ({virtualDom}) => {
    return (
        <div className='panel'>
            <button className='uk-button uk-button-primary uk-margin-small-right' uk-toggle="target: #modal-open">Открыть</button>
            <button className='uk-button uk-button-primary uk-margin-small-right' uk-toggle="target: #modal-save">Опубликовать</button>
            {virtualDom ? <button className='uk-button uk-button-primary uk-margin-small-right' uk-toggle="target: #modal-meta">Редактировать META</button> : false}
            <button className='uk-button uk-button-default uk-margin-small-right' uk-toggle="target: #modal-backup">Восстановить</button>
            <button className='uk-button uk-button-danger' uk-toggle="target: #modal-logout">Выход</button>
        </div>
    )
}

export default Panel;