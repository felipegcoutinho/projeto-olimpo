import AccessPoints from "./components/access-point/Ap.jsx";
import Conversores from "./components/conversor/Conversor.jsx";
import Header from "./components/Header.jsx";
import Onu from "./components/onu/Onu.jsx";
import RadiosOutdoor from "./components/radio/Radio.jsx";
import RoteadoresHO from "./components/roteador/Roteador.jsx";
import Sfp from "./components/sfp/Sfp.jsx";
import Switches from "./components/switch/Switch.jsx";
import React from "react";
import { createContext, useState } from "react";
import { HiArrowUp } from "react-icons/hi2";

export const AdminContext = createContext();

function App() {
  const [admin, setAdmin] = useState(localStorage.getItem("admin") === "true" ? true : false);
  const [HideAP, setHideAP] = useState(true);
  const [HideRADIO, setHideRADIO] = useState(true);
  const [HideHO, setHideHO] = useState(true);
  const [HideSwitch, setHideSwitch] = useState(true);
  const [HideConversor, setHideConversor] = useState(true);
  const [HideSFP, setHideSFP] = useState(true);
  const [HideONU, setHideONU] = useState(true);
  const [updatedProduct, setUpdatedProduct] = useState("");
  const [ShowHide, setShowHide] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modalIsOpenAviso, setIsOpenAviso] = useState(false);

  const alternarMostrarOcultar = () => {
    setShowHide(!ShowHide);
    setHideAP(!ShowHide);
    setHideRADIO(!ShowHide);
    setHideHO(!ShowHide);
    setHideSwitch(!ShowHide);
    setHideConversor(!ShowHide);
    setHideSFP(!ShowHide);
    setHideONU(!ShowHide);
  };

  /* Modal */
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setUpdatedProduct(false);
  }

  function openModalAviso() {
    setIsOpenAviso(true);
  }
  function closeModalAviso() {
    setIsOpenAviso(false);
  }

  return (
    <div className="flex flex-col">
      <div className="w-[85%] self-center bg-white dark:bg-itbs-modern-100">
        <AdminContext.Provider
          value={{
            admin,
            setAdmin,
            HideAP,
            setHideAP,
            HideRADIO,
            setHideRADIO,
            HideHO,
            setHideHO,
            HideSwitch,
            setHideSwitch,
            HideConversor,
            setHideConversor,
            HideSFP,
            setHideSFP,
            HideONU,
            setHideONU,
            updatedProduct,
            setUpdatedProduct,
            openModal,
            closeModal,
            modalIsOpen,
            setIsOpen,
            modalIsOpenAviso,
            openModalAviso,
            closeModalAviso,
          }}
        >
          <Header />

          <button
            className={` ${
              ShowHide ? "bg-transparent dark:text-white" : "bg-black dark:bg-itbs-default text-white dark:border-transparent"
            } border border-black dark:border-white px-4 py-1 mt-4 ml-4 font-normal rounded-full text-sm`}
            onClick={alternarMostrarOcultar}
          >
            {ShowHide ? "Ocultar Tudo" : "Mostrar Tudo"}
          </button>

          <div className="fixed left-5 bottom-5">
            <a href="#top">
              <button className="bg-itbs-default rounded-full p-4">
                <HiArrowUp className="text-white text-lg" />
              </button>
            </a>
          </div>

          <AccessPoints />
          <RadiosOutdoor />
          <Switches />
          <RoteadoresHO />
          <Conversores />
          <Sfp />
          <Onu />
        </AdminContext.Provider>
      </div>
    </div>
  );
}

export default App;
