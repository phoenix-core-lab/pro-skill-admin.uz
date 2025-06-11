// Registrate.jsx
import React, { useState } from "react";
import { Button, Form as AntForm, Typography, message } from "antd";
import { Helmet } from "react-helmet";
import { useForm, Controller } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import SideBar from "../SideBar/SideBar";
import TopSideBar from "../TopSideBar/TopSideBar";
import { APP_ROUTES } from "../../router/Route";
import { Outlet } from "react-router-dom";
import "./Registrate.scss";

const formatUzPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 5),
    digits.slice(5, 8),
    digits.slice(8, 10),
    digits.slice(10, 12),
  ];
  return "+998 " + parts.slice(1).filter(Boolean).join(" ");
};

const Registrate = () => {
  const title = "Зарегистрировать";
  const [isOpenSideBar, setIsOpenSideBar] = useState(true);
  const toggleSideBar = (bool) => setIsOpenSideBar(bool);
  const token = localStorage.getItem("@token");

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const cleanedPhone = data.phoneNumber.replace(/\D/g, "");
    try {
      await axios.post(
        `${APP_ROUTES.URL}/auth/registerByAdmin`,
        {
          fullName: data.fullName,
          phoneNumber: `+${cleanedPhone}`,
          password: data.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Пользователь успешно зарегистрирован");
      reset();
    } catch (err) {
      console.error(err);
      message.error("Ошибка при регистрации");
    }
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

        <div className="registrate-container">
          <Typography.Title level={2}>
            Регистрация пользователя
          </Typography.Title>

          <AntForm layout="vertical" onFinish={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <AntForm.Item
              label="ФИО"
              validateStatus={errors.fullName ? "error" : ""}
              help={errors.fullName?.message}
            >
              <Controller
                name="fullName"
                control={control}
                rules={{ required: "ФИО обязательно" }}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Rediska Kolobokova"
                    className="input-field"
                  />
                )}
              />
            </AntForm.Item>

            {/* Phone Number */}
            <AntForm.Item
              label="Телефон"
              validateStatus={errors.phoneNumber ? "error" : ""}
              help={errors.phoneNumber?.message}
            >
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: "Телефон обязателен",
                  validate: (value) => {
                    const digits = value.replace(/\D/g, "");
                    return digits.length === 12 || "Введите полный номер";
                  },
                }}
                render={({ field }) => (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => {
                      let input = e.target.value;
                      if (!input.startsWith("+998 ")) {
                        input = "+998 ";
                      }
                      field.onChange(formatUzPhone(input));
                    }}
                    placeholder="+998 90 123 45 67"
                    className="input-field"
                  />
                )}
              />
            </AntForm.Item>

            {/* Password */}
            <AntForm.Item
              label="Пароль"
              validateStatus={errors.password ? "error" : ""}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                rules={{ required: "Пароль обязателен" }}
                render={({ field }) => (
                  <input
                    type="password"
                    {...field}
                    placeholder="Введите пароль"
                    className="input-field"
                  />
                )}
              />
            </AntForm.Item>

            <Button
              htmlType="submit"
              type="primary"
              loading={isSubmitting}
              className="submit-button"
            >
              Зарегистрировать
            </Button>
          </AntForm>
        </div>
      </div>

      <Outlet />
    </>
  );
};

export default Registrate;
