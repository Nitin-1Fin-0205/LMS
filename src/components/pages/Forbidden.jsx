import { ROUTES } from "../../constants/routes";

const Forbidden = () => {

    const addToken = () => {
        localStorage.setItem("authToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
        window.location.href = ROUTES.ADD_CUSTOMER;


    }

    return (
        <div className="forbidden-page">
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            {/* TODO : Add a link to the login page or home page */}
            <a href="/#">Go to Login https://newuat.supporthub.onefin.app/landing/customers/add-customer</a>

            <button onClick={addToken}> temporary button</button>
        </div>
    );
};

export default Forbidden;