import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
// import { MessageProps } from './types.ts';


export default function ChatBubble(props) {
  const { message, variant } = props;
  const isSent = variant === 'sent';
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const [isCelebrated, setIsCelebrated] = React.useState<boolean>(false);

  function formatDate(isoString) {
    const date = new Date(isoString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  return (
    <Box sx={{ maxWidth: '60%', minWidth: 'auto' }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: 'space-between', mb: 0.25 }}
      >
        <Typography level="body-xs">
          {variant === 'received' ? 'Студент' : 'Вы'}
        </Typography>
        <Typography level="body-xs">{
          formatDate(message.createdAt)
          }</Typography>
      </Stack>
        <Box
          sx={{ position: 'relative' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Sheet
            color={isSent ? 'primary' : 'neutral'}
            variant={isSent ? 'solid' : 'soft'}
            sx={[
              {
                p: 1.25,
                borderRadius: 'lg',
              },
              isSent
                ? {
                    borderTopRightRadius: 0,
                  }
                : {
                    borderTopRightRadius: 'lg',
                  },
              isSent
                ? {
                    borderTopLeftRadius: 'lg',
                  }
                : {
                    borderTopLeftRadius: 0,
                  },
              isSent
                ? {
                    backgroundColor: 'var(--joy-palette-primary-solidBg)',
                  }
                : {
                    backgroundColor: 'background.body',
                  },
            ]}
          >
            <Typography
              level="body-sm"
              sx={[
                isSent
                  ? {
                      color: 'var(--joy-palette-common-white)',
                    }
                  : {
                      color: 'var(--joy-palette-text-primary)',
                    },
              ]}
            >
              {message?.message}
            </Typography>
          </Sheet>
          
        </Box>
    </Box>
  );
}
