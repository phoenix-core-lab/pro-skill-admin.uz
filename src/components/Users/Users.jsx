import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import { Input, Table, Typography, Spin, Button } from "antd";
import axios from "axios";
import debounce from "lodash.debounce";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import SideBar from "../SideBar/SideBar";
import TopSideBar from "../TopSideBar/TopSideBar";
import { APP_ROUTES } from "../../router/Route";

const PAGE_SIZE = 10;

const Users = () => {
  const title = "Пользователи";
  const [isOpenSideBar, setIsOpenSideBar] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const buildFilterParams = (value) => {
    const isPhone = /\d/.test(value);
    return isPhone ? { phoneNumber: value } : { fullName: value };
  };

  useEffect(() => {
    fetchUsers();
  }, [searchValue]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("@token");
      let response;

      if (searchValue.trim()) {
        response = await axios.get(`${APP_ROUTES.URL}/admin/filter`, {
          params: buildFilterParams(searchValue.trim()),
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.get(`${APP_ROUTES.URL}/admin/show-all-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setUsers(response.data);
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
      toast.error("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchValue(value);
    }, 500),
    []
  );

  const resetSearch = () => {
    setSearchValue("");
  };

  const exportToExcel = () => {
    const formattedData = users.map((user) => ({
      ID: user.id,
      ФИО: user.fullName,
      Телефон: user.phoneNumber,
      Авторизован: user.authorized ? "Да" : "Нет",
      "Дата создания": new Date(user.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Пользователи");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "users.xlsx");
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
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Телефон",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Авторизован",
      dataIndex: "authorized",
      key: "authorized",
      render: (authorized) => (authorized ? "Да" : "Нет"),
      sorter: (a, b) => Number(a.authorized) - Number(b.authorized),
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
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
          <Typography.Title level={2}>Пользователи</Typography.Title>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <Input
                placeholder="Поиск по имени или номеру телефона"
                onChange={handleSearchChange}
                value={searchValue}
                style={{ width: "300px" }}
              />
              <Button onClick={resetSearch}>Сбросить поиск</Button>
            </div>
            <Button onClick={exportToExcel} type="primary">
              Экспорт в Excel
            </Button>
          </div>
          <Spin tip="Загрузка..." spinning={loading}>
            <Table
              columns={columns}
              dataSource={users}
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

export default Users;
