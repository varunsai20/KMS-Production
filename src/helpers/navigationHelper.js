import { useNavigate } from "react-router-dom";

let navigate;

export const setNavigate = (nav) => {
  navigate = nav;
};

export const redirectToLogin = () => {
  if (navigate) {
    navigate("/login");
  }
};
