import { toast } from "react-toastify";

let networkToastId = null;


export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-center",
    autoClose: 2000,
    style: {
      maxWidth: "90%", 
      margin: "0 auto", 
      backgroundColor: "rgba(237, 254, 235, 1)",
      borderLeft: "5px solid rgba(15, 145, 4, 1)",
      color: "rgba(15, 145, 4, 1)",
      borderRadius: "8px", 
      fontSize: "14px", 
    },
    progressStyle: {
      backgroundColor: "rgba(15, 145, 4, 1)",
    },
  });
};

export const showNetworkErrorToast = (message) => {
  if (!toast.isActive(networkToastId)) {
    networkToastId = toast.error(message, {
      position: "top-center",
      autoClose: false, 
      style: {
        maxWidth: "90%", 
        margin: "0 auto", 
        backgroundColor: "rgba(254, 235, 235, 1)",
        borderLeft: "5px solid rgba(145, 4, 4, 1)",
        color: "rgba(145, 4, 4, 1)",
        borderRadius: "8px",
        fontSize: "14px", 
      },
    });
  }
};

export const hideNetworkErrorToast = () => {
  if (networkToastId) {
    toast.dismiss(networkToastId);
    networkToastId = null; 
  }
};

export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 2000,
    style: {
      maxWidth: "90%",
      margin: "0 auto", 
      backgroundColor: "rgba(254, 235, 235, 1)",
      borderLeft: "5px solid rgba(145, 4, 4, 1)",
      color: "rgba(145, 4, 4, 1)",
      borderRadius: "8px", 
      fontSize: "14px", 
    },
    progressStyle: {
      backgroundColor: "rgba(145, 4, 4, 1)",
    },
  });
};
