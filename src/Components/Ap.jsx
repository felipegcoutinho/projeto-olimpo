import React from "react";
import {useEffect, useState, useContext, createContext} from "react";
import Ap_Modal from "./ApModal";
import {AdminContext} from "../App";
import Swal from "sweetalert2";
import Modal from "react-modal";
import {getDatabase, get, set, ref, push, remove} from "firebase/database";
import {app, db} from "../database/firebase";
import Content from "../ui/Content";
import {Badge, Button} from "flowbite-react";
import {HiArrowTopRightOnSquare, HiCheckCircle, HiXCircle, HiPencil, HiXMark} from "react-icons/hi2";
import AP_Thead from "../TableHeads";
import OlimpoTable from "../ui/Table";

export const APContext = createContext();

export default function Ap() {
  const [queryAP, setQueryAP] = useState("");
  const [accessPoint, setAccessPoint] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);

  const {admin, HideAP, setHideAP, updatedProduct, setUpdatedProduct} = useContext(AdminContext);

  const handleHideAP = () => setHideAP(!HideAP);
  const handleSearchChangeAP = (e) => {
    setQueryAP(e.target.value);
  };

  /* Configs Modal */
  Modal.setAppElement("#root");
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setUpdatedProduct(false);
  }

  /* Buscar Produto */
  const fetchProducts = async () => {
    const db = getDatabase(app);
    const apRef = ref(db, "aps");
    const snapshot = await get(apRef);
    const data = [];
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      data.push({
        id: childSnapshot.key,
        ...childData,
      });
    });
    setAccessPoint(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* Adicionar Produto */
  const addProduto = async (e) => {
    e.preventDefault();
    const apRef = ref(db, "aps");
    const newAPRef = push(apRef);
    await set(newAPRef, updatedProduct);
    Swal.fire({
      title: "Adicionado!",
      confirmButtonColor: "#006e39",
    });
    setUpdatedProduct({});
    fetchProducts();
    closeModal();
  };

  /* Deletar Produto */
  const deleteProduct = async (id) => {
    const db = getDatabase(app);
    const apRef = ref(db, `aps/${id}`);
    Swal.fire({
      title: "Você tem certeza?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#006e39",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, deletar",
    }).then((result) => {
      if (result.isConfirmed) {
        remove(apRef);
        Swal.fire("Equipamento deletado!");
        fetchProducts();
      }
    });
  };

  /* Atualizar  Produto */
  const openUpdateModal = (updatedProduct) => {
    setUpdatedProduct(updatedProduct);
    setIsOpen(true);
  };
  const updateProduct = async (e) => {
    e.preventDefault();
    const apRef = ref(db, `aps/${updatedProduct.id}`);
    await set(apRef, updatedProduct);
    Swal.fire({
      title: "Atualizado!",
      confirmButtonColor: "#006e39",
    });
    setUpdatedProduct({});
    fetchProducts();
    closeModal();
  };

  function compareStatus(a, b) {
    if (a.status === "Suporte" && b.status !== "Suporte") {
      return -1;
    } else if (a.status !== "Suporte" && b.status === "Suporte") {
      return 1;
    } else if (a.status === "Phaseout" && b.status !== "Phaseout") {
      return 1;
    } else if (a.status !== "Phaseout" && b.status === "Phaseout") {
      return -1;
    } else {
      if (a.modelo < b.modelo) {
        return -1;
      } else if (a.modelo > b.modelo) {
        return 1;
      }
      return 0;
    }
  }

  const [openRow, setOpenRow] = useState(null);

  const handleClick = (i) => {
    if (openRow === i) {
      setOpenRow(null);
    } else {
      setOpenRow(i);
    }
  };

  const NaoPossui = (
    <div className="flex justify-center items-center">
      <HiXCircle className="text-red-400 text-center text-2xl" />
    </div>
  );

  const Possui = (
    <div className="flex justify-center items-center">
      <HiCheckCircle className="text-green-400 text-center text-2xl" />
    </div>
  );

  // Esse trecho vai gerenciar os produtos selecionados

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [comparisonProducts, setComparisonProducts] = useState([]);

  const handleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleCompareClick = () => {
    const productsToCompare = accessPoint.filter((product) => selectedProducts.includes(product.id));
    setComparisonProducts(productsToCompare);
  };

  return (
    <Content>
      <APContext.Provider
        value={{
          updateProduct,
          updatedProduct,
          setUpdatedProduct,
          modalIsOpen,
          setIsOpen,
          openModal,
          closeModal,
          addProduto,
          admin,
        }}>
        <Ap_Modal />
      </APContext.Provider>

      {selectedProducts.length >= 2 && <button onClick={handleCompareClick}>Compare</button>}

      {comparisonProducts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Status</th>
              <th>PoE</th>
            </tr>
          </thead>
          <tbody>
            {comparisonProducts.map((product) => (
              <tr>
                <td>{product.modelo}</td>
                <td>{product.status}</td>
                <td>{product.poe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="overflow-x-auto">
        <OlimpoTable
          Hide={HideAP}
          handleHide={handleHideAP}
          openModal={openModal}
          query={queryAP}
          handleSearchChange={handleSearchChangeAP}
          admin={admin}
          newButton="Novo Access Point"
          thead={<AP_Thead />}
          tbody={accessPoint
            .sort(compareStatus)
            .filter((ap) => {
              if (ap.modelo.toLowerCase().includes(queryAP.toLowerCase())) {
                return ap;
              } else if (ap.modulação.toLowerCase().includes(queryAP.toLowerCase())) {
                return ap;
              } else {
              }
            })
            .map((ap, index) => {
              return (
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100 hover:bg-slate-100 text-xs text-center whitespace-nowrap">
                    {/*onClick={() => handleClick(index)}> */}
                    <td>
                      <div className="flex gap-2">
                        <div className="flex items-center">
                          <input
                            id="checkbox-table-search-1"
                            type="checkbox"
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 "
                            onChange={() => handleProductSelect(ap.id)}
                          />
                        </div>
                        <div
                          className={`${ap.status === "Suporte" ? "bg-green-500" : "bg-red-600"} inline-block
                        w-4 
                        h-4
                        mr-2                      
                        rounded-full`}></div>
                      </div>
                    </td>
                    <th scope="row" className="flex items-center px-2 w-max py-1 font-bold text-gray-900 ">
                      <img src={ap.img} className="w-auto h-7 mr-1" />
                      <td className="font-bold text-sm">{ap.ocultar === "Sim" ? `${ap.modelo} | Oculto` : ap.modelo}</td>
                    </th>
                    <td>
                      <span
                        className={`${
                          ap.modulação === "Fast" ? "bg-orange-400" : "bg-green-400"
                        } px-2 rounded-md uppercase font-bold text-white`}>
                        {ap.modulação}
                      </span>
                    </td>
                    <td className="font-bold">{ap.cobertura}</td>
                    <td>{ap.raio}</td>
                    <td>{ap.usuarioMax}</td>
                    <td className="px-4">{ap.throughputWireless24}</td>
                    <td>{ap.throughputWireless50 === "-" ? NaoPossui : ap.throughputWireless50}</td>
                    <td>{ap.qtdePortas}</td>
                    <td className="text-left px-4">{ap.tensao}</td>
                    <td>{ap.poe}</td>
                    <td>{ap.handover === "-" ? NaoPossui : Possui}</td>
                    <td>{ap.inmaster === "-" ? NaoPossui : Possui}</td>
                    <td className="px-4">{ap.potencia2G}</td>
                    <td>{ap.potencia5G === "-" ? NaoPossui : ap.potencia5G}</td>
                    <td>{ap.garantia}</td>
                    <td>
                      <a target="_blank" rel="noopener noreferrer" href={ap.pagina}>
                        <Badge size="xs" className="bg-green-500 text-white flex justify-center items-center">
                          Página
                        </Badge>
                      </a>
                    </td>
                    {admin && (
                      <td>
                        <button className="bg-yellow-400 p-1 rounded-md text-white" onClick={() => openUpdateModal(ap)}>
                          <HiPencil />
                        </button>
                        <button className="bg-red-700 p-1 rounded-md text-white ml-2" onClick={() => deleteProduct(ap.id)}>
                          <HiXMark />
                        </button>
                      </td>
                    )}
                  </tr>
                  {openRow === index && (
                    <tr className="bg-zinc-100">
                      <td colSpan="20" className="py-8 px-2">
                        {ap.potencia2G}
                        {ap.potencia5G}
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
        />
      </div>

      {/* {HideAP && (
        <div className="overflow-x-auto">
          <table className="w-full text-base text-left text-gray-500">
            <AP_Thead />
            {accessPoint
              .sort(compareStatus)
              .filter((ap) => {
                if (ap.modelo.toLowerCase().includes(queryAP.toLowerCase())) {
                  return ap;
                } else if (ap.modulação.toLowerCase().includes(queryAP.toLowerCase())) {
                  return ap;
                } else {
                }
              })
              .map((ap, index) => {
                return (
                  <tbody className="whitespace-nowrap">
                    <tr id="AP" className="bg-slate-50 border-zinc-200 p-4" onClick={() => handleClick(index)}>
                      {" "}
                      <td className={ap.status === "Phaseout" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {ap.ocultar === "Sim" ? `${ap.modelo} | Oculto` : ap.modelo}
                      </td>
                      <td>
                        <span className={ap.modulação === "Fast" ? style.fast : style.giga}>{ap.modulação}</span>{" "}
                      </td>
                      <td>{ap.cobertura}</td>
                      <td>{ap.raio}</td>
                      <td>{ap.usuarioMax}</td>
                      <td>{ap.throughputWireless24}</td>
                      <td className={ap.throughputWireless50 === "-" && style.NaoPossui}>
                        {ap.throughputWireless50 !== "-" && ap.throughputWireless50}
                      </td>
                      <td>{ap.qtdePortas}</td>
                      <td className={ap.poe === "-" && style.NaoPossui}>{ap.poe !== "-" && ap.poe}</td>
                      <td className={ap.connectiVersion === "-" && style.NaoPossui}>{ap.connectiVersion !== "-" && ap.connectiVersion}</td>
                      <td className={ap.handover === "-" ? style.NaoPossui : style.Possui}></td>
                      <td className={ap.wisefi === "-" ? style.NaoPossui : style.Possui}></td>
                      <td className={ap.inmaster === "-" ? style.NaoPossui : style.Possui}></td>
                      <td className={ap.potencia5G === "-" && style.NaoPossui}>{ap.potencia5G !== "-" && ap.potencia5G}</td>
                      <td>
                        <a target="_blank" rel="noopener noreferrer" href={ap.pagina}>
                          <Badge size="xs" icon={HiArrowTopRightOnSquare} className="bg-green-500 text-white">
                            Página
                          </Badge>
                        </a>
                      </td>
                      {admin && (
                        <td>
                          <button className={style.btn_alterar} onClick={() => openUpdateModal(ap)}></button>
                          <button className={style.btn_excluir} onClick={() => deleteProduct(ap.id)}></button>
                        </td>
                      )}
                    </tr>
                    {openRow === index && (
                      <>
                        {ap.tensao}
                        {ap.potencia2G}
                        {ap.garantia}
                      </>
                    )}
                  </tbody>
                );
              })}
          </table>
        </div>
      )} */}
    </Content>
  );
}
