import { toast } from "react-toastify";

let networkToastId = null;

// Utility to show success toast
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-center",
    autoClose: 2000,
    style: {
      backgroundColor: "rgba(237, 254, 235, 1)",
      borderLeft: "5px solid rgba(15, 145, 4, 1)",
      color: "rgba(15, 145, 4, 1)",
    },
    progressStyle: {
      backgroundColor: "rgba(15, 145, 4, 1)",
    },
  });
};

// Utility to show persistent network error toast
export const showNetworkErrorToast = (message) => {
  if (!toast.isActive(networkToastId)) {
    networkToastId = toast.error(message, {
      position: "top-center",
      autoClose: false, // Persistent toast
      style: {
        backgroundColor: "rgba(254, 235, 235, 1)",
        borderLeft: "5px solid rgba(145, 4, 4, 1)",
        color: "rgba(145, 4, 4, 1)",
      },
    });
  }
};

// Utility to hide the persistent network error toast
export const hideNetworkErrorToast = () => {
  if (networkToastId) {
    toast.dismiss(networkToastId);
    networkToastId = null; // Reset the toast ID
  }
};
// Utility to show error toast
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 2000,
    style: {
      backgroundColor: "rgba(254, 235, 235, 1)",
      borderLeft: "5px solid rgba(145, 4, 4, 1)",
      color: "rgba(145, 4, 4, 1)",
    },
    progressStyle: {
      backgroundColor: "rgba(145, 4, 4, 1)",
    },
  });
};
