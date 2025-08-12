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

// Функция для проверки, начинает ли пользователь вводить номер телефона
const looksLikePhoneStart = (value) => {
  const clean = value.replace(/\s/g, "");
  // Проверяем только если значение точно соответствует началу номера телефона
  return (clean.startsWith("+998") && clean.length > 4) || 
         (clean.startsWith("998") && clean.length > 3) || 
         clean === "+";
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const loginValue = watch("login");

  const onSubmit = async (data) => {
    try {
      // Подготавливаем данные для отправки
      let loginData = data.login;
      
      // Если это номер телефона, очищаем от лишних символов
      if (looksLikePhoneStart(data.login)) {
        loginData = data.login.replace(/[^\d+]/g, "");
      }

      await axios.post(
        `${APP_ROUTES.URL}/auth/registerByAdmin`,
        {
          fullName: data.fullName,
          phoneNumber: loginData, // Отправляем под ключом phoneNumber, даже если это логин
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

            {/* Login / Phone Number */}
            <AntForm.Item
              label="Логин или номер телефона"
              validateStatus={errors.login ? "error" : ""}
              help={errors.login?.message}
            >
              <Controller
                name="login"
                control={control}
                rules={{
                  required: "Логин обязателен",
                  validate: (value) => {
                    // Если это номер телефона, проверяем его полноту
                    if (looksLikePhoneStart(value)) {
                      const digits = value.replace(/\D/g, "");
                      return digits.length === 12 || "Введите полный номер телефона";
                    }
                    // Для обычного логина минимальная длина
                    return value.length >= 3 || "Логин должен содержать минимум 3 символа";
                  },
                }}
                render={({ field }) => (
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => {
                      let input = e.target.value;
                      
                      // Если пользователь начинает вводить номер телефона
                      if (looksLikePhoneStart(input)) {
                        // Применяем форматирование для телефонных номеров
                        field.onChange(formatUzPhone(input));
                      } else {
                        // Для обычного логина просто сохраняем как есть
                        field.onChange(input);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Позволяем удалять +998 при нажатии Backspace или Delete
                      if ((e.key === 'Backspace' || e.key === 'Delete') && field.value === '+998 ') {
                        e.preventDefault();
                        field.onChange('');
                      }
                    }}
                    placeholder="username123 или +998 90 123 45 67"
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
                rules={{ 
                  required: "Пароль обязателен",
                  minLength: {
                    value: 6,
                    message: "Пароль должен содержать минимум 6 символов"
                  }
                }}
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