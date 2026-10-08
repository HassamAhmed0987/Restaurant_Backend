import MenuItem from '../models/menuItem.js';
import Category from '../models/catgory.js';
import Restaurant from '../models/restaurant.js';

// 1. Create Menu Item
export const createMenuItem = async (req, res) => {
    try {
        const { restaurant, category, name, description, price, discountPrice, image, ingredients, isAvailable, preparationTime } = req.body;

        // Basic Validation
        if (!restaurant || !category || !name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Restaurant, Category, Name, and Price are required."
            });
        }

        // Verify Restaurant Exists
        const restaurantExists = await Restaurant.findById(restaurant);
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            });
        }

        // Verify Category Exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        const menuItem = await MenuItem.create({
            restaurant,
            category,
            name,
            description,
            price,
            discountPrice,
            image,
            ingredients,
            isAvailable,
            preparationTime
        });

        return res.status(201).json({
            success: true,
            message: "Menu Item created successfully!",
            data: menuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get All Menu Items (Filter by Restaurant / Category optional)
export const getAllMenuItems = async (req, res) => {
    try {
        const { restaurantId, categoryId } = req.query;

        // Dynamic Filter
        const filter = {};
        if (restaurantId) filter.restaurant = restaurantId;
        if (categoryId) filter.category = categoryId;

        const menuItems = await MenuItem.find(filter)
            .populate('category', 'name')
            .populate('restaurant', 'name');

        return res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get Menu Item By ID
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findById(id)
            .populate('category', 'name')
            .populate('restaurant', 'name');

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu Item not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Update Menu Item
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu Item not found."
            });
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Menu Item updated successfully!",
            data: updatedItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Delete Menu Item
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu Item not found."
            });
        }

        await MenuItem.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Menu Item deleted successfully!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};