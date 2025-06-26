import { Card, CardContent, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useState } from "react";

const URLCard = ({ data }) => {
    const [copied, setCopied] = useState(false);
    const shortUrl = `${window.location.origin}/${data.shortCode}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            // fallback or error handling
        }
    };

    return (
        <Card sx={{ mt: 4, boxShadow: 4 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Shortened URL
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body1" color="primary" sx={{ wordBreak: "break-all" }}>
                        {shortUrl}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                        <IconButton onClick={handleCopy} color={copied ? "success" : "primary"} size="small">
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                        Valid for: {data.validity} mins
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default URLCard;