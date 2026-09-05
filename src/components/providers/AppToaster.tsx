"use client";

import { ToastContainer } from "react-toastify";

export function AppToaster() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
    />
  );
}
