/**
 * API Configuration
 * 
 * IMPORTANT: Update this file with your backend server IP
 * 
 * To find your computer's IP address:
 * - Windows: Open Command Prompt and type: ipconfig
 * - Look for "IPv4 Address" under your network adapter
 * - Usually looks like: 192.168.x.x or 10.0.x.x
 */

// ============================================
// ⚙️ UPDATE THIS WITH YOUR BACKEND SERVER IP
// ============================================
// export const BACKEND_IP = '10.103.195.149';  // NothingPhone1
export const BACKEND_IP = '10.28.203.109';  // Mohith Hotspot
export const BACKEND_PORT = 3000;

export const API_BASE = `http://${BACKEND_IP}:${BACKEND_PORT}`;

/**
 * HOW TO UPDATE:
 * 
 * 1. Find your computer's IP:
 *    Windows: ipconfig → look for "IPv4 Address"
 *    Mac/Linux: ifconfig or ip addr
 * 
 * 2. Replace the IP above
 *    Example: BACKEND_IP = '192.168.0.105'
 * 
 * 3. Reload your Expo app (R in terminal or reload in app)
 * 
 * 4. Done! Your mobile will now connect to your backend
 * 
 * ---
 * 
 * DEFAULT: 192.168.0.114:3000
 * Change BACKEND_IP to your actual computer IP
 * 
 * Common IPs:
 * - 192.168.0.x (home WiFi)
 * - 192.168.1.x (alternative home WiFi)
 * - 10.0.0.x (enterprise networks)
 */
