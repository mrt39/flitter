/* eslint-disable react/prop-types */
import React from 'react';
import { Card, CardContent, Avatar, Typography, Box, Button } from '@mui/material';
import { Verified } from '@mui/icons-material';

const HoverUserCard = ({user}) => {
  return (
    <Card sx={{ width: 300, borderRadius: 3, boxShadow: 3 }}>
      <Box display="flex" flexDirection="row" alignItems="center" p={2}>
        <Avatar
          alt={user.name}
          src={user.avatar}
          sx={{ width: 56, height: 56, mr: 2 }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold" noWrap>
            {user.name}
            {user.isVerified && (
              <Verified sx={{ color: '#1DA1F2', fontSize: 18, ml: 0.5 }} />
            )}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            @{user.username}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.primary" paragraph>
          {user.bio}
        </Typography>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" fontWeight="bold">
            {user.following} <span style={{ color: '#657786' }}>Following</span>
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {user.followers} <span style={{ color: '#657786' }}>Followers</span>
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          sx={{
            mt: 1.5,
            textTransform: 'none',
            borderColor: '#1DA1F2',
            color: '#1DA1F2',
            '&:hover': {
              borderColor: '#1A91DA',
              backgroundColor: 'rgba(29,161,242,0.1)',
            },
          }}
        >
          Follow
        </Button>
      </CardContent>
    </Card>
  );
};



export default HoverUserCard;

