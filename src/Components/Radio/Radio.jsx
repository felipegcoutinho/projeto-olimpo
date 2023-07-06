import React from "react";
import {useEffect, useState, useContext, createContext} from "react";
import {Radio_Thead} from "/src/TableHeads";
import RadioModal from "./RadioModal";
import {AdminContext} from "../../App";
import Modal from "react-modal";
import Content from "../../ui/Content";
import CrudFirebase from "../../Database/crud";
import OlimpoTable from "../../ui/Table";
import UseAux from "../../Hooks/UseAux";
import RadioModalCompare from "./RadioCompare";
import {Badge} from "flowbite-react";
import {HiPencil, HiXMark} from "react-icons/hi2";
import DeviceImg from "../../assets/radio.png";
import TableStart from "../../ui/TableStart";

export const RadioContext = createContext();

export default function Radios() {
  const {admin, HideRADIO, setHideRADIO, updatedProduct, setUpdatedProduct} = useContext(AdminContext);
  const [RadiosOutdoor, setRadiosOutdoor] = useState([]);
  const [queryRADIO, setQueryRADIO] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const {fetchDevices, addDevices, deleteDevices, updateDevices} = CrudFirebase();
  const {compareStatus, ModulacaoStyle, calculateDateDifference, currentDate} = UseAux();

  /* Configs Modal */
  Modal.setAppElement("#root");
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setUpdatedProduct(false);
  }

  const handleHideRADIO = () => setHideRADIO(!HideRADIO);
  const handleSearchChangeRADIO = (e) => {
    setQueryRADIO(e.target.value);
  };

  //Busca os produtos no firebase
  useEffect(() => {
    fetchDevices("radios", setRadiosOutdoor);
  }, []);

  //Deleta os produtos no firebase
  const deleteDevice = (id) => {
    deleteDevices(id, "radios", fetchDevices);
  };

  //Adiciona os produtos no firebase
  const addDevice = async () => {
    await addDevices("radios", closeModal, fetchDevices, setUpdatedProduct, updatedProduct);
  };

  /* Abrir modal de atualização */
  const openUpdateModal = (updatedProduct) => {
    setUpdatedProduct(updatedProduct);
    setIsOpen(true);
  };

  /* Atualizar Produto */
  const updateDevice = async () => {
    await updateDevices("radios", setUpdatedProduct, updatedProduct, fetchDevices, closeModal);
  };

  // Esse trecho vai gerenciar os produtos selecionados
  const [modalIsOpenCompare, setIsOpenCompare] = useState(false);

  function openModalCompare() {
    setIsOpenCompare(true);
  }

  function closeModalCompare() {
    setIsOpenCompare(false);
    setSelectedDevices([]);
  }

  const [selectedDevices, setSelectedDevices] = useState([]);
  const [comparisonDevices, setComparisonDevices] = useState([]);

  const handleProductSelect = (productId) => {
    if (selectedDevices.includes(productId)) {
      setSelectedDevices(selectedDevices.filter((id) => id !== productId));
    } else {
      setSelectedDevices([...selectedDevices, productId]);
    }
  };

  const handleCompareClick = () => {
    const productsToCompare = RadiosOutdoor.filter((product) => selectedDevices.includes(product.id));
    setComparisonDevices(productsToCompare);
    openModalCompare();
  };

  const handleSingleClick = (radio) => {
    setComparisonDevices([radio]);
    openModalCompare();
  };

  return (
    <Content>
      <RadioContext.Provider
        value={{
          updateDevice,
          updatedProduct,
          setUpdatedProduct,
          modalIsOpen,
          setIsOpen,
          openModal,
          closeModal,
          addDevice,
          admin,
          comparisonDevices,
          openModalCompare,
          closeModalCompare,
          modalIsOpenCompare,
        }}>
        <RadioModal />
        <RadioModalCompare />
      </RadioContext.Provider>

      <div className="overflow-x-auto">
        <OlimpoTable
          Hide={HideRADIO}
          Device={"Rádios Outdoor"}
          DeviceImg={DeviceImg}
          DeviceText={"Equipamentos para conexões sem fio profissionais"}
          selectedDevices={selectedDevices.length >= 2 && selectedDevices}
          handleCompareClick={handleCompareClick}
          handleHide={handleHideRADIO}
          openModal={openModal}
          query={queryRADIO}
          handleSearchChange={handleSearchChangeRADIO}
          admin={admin}
          createButton="Novo Rádio Outdoor"
          thead={<Radio_Thead />}
          tbody={RadiosOutdoor.sort(compareStatus)
            .filter((radio) => {
              if (radio.modelo.toLowerCase().includes(queryRADIO.toLowerCase())) {
                return radio;
              } else if (radio.modulação.toLowerCase().includes(queryRADIO.toLowerCase())) {
                return radio;
              } else {
              }
            })
            .map((radio) => {
              return (
                <tbody className="text-slate-700">
                  <tr
                    className={`border border-slate-100 hover:bg-slate-100 text-xs text-center whitespace-nowrap h-9 ${
                      selectedDevices.includes(radio.id) && "bg-orange-200"
                    } ${radio.ocultar === "Sim" && !admin ? "hidden" : ""}`}>
                    <TableStart
                      handleProductSelect={() => handleProductSelect(radio.id)}
                      selectedDevicesLength={selectedDevices.length}
                      selectedDevicesIncludes={selectedDevices.includes(radio.id)}
                      status={radio.status}
                      modelo={radio.modelo}
                      ocultar={radio.ocultar}
                      calculateDateDifference={calculateDateDifference(radio.date, currentDate)}
                      handleSingleClick={() => handleSingleClick(radio)}
                    />
                    <td>
                      <span className={ModulacaoStyle(radio)}>{radio.modulação}</span>
                    </td>
                    <td className="font-bold">{radio.indicado}</td>
                    <td>{radio.ganho}</td>
                    <td>{radio.potencia}</td>
                    <td>{radio.pps}</td>
                    <td>{radio.throughputEfetivo}</td>
                    <td>{radio.throughputNominal}</td>
                    <td>{radio.aberturaHorVer}</td>
                    <td>{radio.distancia}</td>
                    <td>{radio.wireless}</td>
                    <td>{radio.alimentaçao}</td>
                    <td>{radio.garantia}</td>
                    <td>
                      <a target="_blank" rel="noopener noreferrer" href={radio.pagina}>
                        <Badge size="xs" className="bg-green-500 text-white flex justify-center items-center">
                          Página
                        </Badge>
                      </a>
                    </td>
                    {admin && (
                      <td>
                        <button className="bg-yellow-300 p-1 rounded text-white" onClick={() => openUpdateModal(radio)}>
                          <HiPencil />
                        </button>
                        <button className="bg-red-600 p-1 rounded text-white ml-2" onClick={() => deleteDevice(radio.id)}>
                          <HiXMark />
                        </button>
                      </td>
                    )}
                  </tr>
                </tbody>
              );
            })}
        />
      </div>
    </Content>
  );
}
