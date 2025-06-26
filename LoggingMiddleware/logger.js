import { useState, useEffect } from "react";
import { Copy, Trash2, ExternalLink, Link, Clock, MousePointer, Activity, Download } from "lucide-react";

// Logging Middleware Class
class LoggingMiddleware {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://20.244.56.144/evaluation-service/logs',
      token: config.token || null,
      enableLocalStorage: config.enableLocalStorage !== false,
      localStorageKey: config.localStorageKey || 'app_logs_queue',
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000,
      ...config
    };
    
    this.logQueue = [];
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.startBatchProcessor();
    this.loadQueuedLogs();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  startBatchProcessor() {
    setInterval(() => {
      if (this.logQueue.length > 0 && this.isOnline) {
        this.flushQueue();
      }
    }, this.config.flushInterval);
  }

  loadQueuedLogs() {
    if (!this.config.enableLocalStorage) return;
    try {
      const stored = localStorage.getItem(this.config.localStorageKey);
      if (stored) {
        this.logQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load queued logs:', error);
    }
  }

  saveQueuedLogs() {
    if (!this.config.enableLocalStorage) return;
    try {
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(this.logQueue));
    } catch (error) {
      console.error('Failed to save queued logs:', error);
    }
  }

  // Main logging function as per requirements
  async Log(stack, level, package_name, message) {
    const logEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      stack,
      level: level.toUpperCase(),
      package: package_name,
      message,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId()
      }
    };

    this.logQueue.push(logEntry);
    this.saveQueuedLogs();

    const consoleMethod = level.toLowerCase() === 'error' ? 'error' : 
                         level.toLowerCase() === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}] ${package_name}: ${message}`, { stack });

    if (this.isOnline && this.logQueue.length >= this.config.batchSize) {
      await this.flushQueue();
    }

    return logEntry;
  }

  async sendLogBatch(logs) {
    if (!this.config.token) {
      console.warn('No authentication token provided for logging API');
      return false;
    }

    const payload = {
      logs: logs,
      metadata: {
        application: 'url-shortener',
        version: '1.0.0',
        environment: 'development'
      }
    };

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Logs sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send logs to server:', error);
      return false;
    }
  }

  async flushQueue() {
    if (this.logQueue.length === 0) return;
    const logsToSend = this.logQueue.splice(0, this.config.batchSize);
    const success = await this.sendLogBatch(logsToSend);
    if (!success) {
      this.logQueue.unshift(...logsToSend);
    }
    this.saveQueuedLogs();
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('logging_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('logging_session_id', sessionId);
    }
    return sessionId;
  }

  // Convenience methods
  logUrlCreation(urlData) {
    return this.Log('frontend', 'info', 'url-shortener', `URL shortened: ${urlData.originalUrl} -> ${urlData.shortCode}`);
  }

  logUrlAccess(shortCode, originalUrl) {
    return this.Log('frontend', 'info', 'url-shortener', `Short URL accessed: ${shortCode} -> ${originalUrl}`);
  }

  logUrlExpired(shortCode) {
    return this.Log('frontend', 'warn', 'url-shortener', `Attempted access to expired URL: ${shortCode}`);
  }

  logValidationError(field, error) {
    return this.Log('frontend', 'error', 'url-shortener', `Validation failed for ${field}: ${error}`);
  }

  getQueueStatus() {
    return {
      queueLength: this.logQueue.length,
      isOnline: this.isOnline,
      hasToken: !!this.config.token
    };
  }

  getAllLogs() {
    return [...this.logQueue];
  }
}

// Initialize logger with your token
const logger = new LoggingMiddleware({
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMmE5MWE2MWcyQGFlYy5lZHUuaW4iLCJleHAiOjE3NTA5MjA5MTAsImlhdCI6MTc1MDkyMDAxMCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6Ijk1YmViODRlLWJhYzUtNGM3Zi05MDNiLTk5ZjFmNDZlMGNhNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Imt1bmNoYXB1IGFtbW9ydSIsInN1YiI6ImMwM2VlZGYxLTFlYTEtNDEwOC04MmYwLTRhOTlmMjgxN2Y2ZiJ9LCJlbWFpbCI6IjIyYTkxYTYxZzJAYWVjLmVkdS5pbiIsIm5hbWUiOiJrdW5jaGFwdSBhbW1vcnUiLCJyb2xsTm8iOiIyMmE5MWE2MWcyIiwiYWNjZXNzQ29kZSI6Ik5Gd2dSVCIsImNsaWVudElEIjoiYzAzZWVk

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

  const handleSubmit = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Link className="text-blue-600" size={40} />
            URL Shortener
          </h1>
          <p className="text-gray-600">Create short, expiring links that redirect to your original URLs</p>
        </div>

        {/* URL Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter URL *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                  required
                />
                <div className="absolute right-3 top-2 text-gray-400" title="Include http:// or https://">
                  ℹ️
                </div>
              </div>
              {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Shortcode (optional)
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="my-link"
                />
                {errors.customCode ? (
                  <p className="text-red-500 text-sm mt-1">{errors.customCode}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1">Only letters, numbers, - and _ allowed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity (minutes)
                </label>
                <input
                  type="number"
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                  min="1"
                  max="1440"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.validity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.validity ? (
                  <p className="text-red-500 text-sm mt-1">{errors.validity}</p>
                ) : (
                  <p className="text-gray-500 text-sm mt-1">1 - 1440 minutes</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Link size={20} />
              Shorten URL
            </button>
          </div>
        </div>

        {/* Shortened URLs List */}
        {shortenedUrls.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Link size={24} />
              Your Shortened URLs
            </h2>
            <div className="space-y-4">
              {shortenedUrls.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 ${
                    isExpired(item.expiresAt) 
                      ? 'border-red-300 bg-red-50 opacity-60' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={`#/${item.shortCode}`}
                          className="text-blue-600 hover:text-blue-800 font-medium break-all"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRedirect(item.shortCode);
                          }}
                        >
                          {item.shortUrl}
                        </a>
                        {isExpired(item.expiresAt) && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                            EXPIRED
                          </span>
                        )}
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                          <MousePointer size={12} />
                          {item.clicks}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm break-all mb-2">
                        → {item.originalUrl}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Valid for {item.validityMinutes} minutes
                        </span>
                        <span>Created {new Date(item.createdAt).toLocaleString()}</span>
                        {!isExpired(item.expiresAt) && (
                          <span>Expires {new Date(item.expiresAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(item.shortUrl)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                        title="Copy short URL"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => window.open(item.originalUrl, '_blank')}
                        disabled={isExpired(item.expiresAt)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Open original URL"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => deleteUrl(item.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">How to use:</h3>
          <div className="text-blue-700 text-sm space-y-1">
            <p>1. Enter a URL and optionally customize the short code</p>
            <p>2. Set validity period (1-1440 minutes)</p>
            <p>3. Click "Shorten URL" to create your short link</p>
            <p>4. Copy the short URL and share it</p>
            <p>5. When someone clicks the short URL, they'll be redirected to the original URL</p>
            <p>6. Track clicks and manage your URLs in the list below</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLShortener;