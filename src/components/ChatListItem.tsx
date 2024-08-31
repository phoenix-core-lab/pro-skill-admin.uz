import * as React from "react";
import Box from "@mui/joy/Box";
import ListDivider from "@mui/joy/ListDivider";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { ListItemButtonProps } from "@mui/joy/ListItemButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import CircleIcon from "@mui/icons-material/Circle";
import AvatarWithStatus from "./AvatarWithStatus.tsx";
import { toggleMessagesPane } from "./utils.ts";

export default function ChatListItem(props) {
  const { chat } = props;
  return (
    <React.Fragment>
      <ListItem>
        <ListItemButton
          onClick={() => {
            toggleMessagesPane();
            props.setSelectedChatId(chat.id);
          }}
          // selected={true}
          color="neutral"
          sx={{
            flexDirection: "column",
            alignItems: "initial",
            gap: 1,
            maxHeight: "94px",
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <AvatarWithStatus online={true} src={'/static/images/avatar/1.jpg'} />
            <Box sx={{ flex: 1 }}>
              <Typography level="title-sm">{chat?.fullName}</Typography>
              <Typography level="body-sm">{chat?.phoneNumber}</Typography>
            </Box>
            <Box sx={{ lineHeight: 1.5, textAlign: "right" }}>
              <CircleIcon sx={{ fontSize: 12 }} color="primary" />
              <Typography
                level="body-xs"
                noWrap
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                Был недавно
              </Typography>
            </Box>
          </Stack>
          <Typography
            level="body-sm"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {chat?.messages[chat?.messages.length - 1]?.message}
          </Typography>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ margin: 0 }} />
    </React.Fragment>
  );
}
