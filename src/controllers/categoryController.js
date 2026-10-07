import Category from '../models/catgory.js';
import Restaurant from '../models/restaurant.js';

// 1. POST /api/restaurants/:restaurantId/categories
export const createCategory = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { name, description, image,sortOrder } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }

        // Verification: Restaurant exists or not
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found." });
        }

        // Duplicate category check for the same restaurant
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            restaurant: restaurantId
        });

        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category name already exists in this restaurant." });
        }

        const category = await Category.create({
            name,
            image,
            description,
            sortOrder: sortOrder ?? 0,
            restaurant: restaurantId
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully!",
            data: category
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. GET /api/restaurants/:restaurantId/categories
export const getCategoriesByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const filter = { restaurant: restaurantId };

        // Agar public/customer browser request hai toh sirf active categories show hongi
        if (!req.user || req.user.role === 'CUSTOMER') {
            filter.isActive = true;
        }

        const categories = await Category.find(filter).sort({ sortOrder: 1, createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. GET /api/categories/:categoryId
export const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId).populate('restaurant', 'name isActive');
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        return res.status(200).json({ success: true, data: category });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. PATCH /api/categories/:categoryId
export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully!",
            data: updatedCategory
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. DELETE /api/categories/:categoryId
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        await Category.findByIdAndDelete(categoryId);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully!"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};