import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";
import {
  Input,
  Table,
  Typography,
  Spin,
  Button,
  Select,
  DatePicker,
  Modal,
  Form,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SideBar from "../SideBar/SideBar";
import TopSideBar from "../TopSideBar/TopSideBar";
import { APP_ROUTES } from "../../router/Route";
import { useDebounce } from "../../hooks/useDebounce";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Users = () => {
  const title = "Пользователи";
  const [isOpenSideBar, setIsOpenSideBar] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [dateRange, setDateRange] = useState([null, null]);

  // Состояние для модального окна смены пароля
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordForm] = Form.useForm();

  const buildFilterParams = (value) => {
    const isPhone = /\d/.test(value);
    return isPhone ? { phoneNumber: value } : { fullName: value };
  };

  useEffect(() => {
    getFilteredUsers();
  }, [debouncedSearchValue, dateRange]);

  const addRopPayment = (userId) => {
    axios
      .post(
        `${APP_ROUTES.URL}/admin/add-payment-rop`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("@token")}`,
          },
        }
      )
      .then(() => {
        toast.success("Роп платеж успешно добавлен");
        getFilteredUsers();
      })
      .catch((error) => {
        console.error("Ошибка при добавлении роп платежа:", error);
        toast.error("Не удалось добавить роп платеж");
      });
  };

  const addPayment = (userId) => {
    axios
      .post(
        `${APP_ROUTES.URL}/admin/add-payment`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("@token")}`,
          },
        }
      )
      .then(() => {
        toast.success("Платеж успешно добавлен");
        getFilteredUsers();
      })
      .catch((error) => {
        console.error("Ошибка при добавлении платежа:", error);
        toast.error("Не удалось добавить платеж");
      });
  };

  const deletePayment = (paymentId) => {
    axios
      .delete(`${APP_ROUTES.URL}/admin/delete-payment`, {
        data: { paymentId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("@token")}`,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        toast.success("Платеж успешно удален");
        getFilteredUsers();
      })
      .catch((error) => {
        console.error("Ошибка при удалении платежа:", error);
        toast.error("Не удалось удалить платеж");
      });
  };

  // Функция для смены пароля пользователя
  const changeUserPassword = async (userId, newPassword) => {
    try {
      await axios.put(
        `${APP_ROUTES.URL}/admin/change-password`,
        {
          userId: userId,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("@token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Пароль успешно изменен");
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
      setSelectedUser(null);
    } catch (error) {
      console.error("Ошибка при смене пароля:", error);
      toast.error("Не удалось изменить пароль");
    }
  };

  // Открытие модального окна для смены пароля
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setIsPasswordModalVisible(true);
  };

  // Обработка формы смены пароля
  const handlePasswordChange = () => {
    passwordForm
      .validateFields()
      .then((values) => {
        changeUserPassword(selectedUser.id, values.newPassword);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // Закрытие модального окна
  const handlePasswordModalCancel = () => {
    setIsPasswordModalVisible(false);
    passwordForm.resetFields();
    setSelectedUser(null);
  };

  const getFilteredUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("@token");

      let response;

      if (searchValue.trim()) {
        // 🔍 Поиск по отдельному endpoint-у
        response = await axios.get(`${APP_ROUTES.URL}/admin/filter`, {
          params: buildFilterParams(searchValue.trim()),
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (dateRange[0] && dateRange[1]) {
        // 📅 Фильтрация по дате
        response = await axios.get(
          `${APP_ROUTES.URL}/admin/show-all-users-filter`,
          {
            params: {
              from_date: dateRange[0],
              until: dateRange[1],
            },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // 📄 Все пользователи
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
    setSearchValue(e.target.value);
  };

  const resetSearch = () => {
    setSearchValue("");
    setDateRange([null, null]);
  };

  const exportToExcel = () => {
    const formattedData = users.map((user) => ({
      ID: user.id,
      "Логин/Номер телефона": user.phoneNumber,
      ФИО: user.fullName,
      "День регистрации": new Date(user.createdAt).toLocaleDateString(),
      "Есть ли подписка": user.payments?.length > 0 ? "Да" : "Нет",
      "Дата покупки подписки":
        user.payments?.length > 0
          ? new Date(user.payments[0].createdAt).toLocaleDateString()
          : "—",
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
      title: "Логин/Номер телефона",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "ФИО",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "День регистрации",
      dataIndex: "createdAt",
      key: "createdAt",
      // show date with time in format "DD.MM.YYYY HH:mm:ss"
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Есть ли подписка",
      key: "hasSubscription",
      render: (_, user) => {
        const paymentType = user?.payments?.[0]?.paymentType;

        const currentValue = (() => {
          switch (paymentType) {
            case "payme":
              return "Payme";
            case "click":
              return "Click";
            case "admin":
              return "Админ да";
            case "rop":
              return "Роп да";
            default:
              return "Нет";
          }
        })();

        const handleChange = async (value) => {
          if (value === "Админ да" && !paymentType) {
            await addPayment(user.id);
          } else if (value === "Роп да" && !paymentType) {
            await addRopPayment(user.id);
          } else if (value === "Нет" && paymentType) {
            await deletePayment(user.payments[0].id);
          }
        };

        return (
          <Select
            value={currentValue}
            style={{ width: 120 }}
            onChange={handleChange}
          >
            <Option value="Админ да">Админ да</Option>
            <Option value="Роп да">Роп да</Option>
            <Option value="Click">Click</Option>
            <Option value="Payme">Payme</Option>
            <Option value="Нет">Нет</Option>
          </Select>
        );
      },
      sorter: (a, b) => (a?.payments?.length || 0) - (b?.payments?.length || 0),
    },
    {
      title: "Дата покупки подписки",
      key: "subscriptionDate",
      render: (_, user) =>
        user?.payments?.length > 0
          ? new Date(user.payments[0].createdAt).toLocaleString()
          : "—",
      sorter: (a, b) => {
        const dateA = a?.payments?.[0]?.createdAt
          ? new Date(a.payments[0].createdAt)
          : 0;
        const dateB = b?.payments?.[0]?.createdAt
          ? new Date(b.payments[0].createdAt)
          : 0;
        return dateA - dateB;
      },
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, user) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => openPasswordModal(user)}
        >
          Изменить пароль
        </Button>
      ),
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
            <div style={{ display: "flex", gap: "12px" }}>
              <Input
                placeholder="Поиск по имени или логину/номеру телефона"
                onChange={handleSearchChange}
                value={searchValue}
                style={{ width: "300px" }}
              />
              <RangePicker
                onChange={(dates) => setDateRange(dates)}
                format="YYYY-MM-DD"
                style={{ width: "30%" }}
              />
              <Button onClick={resetSearch}>Сбросить</Button>
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
              pagination={{ pageSize: 40, showSizeChanger: false }}
              locale={{ emptyText: "Нет данных для отображения" }}
            />
          </Spin>
        </div>
      </div>

      {/* Модальное окно для смены пароля */}
      <Modal
        title={`Изменить пароль для ${selectedUser?.fullName}`}
        open={isPasswordModalVisible}
        onOk={handlePasswordChange}
        onCancel={handlePasswordModalCancel}
        okText="Изменить"
        cancelText="Отмена"
      >
        <Form form={passwordForm} layout="vertical" name="password_change_form">
          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Пожалуйста, введите новый пароль!",
              },
              {
                min: 6,
                message: "Пароль должен содержать минимум 6 символов!",
              },
            ]}
          >
            <Input.Password
              placeholder="Введите новый пароль"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label="Подтвердите пароль"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Пожалуйста, подтвердите пароль!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Пароли не совпадают!"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Подтвердите новый пароль"
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Outlet />
    </>
  );
};

export default Users;
