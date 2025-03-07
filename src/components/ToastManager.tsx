import { Toaster } from "react-hot-toast";

const ToastManager = () => {
    return <Toaster position="top-right" toastOptions={{ duration: 2000 }} />;
};

export default ToastManager;
