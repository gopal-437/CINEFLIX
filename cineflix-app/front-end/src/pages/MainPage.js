
import { Outlet } from "react-router-dom";
import Header from "./Header";

function MainPage () 
{
    return(
        <>
        <Header></Header>
        <Outlet></Outlet>
        </>
    );
}

export default MainPage;