import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectCards, FreeMode } from "swiper/modules";
import "swiper/css/bundle";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { APP_ROUTES } from "../../router/Route";
import axios from "axios";
import "./Library.scss";
import { useNavigate } from "react-router-dom";
import { Outlet, Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import updateIcon from "../../images/updateIcon.svg";
import deleteIcon from "../../images/deleteIcon.svg";

import SideBar from "../SideBar/SideBar";
import TopSideBar from "../TopSideBar/TopSideBar";

function Library() {
  const title = "Библиотека";
  const [isOpenSideBar, setIsOpenSideBar] = useState(true);
  const [choosenColor, setChoosenColor] = useState(1);
  const [choosenCreateStep, setChoosenCreateStep] = useState(1);
  const [productUpdate, setProductUpdate] = useState(false);
  const [productId, setProductId] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [allLibraries, setAllLibraries] = useState([]);
  const [libraryUpdate, setLibraryUpdate] = useState(false);
  const [libraryId, setLibraryId] = useState(0);
  const [libraryObject, setLibraryObject] = useState({
    file: [],
    title: "",
  });
  const [productObject, setproductObject] = useState({
    title: "",
    subtitle: "",
    author: "",
    files: [],
    length: "",
    price: null,
    items: [],
    libraryId: null,
  });

  useEffect(() => {
    updateAllStates();
  }, []);

  const toggleSideBar = (boolValue) => {
    setIsOpenSideBar(boolValue);
  };

  const getallProducts = async () => {
    try {
      const response = await axios.get(`${APP_ROUTES.URL}/item`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });

      setAllProducts(response.data);
    } catch (error) {
      toast.error("Произошла ошибка при загрузке продуктов");
    }
  };

  const getallLibraries = async () => {
    try {
      const response = await axios.get(`${APP_ROUTES.URL}/library`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });
      setAllLibraries(response.data);
    } catch (error) {
      toast.error("Произошла ошибка при загрузке библиотек");
    }
  };

  const updateAllStates = () => {
    getallProducts();
    getallLibraries();
  };

  const createProduct = async () => {
    if (
      !productObject.title ||
      !productObject.subtitle ||
      !productObject.author ||
      !productObject.length ||
      !productObject.price ||
      !productObject.libraryId ||
      productObject.files.length < 1
    ) {
      if (!productObject.title) toast.error("Введите название продукта");
      if (!productObject.subtitle) toast.error("Введите описание продукта");
      if (!productObject.author) toast.error("Введите автора продукта");
      if (!productObject.length) toast.error("Введите время продукта");
      if (!productObject.price) toast.error("Введите цену");
      if (productObject.files.length < 1) toast.error("Выберите Файл");
      if (!productObject.libraryId) toast.error("Выберите библиотеку");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("@token")}`
    );

    const formdata = new FormData();
    if (productObject.files[0]) {
      formdata.append(
        "files",
        productObject.files[0],
        productObject.files[0]?.name
      );
    }
    if (productObject.items[0]) {
      formdata.append(
        "files",
        productObject.items[0],
        productObject.items[0]?.name
      );
    }
    formdata.append("title", productObject.title);
    formdata.append("subtitle", productObject.subtitle);
    formdata.append("author", productObject.author);
    formdata.append("price", productObject.price);
    formdata.append("libraryId", productObject.libraryId);
    formdata.append("length", productObject.length);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(`${APP_ROUTES.URL}/item`, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => toast.error("Произошла ошибка при создании продукта"));

    toast.success("Продукт успешно создан!");
    updateAllStates();
    cancelUpdateProduct();
  };

  const createLibrary = async () => {
    if (!libraryObject.title) {
      toast.error("Введите название продукта");
      return;
    }
    if (!libraryObject.file || libraryObject.file.length < 1) {
      toast.error("Выберите фото продукта");
      return;
    }
    const file = libraryObject.file[0];
    if (!file.type.startsWith("image")) {
      toast.error("Выберите файл изображения");
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("@token")}`
    );

    const formdata = new FormData();
    formdata.append("file", file, file?.name);
    formdata.append("name", libraryObject.title);
    console.log("Отправка данных:");
    for (let pair of formdata.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(`${APP_ROUTES.URL}/library`, requestOptions);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка при создании библиотеки");
      }
      const result = await response.json();

      toast.success("Библиотека успешно создан");
      updateAllStates();
      cancelUpdateLibrary();
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error(`Произошла ошибка при создании библиотеки: ${error.message}`);
    }
  };

  const removeLibrary = async (id) => {
    if (window.confirm("Вы уверены что хотите удалить библиотеку?")) {
      fetch(`${APP_ROUTES.URL}/library/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      })
        .then((response) => response.text())
        .then((result) => {
          toast.success("Библиотека успешно удален!");
          updateAllStates();
        })
        .catch((error) => {
          toast.error("Произошла ошибка при удалении библиотеки");
        });
    }
  };

  const removeProduct = async (id) => {
    if (window.confirm("Вы уверены что хотите удалить супер категорию?")) {
      fetch(`${APP_ROUTES.URL}/item/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      })
        .then((response) => response.text())
        .then((result) => {
          toast.success("Продукт успешно удален!");
          updateAllStates();
        })
        .catch((error) => {
          toast.error("Произошла ошибка при удалении продукта");
        });
    }
  };

  const handleFileInputchangeLibrary = (event) => {
    const files = event.target.files;

    if (files.length > 1) {
      toast.error("Максимальное количество фото — 1");
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("image")) {
      toast.error("Выберите файл типа изображения");
      return;
    }

    setLibraryObject((prev) => ({
      ...prev,
      file: [file],
    }));
  };

  const changeProduct = (id) => {
    setProductId(id);
    setProductUpdate(true);
    const product = allProducts.find((product) => product.id === id);
    setproductObject({
      libraryId: product.libraryId,
      title: product.title,
      subtitle: product.subtitle,
      length: product.length,
      author: product.author,
      price: product.price,
      files: [],
    });
  };

  const updateProduct = async () => {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("@token")}`
    );

    const formdata = new FormData();
    if (productObject.files.length > 0) {
      formdata.append(
        "files",
        productObject.files[0],
        productObject.files[0]?.name
      );
      formdata.append(
        "files",
        productObject.items[0],
        productObject.items[0]?.name
      );
    }
    formdata.append("id", productId);
    formdata.append("title", productObject.title);
    formdata.append("subtitle", productObject.subtitle);
    formdata.append("author", productObject.author);
    formdata.append("length", productObject.length);
    formdata.append("price", productObject.price);
    formdata.append("libraryId", productObject.libraryId);

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(`${APP_ROUTES.URL}/item`, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => toast.error("Произошла ошибка при изменении продукта"));

    toast.success("Продукт успешно изменен");
    updateAllStates();
    setProductUpdate(false);
    setproductObject({
      ...productObject,
      title: "",
      description: "",
      time: "",
      author: "",
      price: 0,
    });
  };

  const cancelUpdateProduct = () => {
    setproductObject({
      ...productObject,
      title: "",
      subtitle: "",
      length: "",
      files: [],
      author: "",
      price: 0,
      libraryId: 0,
    });
    document.getElementById("product-file-input").value = "";
    setProductUpdate(false);
  };

  const changeLibrary = (id) => {
    setLibraryId(id);
    setLibraryUpdate(true);
    const library = allLibraries.find((library) => library.id === id);
    setLibraryObject({
      ...libraryObject,
      title: library?.name,
      file: [],
    });
  };

  const updateLibrary = async () => {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append(
      "Authorization",
      `Bearer ${localStorage.getItem("@token")}`
    );

    const formdata = new FormData();

    if (libraryObject.file[0]) {
      formdata.append("file", libraryObject.file[0], "/path/to/file");
    }
    formdata.append("id", libraryId);
    formdata.append("name", libraryObject.title);

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(`${APP_ROUTES.URL}/library`, requestOptions);
      const result = await response.text();

      if (response.ok) {
        toast.success("Библиотека успешно изменен");
        updateAllStates();
        cancelUpdateLibrary();
      } else {
        toast.error("Произошла ошибка при изменении библиотеки");
        console.error(result);
      }
    } catch (error) {
      toast.error("Произошла ошибка при изменении ");
      console.error(error);
    }
  };

  const cancelUpdateLibrary = () => {
    setLibraryUpdate(false);
    setChoosenColor(1);
    document.getElementById("file-input").value = "";
    setLibraryObject({
      file: [],
      title: "",
    });
  };

  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {isOpenSideBar && <SideBar title={title} />}
      <div className="mainInfo">
        <TopSideBar
          title={title}
          toggleSideBar={toggleSideBar}
          isOpenSideBar={isOpenSideBar}
        />
        <div className="mainInfoContainer">
          <div className="mainInfoCardsContainer">
            <div className="mainInfoCard">
              <div className="cardTitle">Библиотеки</div>
              <div className="cardQty">{allLibraries.length}</div>
              <div className="plusIcon" onClick={() => setChoosenCreateStep(1)}>
                +
              </div>
            </div>
            <div className="mainInfoCard">
              <div className="cardTitle">Продукты</div>
              <div className="cardQty">{allProducts.length}</div>
              <div className="plusIcon" onClick={() => setChoosenCreateStep(2)}>
                +
              </div>
            </div>
          </div>
          <div className="corporativeCreateWrapper">
            <div
              className={`corporativeCreate ${
                choosenCreateStep === 1 && "choosenStep"
              }`}
            >
              <h2 className="headingCreate">
                {libraryUpdate ? "Изменить библиотеку" : "Новый библиотека"}
              </h2>
              <div className="formInputs">
                <div className="textInputsWrapper">
                  <div className="textInputsLine">
                    <div className="textInput">
                      <label>Наименование библиотеки *</label>
                      <input
                        type="text"
                        value={libraryObject.title}
                        onChange={(e) =>
                          setLibraryObject({
                            ...libraryObject,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="buttonsWrapper">
                      <button
                        onClick={() =>
                          libraryUpdate ? updateLibrary() : createLibrary()
                        }
                      >
                        {libraryUpdate ? "Изменить" : "Создать"}
                      </button>
                      <button onClick={() => cancelUpdateLibrary()}>
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
                <div className="imageInputsWrapper">
                  <label>Выберите Фото *</label>
                  <input
                    className="selectImageIconInput"
                    type="file"
                    id="file-input"
                    placeholder="Загрузить фото"
                    multiple
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => handleFileInputchangeLibrary(e)}
                  />
                </div>
              </div>
            </div>

            <div
              className={`corporativeCreate ${
                choosenCreateStep === 2 && "choosenStep"
              }`}
            >
              <h2 className="headingCreate">
                {productUpdate ? "Изменить продукт" : "Новый продукт"}
              </h2>
              <div className="formInputs">
                <div className="textInputsWrapper">
                  <div className="textInputsLine">
                    <div className="textInput">
                      <label>Наименование продукта *</label>
                      <input
                        type="text"
                        value={productObject.title}
                        onChange={(e) =>
                          setproductObject({
                            ...productObject,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="textInput">
                      <label>Описание продукта *</label>
                      <input
                        type="text"
                        value={productObject.subtitle}
                        onChange={(e) =>
                          setproductObject({
                            ...productObject,
                            subtitle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="textInput">
                      <label>Цена продукта *</label>
                      <input
                        type="number"
                        value={productObject.price}
                        onChange={(e) =>
                          setproductObject({
                            ...productObject,
                            price: +e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="buttonsWrapper">
                      <button
                        onClick={() =>
                          productUpdate ? updateProduct() : createProduct()
                        }
                      >
                        {productUpdate ? "Изменить" : "Создать"}
                      </button>
                      <button onClick={() => cancelUpdateProduct()}>
                        Отмена
                      </button>
                    </div>
                  </div>
                  <div className="textInputsLine">
                    <div className="textInput">
                      <label>Автор продукта *</label>
                      <input
                        type="text"
                        value={productObject.author}
                        onChange={(e) =>
                          setproductObject({
                            ...productObject,
                            author: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="textInput">
                      <label>Длительность продукта *</label>
                      <input
                        type="text"
                        value={productObject.length}
                        placeholder="Пример: 1 oy"
                        onChange={(e) =>
                          setproductObject({
                            ...productObject,
                            length: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="textInput">
                      <label>Библиотека *</label>
                      <select
                        name=""
                        id=""
                        value={productObject.libraryId}
                        onChange={(e) => {
                          console.log(e.target.value);
                          setproductObject({
                            ...productObject,
                            libraryId: e.target.value,
                          });
                        }}
                      >
                        <option hidden value="">
                          Выберите библиотеку
                        </option>
                        {allLibraries.map((library) => (
                          <option key={library.id} value={library.id}>
                            {library?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="imageInputsWrapper">
                  <label>Выберите Фото *</label>
                  <input
                    className="selectImageIconInput"
                    type="file"
                    id="product-file-input"
                    placeholder="Загрузить видео"
                    accept="image/png, image/jpeg, image/jpg image/svg"
                    onChange={(e) =>
                      setproductObject({
                        ...productObject,
                        files: e.target.files,
                      })
                    }
                  />
                  <label>Выберите доп. файлы *</label>
                  <input
                    className="selectImageIconInput"
                    type="file"
                    id="product-file-input"
                    placeholder="Загрузить видео"
                    multiple
                    onChange={(e) => {
                      setproductObject({
                        ...productObject,
                        items: e.target.files,
                      });
                      console.log(e.target.files);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {allLibraries.length > 0 && (
            <div
              className={`table ${choosenCreateStep === 1 && "choosenStep"}`}
            >
              <div className="tableWrapper">
                <div className="tableHeader">
                  <div className="tableHeaderItem smallItem">ID</div>
                  <div className="tableHeaderItem">Наименование</div>
                  <div className="tableHeaderItem smallItem">Изменить</div>
                  <div className="tableHeaderItem smallItem">Удалить</div>
                </div>
                <div className="tableBody">
                  {allLibraries.map((library, index) => (
                    <div className="tableBodyItemWrapper" key={index}>
                      <div className="tableBodyItem smallItem">{index + 1}</div>
                      <div className="tableBodyItem">{library?.name}</div>
                      <div className="tableBodyItem smallItem">
                        <div
                          className="change"
                          onClick={() => changeLibrary(library.id)}
                        >
                          <img src={updateIcon} alt={updateIcon} />
                        </div>
                      </div>
                      <div className="tableBodyItem smallItem">
                        <div
                          className="remove"
                          onClick={() => removeLibrary(library.id)}
                        >
                          <img src={deleteIcon} alt={deleteIcon} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {allProducts.length > 0 && (
            <div
              className={`table ${choosenCreateStep === 2 && "choosenStep"}`}
            >
              <div className="tableWrapper">
                <div className="tableHeader">
                  <div className="tableHeaderItem smallItem">ID</div>
                  <div className="tableHeaderItem">Наименование</div>
                  <div className="tableHeaderItem smallItem">Библиотека</div>
                  {/* <div className="tableHeaderItem smallItem">Изменить</div> */}
                  <div className="tableHeaderItem smallItem">Удалить</div>
                </div>
                <div className="tableBody">
                  {allProducts.map((product) => (
                    <div className="tableBodyItemWrapper" key={product.id}>
                      <div className="tableBodyItem smallItem">
                        {product.id}
                      </div>
                      <div className="tableBodyItem">{product.title}</div>
                      <div className="tableBodyItem smallItem">
                        {
                          allLibraries.find(
                            (library) => library.id === product.libraryId
                          )?.name
                        }
                      </div>
                      {/* <div className="tableBodyItem smallItem">
                        <div
                          className="change"
                          onClick={() => changeProduct(product.id)}
                        >
                          <img src={updateIcon} alt={updateIcon} />
                        </div>
                      </div> */}
                      <div className="tableBodyItem smallItem">
                        <div
                          className="remove"
                          onClick={() => removeProduct(product.id)}
                        >
                          <img src={deleteIcon} alt={deleteIcon} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Outlet />
    </>
  );
}

export default Library;
