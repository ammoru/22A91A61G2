import { TextField, Button, Box, InputAdornment, Tooltip, Grid, Paper, Typography, Alert, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip } from "@mui/material";
import { useState, useEffect } from "react";
import { ContentCopy, Delete, Launch } from "@mui/icons-material";

const URLShortener = () => {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [validity, setValidity] = useState(30);
  const [errors, setErrors] = useState({});
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [success, setSuccess] = useState("");

  // Load stored URLs on component mount
  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem('shortenedUrls') || '[]');
    setShortenedUrls(stored);
  }, []);

  // Save URLs to storage whenever the list changes
  useEffect(() => {
    sessionStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
  }, [shortenedUrls]);

  const validateUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
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
    
    // Check if custom code already exists
    if (customCode && shortenedUrls.some(item => item.shortCode === customCode)) {
      newErrors.customCode = "This shortcode is already taken";
    }
    
    if (validity < 1 || validity > 1440) {
      newErrors.validity = "Validity must be between 1 and 1440 minutes";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const shortCode = customCode || generateShortCode();
      const expiresAt = Date.now() + (parseInt(validity) * 60 * 1000);
      
      const newShortenedUrl = {
        id: Date.now(),
        originalUrl: url,
        shortCode,
        shortUrl: `${window.location.origin}/#/${shortCode}`,
        expiresAt,
        validityMinutes: parseInt(validity),
        createdAt: Date.now(),
        clicks: 0
      };
      
      setShortenedUrls(prev => [newShortenedUrl, ...prev]);
      setSuccess(`URL shortened successfully! Short code: ${shortCode}`);
      
      // Clear form
      setUrl("");
      setCustomCode("");
      setValidity(30);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess("Copied to clipboard!");
      setTimeout(() => setSuccess(""), 3000);
    });
  };

  const deleteUrl = (id) => {
    setShortenedUrls(prev => prev.filter(item => item.id !== id));
  };

  const isExpired = (expiresAt) => {
    return Date.now() > expiresAt;
  };

  const handleRedirect = (shortCode) => {
    const urlItem = shortenedUrls.find(item => item.shortCode === shortCode);
    
    if (!urlItem) {
      alert("Short URL not found!");
      return;
    }
    
    if (isExpired(urlItem.expiresAt)) {
      alert("This short URL has expired!");
      return;
    }
    
    // Increment click count
    setShortenedUrls(prev => 
      prev.map(item => 
        item.id === urlItem.id 
          ? { ...item, clicks: item.clicks + 1 }
          : item
      )
    );
    
    // Open original URL in new tab
    window.open(urlItem.originalUrl, '_blank');
  };

  // Check URL hash on component mount and handle redirects
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/')) {
      const shortCode = hash.substring(2);
      if (shortCode) {
        handleRedirect(shortCode);
        // Clear the hash
        window.history.replaceState(null, null, ' ');
      }
    }
  }, [shortenedUrls]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        const shortCode = hash.substring(2);
        if (shortCode) {
          handleRedirect(shortCode);
          window.history.replaceState(null, null, ' ');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [shortenedUrls]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 4 }}>
      <Box sx={{ maxWidth: "800px", mx: "auto", px: 2 }}>
        {/* URL Form */}
        <Box
          component={Paper}
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            mb: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom color="primary">
            🔗 URL Shortener
          </Typography>
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custom Shortcode (optional)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  error={!!errors.customCode}
                  helperText={errors.customCode || "Only letters, numbers, - and _ allowed"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                  Shorten URL
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Shortened URLs List */}
        {shortenedUrls.length > 0 && (
          <Box component={Paper} elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Your Shortened URLs
            </Typography>
            <List>
              {shortenedUrls.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    border: 1,
                    borderColor: isExpired(item.expiresAt) ? "error.main" : "divider",
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: isExpired(item.expiresAt) ? "error.light" : "background.paper",
                    opacity: isExpired(item.expiresAt) ? 0.6 : 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="subtitle1" component="span" color="primary">
                          {item.shortUrl}
                        </Typography>
                        {isExpired(item.expiresAt) && (
                          <Chip label="EXPIRED" color="error" size="small" />
                        )}
                        <Chip label={`${item.clicks} clicks`} size="small" />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                          → {item.originalUrl}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Valid for {item.validityMinutes} minutes • 
                          Created {new Date(item.createdAt).toLocaleString()}
                          {!isExpired(item.expiresAt) && (
                            <> • Expires {new Date(item.expiresAt).toLocaleString()}</>
                          )}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Copy short URL">
                        <IconButton onClick={() => copyToClipboard(item.shortUrl)}>
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open original URL">
                        <IconButton 
                          onClick={() => window.open(item.originalUrl, '_blank')}
                          disabled={isExpired(item.expiresAt)}
                        >
                          <Launch />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => deleteUrl(item.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Instructions */}
        <Box component={Paper} elevation={1} sx={{ p: 3, mt: 4, bgcolor: "info.light" }}>
          <Typography variant="h6" gutterBottom>
            How to use:
          </Typography>
          <Typography variant="body2" component="div">
            1. Enter a URL and optionally customize the short code<br/>
            2. Set validity period (1-1440 minutes)<br/>
            3. Click "Shorten URL" to create your short link<br/>
            4. Copy the short URL and share it<br/>
            5. When someone clicks the short URL, they'll be redirected to the original URL<br/>
            6. Track clicks and manage your URLs in the list below
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default URLShortener;