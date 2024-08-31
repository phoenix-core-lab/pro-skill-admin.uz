import * as React from "react";
import Sheet from "@mui/joy/Sheet";

import MessagesPane from "./MessagesPane.tsx";
import ChatsPane from "./ChatsPane.tsx";
// import { chats } from './data.tsx';
import axios from "axios";
import { APP_ROUTES } from "../router/Route";
import { useNavigate } from "react-router-dom";

export default function MyProfile() {
  const [mentorChats, setMentorChats] = React.useState<{ id: number }[]>([]);
  const [selectedChatId, setSelectedChatId] = React.useState(0);

  const logInMentor = async () => {
    try {
      const response = await axios.post(
        "https://proskill-academy.com:5000/mentor/login",
        {
          name: "mentor",
          password: "secret",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("mentorToken", response.data.access_token);
      getMentorChats();
    } catch (error) {
      console.error(error);
    }
  };

  const getMentorChats = async () => {
    try {
      const response = await axios.get(
        "https://proskill-academy.com:5000/chat/mentor", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mentorToken")}`,
          },
        }
      );
      setMentorChats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    logInMentor();
  }, []);

  return (
    <Sheet
      sx={{
        flex: 1,
        width: "100%",
        mx: "auto",
        pt: { xs: "var(--Header-height)", md: 0 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "minmax(min-content, min(30%, 400px)) 1fr",
        },
      }}
    >
      <Sheet
        sx={{
          position: { xs: "fixed", sm: "sticky" },
          transform: {
            xs: "translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))",
            sm: "none",
          },
          transition: "transform 0.4s, width 0.4s",
          zIndex: 100,
          width: "100%",
          top: 52,
        }}
      >
        <ChatsPane
          mentorChats={mentorChats}
          setSelectedChatId={setSelectedChatId}
        />
      </Sheet>

      {selectedChatId > 0 && (
        <MessagesPane
          selectedChat = {mentorChats.find((chat) => chat.id === selectedChatId)}
          selectedChatId={selectedChatId}
        />
      )}
    </Sheet>
  );
}
