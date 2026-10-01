const express = require("express");
const router = express.Router();

const Item = require("../models/Item");

// GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching items"
    });
  }
});

// POST a new item
router.post("/", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();

    res.json(savedItem);
  } catch (error) {
    res.status(500).json({
      message: "Error saving item"
    });
  }
});

// DELETE an item
router.delete("/:id", async (req, res) => {
  try {
    console.log("Delete request received for ID:", req.params.id);

    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      console.log("Item not found");
      return res.status(404).json({
        message: "Item not found"
      });
    }

    console.log("Deleted:", deletedItem);

    res.json({
      message: "Item deleted successfully",
      item: deletedItem
    });
  } catch (error) {
    console.log("Delete error:", error);

    res.status(500).json({
      message: "Error deleting item"
    });
  }
});

module.exports = router;