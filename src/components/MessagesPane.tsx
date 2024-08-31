import * as React from "react";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import AvatarWithStatus from "./AvatarWithStatus.tsx";
import ChatBubble from "./ChatBubble.tsx";
import MessageInput from "./MessageInput.tsx";
import MessagesPaneHeader from "./MessagesPaneHeader.tsx";
import io from "socket.io-client";
import axios from "axios";
import { APP_ROUTES } from "../router/Route";
import { useNavigate } from "react-router-dom";

export default function MessagesPane(props) {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = React.useState([]);
  const [textAreaValue, setTextAreaValue] = React.useState("");

  const socket = io("https://proskill-academy.com:5000", {
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${localStorage.getItem("mentorToken")}`,
        },
      },
    },
  });

  const getSelectedChat = async (chatId) => {
    try {
      const response = await axios.get(
        APP_ROUTES.URL + "/chat/mentor/byUser/" + chatId,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mentorToken")}`,
          },
        }
      );
      setChatMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  socket.on("message", (data) => {
    setTimeout(() => {
      getSelectedChat(props.selectedChatId);
    }, 200);
  });

  React.useEffect(() => {
    getSelectedChat(props.selectedChatId);

    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [props.selectedChatId]);

  const handleSubmit = async () => {
    socket.emit("message", {
      text: textAreaValue,
      userId: props.selectedChatId,
    });

    setTextAreaValue("");

    setTimeout(() => {
      getSelectedChat(props.selectedChatId);
    }, 200);
  };

  return (
    <Sheet
      sx={{
        height: { xs: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.level1",
      }}
    >
      <MessagesPaneHeader chat={props?.selectedChat} />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          px: 2,
          py: 3,
          overflowY: "scroll",
          flexDirection: "column-reverse",
        }}
      >
        <Stack spacing={2} sx={{ justifyContent: "flex-end" }}>
          {chatMessages?.map((message: any, index) => {
            const isYou = message.fromMentor;
            return (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                sx={{ flexDirection: isYou ? "row-reverse" : "row" }}
              >
                <AvatarWithStatus
                  online={true}
                  src="/static/images/avatar/3.jpg"
                />
                <ChatBubble
                  variant={isYou ? "sent" : "received"}
                  message={message}
                />
              </Stack>
            );
          })}
        </Stack>
      </Box>
      <MessageInput
        textAreaValue={textAreaValue}
        setTextAreaValue={setTextAreaValue}
        onSubmit={handleSubmit}
      />
    </Sheet>
  );
}
