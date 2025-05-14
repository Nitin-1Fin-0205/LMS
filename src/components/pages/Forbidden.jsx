import { ROUTES } from "../../constants/routes";

const Forbidden = () => {
    return (
        <div className="forbidden-page">
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
        </div>
    );
};

export default Forbidden;