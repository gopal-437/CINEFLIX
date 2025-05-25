import React from "react";
import styles from "../styles/landing.module.css";  // Import CSS as an object
import { useNavigate } from "react-router-dom";


function LandingPage() {
    const navigate = useNavigate();

    function loginClickHandler() {
        navigate("/login");
    }

    function signUpClickHandler() {
        navigate("/signup");
    }

    return (
        <>
            <header className={styles.header}>
                <div className={styles.logo}>CINEFLIX</div>
                <nav>
                    <button className={`${styles.btn} ${styles.login}`} onClick={loginClickHandler}>Login</button>
                    <button className={`${styles.btn} ${styles.signup}`} onClick={signUpClickHandler}>Sign Up</button>
                </nav>
            </header>

            <section className={styles.hero}>
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <h1 className={styles.quote}>
                        “Cinema is a mirror by which we often see ourselves.”
                    </h1>
                    <p>- Alejandro González Iñárritu</p>
                </div>
            </section>
        </>
    );
}

export { LandingPage };
