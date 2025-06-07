import React, { useEffect, useState } from "react";
import {
  Card,
  DatePicker,
  Input,
  Select,
  Table,
  Typography,
  Spin,
  Button,
} from "antd";
import { ToastContainer } from "react-toastify";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import TopSideBar from "../TopSideBar/TopSideBar";
import axios from "axios";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { APP_ROUTES } from "../../router/Route";

const { RangePicker } = DatePicker;
const { Option } = Select;
const PAGE_SIZE = 10;

const Funds = () => {
  const title = "Полученные средства";
  const [isOpenSideBar, setIsOpenSideBar] = useState(true);
  const toggleSideBar = (bool) => setIsOpenSideBar(bool);

  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [paymentType, setPaymentType] = useState(null);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
  });

  const token = localStorage.getItem("@token");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APP_ROUTES.URL}/finances/allPaymentsWithFilter`,
        {
          params: {
            from_date: dateRange[0]?.format("YYYY-MM-DD"),
            until: dateRange[1]?.format("YYYY-MM-DD"),
            paymentType: paymentType || undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data || [];

      const formatted = data.map((item) => ({
        ...item,
        fullName: item.User?.fullName || "",
        phoneNumber: item.User?.phoneNumber || "",
        date: item.createdAt,
      }));

      setFunds(formatted);
      setFilteredFunds(formatted);
      setPagination({ ...pagination, current: 1 });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalAmount = async () => {
    try {
      const response = await axios.get(`${APP_ROUTES.URL}/finances/sum`, {
        params: {
          from_date: dateRange[0]?.format("YYYY-MM-DD"),
          until: dateRange[1]?.format("YYYY-MM-DD"),
          paymentType: paymentType || undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setTotalAmount(response.data || 0);
    } catch (error) {
      console.error("Ошибка суммы:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchTotalAmount();
  }, [dateRange, paymentType]);

  useEffect(() => {
    const filtered = funds.filter(
      (item) =>
        item.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phoneNumber.includes(searchText)
    );
    setFilteredFunds(filtered);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchText, funds]);

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
    });
  };

  const handleExport = () => {
    const exportData = filteredFunds.map((item) => ({
      ID: item.id,
      ФИО: item.fullName,
      Телефон: item.phoneNumber,
      Сумма: item.amount,
      Дата: dayjs(item.date).format("YYYY-MM-DD HH:mm"),
      "Тип оплаты": item.paymentType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Средства");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "funds_export.xlsx");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "ФИО", dataIndex: "fullName", key: "fullName" },
    { title: "Телефон", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (value) => `${value} сум.`,
    },
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Тип оплаты",
      dataIndex: "paymentType",
      key: "paymentType",
    },
  ];

  const currentData = filteredFunds.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

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
        <div style={{ padding: "20px" }} className="mainInfoContainer">
          <Typography.Title level={2}>Полученные средства</Typography.Title>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", flex: "1", gap: "16px" }}>
              <Input
                placeholder="ФИО или номер телефона"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "30%" }}
              />
              <RangePicker
                onChange={(dates) => setDateRange(dates)}
                format="YYYY-MM-DD"
                style={{ width: "30%" }}
              />
              <Select
                placeholder="Тип оплаты"
                style={{ width: "20%" }}
                allowClear
                value={paymentType}
                onChange={setPaymentType}
              >
                <Option value="payme">Payme</Option>
                <Option value="click">Click</Option>
                <Option value="uzum">Uzum</Option>
              </Select>
            </div>
            <Button onClick={handleExport} type="primary">
              Экспорт в Excel
            </Button>
          </div>

          <Card title="Общая сумма" style={{ marginBottom: "16px" }}>
            {totalAmount} сум.
          </Card>

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={currentData}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: PAGE_SIZE,
                total: filteredFunds.length,
                showSizeChanger: false,
              }}
              onChange={handleTableChange}
            />
          </Spin>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Funds;
