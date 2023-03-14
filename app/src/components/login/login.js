import React from "react";
import { useState } from "react";

const Login = ({login}) => {

    const [password, setPassword] = useState("");

    const onPasswordChange = (e) => {
        setPassword(e.target.value);
    }

    return (
        <div className="login-container">
            <div className="login">
                <h2 className="uk-modal-title uk-text-center">Авторизация</h2>
                <div className="uk-margin-top uk-text-lead">Пароль:</div>
                <input 
                    type="password" 
                    name="" id="" 
                    className="uk-input uk-margin-top" 
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => onPasswordChange(e)}></input>                  
                <button 
                    className="uk-button uk-button-primary uk-margin-top" 
                    type="button"
                    onClick={() => login(password)}>Вход</button>
            </div>
        </div>
    )
}

export default Login;