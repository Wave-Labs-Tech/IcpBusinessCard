import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import './styles.css'; 

const LogoutButton: React.FC = () => {
    const { logout } = useContext(AuthContext);

    return (
        <button className="button" onClick={logout}>Log out</button>
    );
};

export default LogoutButton;
