const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
}

// Helper functions
function readOrders() {
    try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading orders:', error);
        return [];
    }
}

function writeOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing orders:', error);
        return false;
    }
}

// API Routes
app.get('/api/orders', (req, res) => {
    try {
        const orders = readOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read orders' });
    }
});

app.post('/api/orders', (req, res) => {
    try {
        const orders = readOrders();
        orders.push(req.body);
        
        if (writeOrders(orders)) {
            res.json({ success: true, message: 'Order saved successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save order' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to save order' });
    }
});

app.put('/api/orders', (req, res) => {
    try {
        if (writeOrders(req.body)) {
            res.json({ success: true, message: 'Orders updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to update orders' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update orders' });
    }
});

app.delete('/api/orders', (req, res) => {
    try {
        if (writeOrders([])) {
            res.json({ success: true, message: 'Orders cleared successfully' });
        } else {
            res.status(500).json({ error: 'Failed to clear orders' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear orders' });
    }
});

// Serve the website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`BOJO Restaurant server running on http://localhost:${PORT}`);
    console.log('Order sync API available at /api/orders');
});
