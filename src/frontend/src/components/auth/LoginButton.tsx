import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import './Button.css'; 

const LoginButton: React.FC = () => {
    const { login } = useContext(AuthContext);

    return (
        <button className="button" onClick={login}>Log in</button>
    );
};

export default LoginButton;
