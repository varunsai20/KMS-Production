import { toast } from "react-toastify";

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
