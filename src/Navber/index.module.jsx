import styles from "./index.module.css";
import icon from "../asset/Screenshot 2024-11-22 111414.png";

const Navbar = () => {
    return (
        <div className={styles.mainIcon}>
            <img className={styles.iconImage} src={icon} alt="action.png"/>
        </div>
    )


}

export default Navbar