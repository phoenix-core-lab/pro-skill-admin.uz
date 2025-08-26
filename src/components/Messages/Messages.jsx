// import React, { useEffect, useState } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import axios from "axios";
// import { APP_ROUTES } from "../../router/Route";
// import { Helmet } from "react-helmet";
// import SideBar from "../SideBar/SideBar";
// import TopSideBar from "../TopSideBar/TopSideBar";

// function Messages() {
//   const title = "Заявки клиентов";
//   const [isOpenSideBar, setIsOpenSideBar] = useState(true);
//   const [allQuestions, setAllQuestions] = useState([]);

//   useEffect(() => {
//     getAllQuestions();
//   }, []);

//   const toggleSideBar = (boolValue) => {
//     setIsOpenSideBar(boolValue);
//   };

//   const getAllQuestions = async () => {
//     try {
//       const response = await axios.get(`${APP_ROUTES.URL}/sms`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("@token")}`,
//         },
//       });
//       setAllQuestions(response.data);
//     } catch (error) {
//       toast.error("Произошла ошибка при загрузке вопросов");
//     }
//   };

//   return (
//     <>
//       <ToastContainer />
//       <Helmet>
//         <title>{title}</title>
//       </Helmet>
//       {isOpenSideBar && <SideBar title={title} />}
//       <div className="mainInfo">
//         <TopSideBar
//           title={title}
//           toggleSideBar={toggleSideBar}
//           isOpenSideBar={isOpenSideBar}
//         />
//         <div className="mainInfoContainer">
//           {allQuestions.length > 0 && (
//             <div className="table choosenStep" style={{ paddingTop: "20px" }}>
//               <div className="tableWrapper">
//                 <div className="tableHeader">
//                   <div className="tableHeaderItem smallItem">ID</div>
//                   <div className="tableHeaderItem">Имя и Фамилия</div>
//                   <div className="tableHeaderItem">Телефон</div>
//                   <div className="tableHeaderItem" style={{minWidth: "400px"}}>Сообщение</div>
//                   <div className="tableHeaderItem smallItem" style={{minWidth: "200px"}}>Дата</div>
//                 </div>
//                 <div className="tableBody">
//                   {allQuestions.toReversed().map((question, index) => (
//                     <div className="tableBodyItemWrapper" key={index}>
//                       <div className="tableBodyItem smallItem">{index + 1}</div>
//                       <div className="tableBodyItem">
//                         {question.name}
//                       </div>
//                       <div className="tableBodyItem">
//                         {question.phoneNumber}
//                       </div>
//                       <div className="tableBodyItem" style={{minWidth: "400px"}}>{question.sms}</div>
//                       <div className="tableBodyItem smallItem" style={{minWidth: "200px"}}>
//                         {new Date(question.createdAt).toLocaleString(
//                           "default",
//                           {
//                             day: "2-digit",
//                             month: "2-digit",
//                             year: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                             hour12: false,
//                           }
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default Messages;
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { Input, Table, Typography, Spin, Button, Select } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import SideBar from "../SideBar/SideBar";
import TopSideBar from "../TopSideBar/TopSideBar";
import { APP_ROUTES } from "../../router/Route";

const { Option } = Select;
const PAGE_SIZE = 40;

const Messages = () => {
  const title = "Заявки клиентов";
  const [isOpenSideBar, setIsOpenSideBar] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [sourceFilter, setSourceFilter] = useState(null); // Новый state для фильтра источника

  useEffect(() => {
    getAllMessages();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchValue, users, dateFrom, dateTo, sourceFilter]);

  const getAllMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${APP_ROUTES.URL}/sms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
        },
      });

      const sortedData = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setUsers(sortedData);
      setLoading(false);
    } catch (error) {
      toast.error("Произошла ошибка при загрузке заявок");
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const resetSearch = () => {
    setSearchValue("");
    setDateFrom(null);
    setDateTo(null);
    setSourceFilter(null);
  };

  // Функция для определения источника заявки
  const getSource = (name) => {
    return name && name.startsWith("Quiz:") ? "quiz" : "landing";
  };

  const handleFilter = () => {
    const value = searchValue.toLowerCase();

    const filtered = users.filter((item) => {
      const nameMatch =
        item.name.toLowerCase().includes(value) ||
        item.phoneNumber.replace(/\s/g, "").includes(value.replace(/\s/g, ""));

      const createdDate = new Date(item.createdAt);
      const fromOk = dateFrom ? createdDate >= new Date(dateFrom) : true;
      const toOk = dateTo ? createdDate <= new Date(dateTo) : true;

      // Фильтрация по источнику
      const sourceMatch = sourceFilter
        ? getSource(item.name) === sourceFilter
        : true;

      return nameMatch && fromOk && toOk && sourceMatch;
    });

    setFilteredData(filtered);
  };

  const exportToExcel = () => {
    const formattedData = filteredData.map((item) => {
      // Убираем "Quiz:" из имени для экспорта
      const displayName =
        item.name && item.name.startsWith("Quiz:")
          ? item.name.replace("Quiz:", "")
          : item.name;

      return {
        ID: item.id,
        ФИО: `${displayName}`,
        Телефон: item.phoneNumber,
        Источник: getSource(item.name) === "quiz" ? "Quiz" : "Landing Page",
        "Дата создания": new Date(item.createdAt).toLocaleString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Заявки");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "messages.xlsx");
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "ФИО",
      key: "fullName",
      render: (record) => {
        // Убираем "Quiz:" из имени для отображения
        const displayName =
          record.name && record.name.startsWith("Quiz:")
            ? record.name.replace("Quiz:", "")
            : record.name;
        return `${displayName}`;
      },
      sorter: (a, b) =>
        `${a.name}`.localeCompare(`${b.name}`),
    },
    {
      title: "Телефон",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Источник",
      key: "source",
      render: (record) =>
        getSource(record.name) === "quiz" ? "Quiz" : "Landing Page",
      sorter: (a, b) => getSource(a.name).localeCompare(getSource(b.name)),
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
  ];

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
          toggleSideBar={setIsOpenSideBar}
          isOpenSideBar={isOpenSideBar}
        />
        <div style={{ padding: "20px" }} className="mainInfoContainer">
          <Typography.Title level={2}>Заявки клиентов</Typography.Title>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "12px" }}>
              <Input
                placeholder="Поиск по имени или номеру телефона"
                onChange={handleSearchChange}
                value={searchValue}
                style={{ width: "300px" }}
              />
              <DatePicker.RangePicker
                style={{ width: 300 }}
                onChange={(dates) => {
                  setDateFrom(dates?.[0] || null);
                  setDateTo(dates?.[1] || null);
                }}
                format="DD.MM.YYYY"
              />
              <Select
                placeholder="Источник заявки"
                style={{ width: "20%" }}
                allowClear
                value={sourceFilter}
                onChange={setSourceFilter}
              >
                <Option value="quiz">Quiz</Option>
                <Option value="landing">Landing Page</Option>
              </Select>
              <Button onClick={resetSearch}>Сбросить поиск</Button>
            </div>
            <Button onClick={exportToExcel} type="primary">
              Экспорт в Excel
            </Button>
          </div>
          <Spin tip="Загрузка..." spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{
                pageSize: PAGE_SIZE,
                showSizeChanger: false,
              }}
              locale={{ emptyText: "Нет данных для отображения" }}
            />
          </Spin>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Messages;
