import * as React from "react";
import Stack from "@mui/joy/Stack";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { Box, Chip, IconButton, Input } from "@mui/joy";
import List from "@mui/joy/List";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChatListItem from "./ChatListItem.tsx";
import { toggleMessagesPane } from "./utils.ts";

export default function ChatsPane(props) {
  const { mentorChats } = props;
  return (
    <Sheet
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        height: { sm: "calc(100dvh - var(--Header-height))", md: "100dvh" },
        overflowY: "auto",
      }}
    >
      <List
        sx={{
          py: 0,
          "--ListItem-paddingY": "0.75rem",
          "--ListItem-paddingX": "1rem",
        }}
      >
        {mentorChats?.map((chat) =>
            chat?.messages?.length > 0 && (
              <ChatListItem setSelectedChatId={props.setSelectedChatId} key={chat.id} chat={chat} />
            )
        )}
      </List>
    </Sheet>
  );
}
