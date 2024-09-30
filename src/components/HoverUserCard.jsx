/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { Card, CardContent, Avatar, Typography, Box, Button } from '@mui/material';
import { AppStatesContext} from '../App.jsx';
import '../styles/HoverUserCard.css';

const HoverUserCard = ({ user }) => {

  const {darkModeOn} = useContext(AppStatesContext); 


  return (
    <Card
      onClick={(e) => {
        e.preventDefault();
      }}
      sx={{
        width: 300,
        borderRadius: 3,
        boxShadow: darkModeOn 
        ? '0px 0px 8px rgba(255, 255, 255, 0.4)'  // White shadow for dark mode
        : '0px 0px 15px rgba(0, 0, 0, 0.15)',      // Gray shadow for light mode,
        padding: 2,
      }}
      className="userCardonHover"
    >
      {/* Flex container for avatar and follow button */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <div className="hoverUserCardAvatarandNameContainer">
          <Avatar
            alt={user.name}
            src={user.picture ? user.picture : user.uploadedpic}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Typography variant="h6" fontWeight="bold">
            {user.name}
          </Typography>
        </div>

        {/* Follow Button */}
        <Button
          variant="outlined"
          size="small"
          sx={{
            borderRadius: '9999px', // Rounded edges like Twitter button
            textTransform: 'none',
            padding: '6px 16px',
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
      </Box>

      {/* User's name and bio */}
      <CardContent sx={{ p: 0 }}>
        {/* User Bio */}
        <Typography variant="body2" color="text.primary" paragraph>
          {user.bio}
        </Typography>

        {/* Follower and Following Counts */}
        <Box display="flex" justifyContent="flex-start" gap="50px">
          <Typography variant="body2" fontWeight="bold">
            {user.followingCount} <span style={{ color: '#657786' }}>Following</span>
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {user.followerCount} <span style={{ color: '#657786' }}>Followers</span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HoverUserCard;