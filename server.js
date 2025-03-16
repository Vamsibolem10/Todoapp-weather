// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // For API calls

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (Local)
mongoose.connect('mongodb://localhost:27017/todoapp')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Item Model
const Item = mongoose.model('Item', new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }, // Added 'completed' field
    createdAt: { type: Date, default: Date.now } // Added timestamp
}));

// CRUD Routes

// Get All Items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 }); // Sort by latest
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: '❌ Server Error', error });
    }
});

// Create a New Item
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: '❌ Item Creation Failed', error });
    }
});

// Update an Item by ID
app.put('/api/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: '❌ Item Not Found' });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: '❌ Item Update Failed', error });
    }
});

// Toggle Item Completion Status by ID
app.patch('/api/items/:id/toggle', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: '❌ Item Not Found' });

        item.completed = !item.completed; // Toggle 'completed' field
        await item.save();

        res.json(item);
    } catch (error) {
        res.status(400).json({ message: '❌ Item Toggle Failed', error });
    }
});

// Delete an Item by ID
app.delete('/api/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: '❌ Item Not Found' });
        res.json({ message: '✅ Item Deleted Successfully', deletedItem });
    } catch (error) {
        res.status(500).json({ message: '❌ Item Deletion Failed', error });
    }
});

// Weather Route: Fetch Weather from OpenWeatherMap
app.get('/api/weather/:city', async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = '41c3c373d04e93a653d2ebb4f7b46c70'; // OpenWeatherMap API key
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        const response = await axios.get(weatherURL);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Weather API Error:', error.message);
        res.status(500).json({ message: '❌ Failed to fetch weather data', error: error.message });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
