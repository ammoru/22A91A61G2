import { CssBaseline, Container, Typography, AppBar, Toolbar } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";

const App = () => {
  return (
    <Router>
    
      <CssBaseline />

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            🔗 URL Shortener
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <AppRoutes />
      </Container>
    </Router>
  );
};

export default App;
