import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f0f8ff, #e6e6fa)',
                padding: '20px'
            }}
        >
            <Typography
                variant="h1"
                sx={{
                    fontSize: '120px',
                    fontWeight: 'bold',
                    color: '#000',
                    marginBottom: '20px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                404
            </Typography>

            <Typography
                variant="h4"
                sx={{
                    marginBottom: '16px',
                    color: '#333',
                    fontWeight: 600
                }}
            >
                Page Not Found
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    color: '#666',
                    maxWidth: '500px',
                    marginBottom: '32px'
                }}
            >
                The page you are looking for might have been removed, had its name changed,
                or is temporarily unavailable.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                    sx={{
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        '&:hover': {
                            backgroundColor: '#e5e5e5'
                        }
                    }}
                    startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
                >
                    Go Back
                </Button>

                <Button
                    variant="contained"
                    onClick={() => navigate(ROUTES.CUSTOMER)}
                    sx={{
                        backgroundColor: '#000',
                        '&:hover': {
                            backgroundColor: '#333'
                        }
                    }}
                    startIcon={<FontAwesomeIcon icon={faHome} />}
                >
                    Home
                </Button>
            </Box>
        </Box>
    );
};

export default NotFound;
