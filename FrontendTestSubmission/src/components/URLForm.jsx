import { TextField, Button, Box, InputAdornment, Tooltip, Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";

const URLForm = ({ onSubmit }) => {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [validity, setValidity] = useState(30);
  const [errors, setErrors] = useState({});

  const validateUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!validateUrl(url)) {
      newErrors.url = "Please enter a valid URL (including http/https)";
    }
    if (customCode && !/^[a-zA-Z0-9-_]+$/.test(customCode)) {
      newErrors.customCode = "Shortcode can only contain letters, numbers, - and _";
    }
    if (validity < 1 || validity > 1440) {
      newErrors.validity = "Validity must be between 1 and 1440 minutes";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit({ url, customCode, validity: parseInt(validity) });
      setUrl("");
      setCustomCode("");
      setValidity(30);
    }
  };

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{
        p: { xs: 2, sm: 4 },
        mt: 4,
        width: "100%",
        maxWidth: "600px",
        mx: "auto",
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        🔗 URL Shortener
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              error={!!errors.url}
              helperText={errors.url}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Include http:// or https://">
                      <span role="img" aria-label="info">ℹ️</span>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Custom Shortcode (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              error={!!errors.customCode}
              helperText={errors.customCode || "Only letters, numbers, - and _ allowed"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Validity in minutes"
              type="number"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              error={!!errors.validity}
              helperText={errors.validity || "1 - 1440 minutes"}
              inputProps={{ min: 1, max: 1440 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Shorten URL
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default URLForm;
