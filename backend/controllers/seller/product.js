var { Product, ProductCategory } = require("../../models/product");
var { Shop } = require("../../models/shop");

// Create Product
async function createProduct(req, res, next) {
  try {
    const { name, price, description } = req.body;
    const shopID = req.query.shopID;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "name and price are required" });
    }

    if (!shopID) {
      return res.status(400).json({ success: false, message: "shopID is required" });
    }

    const shop = await Shop.findById(shopID);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const newProduct = new Product({
      name,
      price: parseFloat(price),
      description,
      shop: shopID,
    });
    await newProduct.save();

    const productID = newProduct._id;

    // Add product to shop
    await Shop.findByIdAndUpdate(shopID, {
      $push: { products: productID },
    });

    // Add categories (safely - categories may not be provided)
    if (req.body.categories) {
      const categoryMatches = req.body.categories.match(/\w+/g);
      if (categoryMatches && categoryMatches.length > 0) {
        for (let i = 0; i < categoryMatches.length; i++) {
          const categoryID = categoryMatches[i];
          await addProductCategory(productID, categoryID);
        }
      }
    }

    // Add images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const image = req.files[i];
        const pathMatch = /(\/uploads)(.+)/g.exec(image.path);
        if (pathMatch) {
          await addProductImage(productID, pathMatch[0]);
        }
      }
    }

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    next(err);
  }
}

// Show Product
async function showProduct(req, res, next) {
  try {
    if (!req.query.productID) {
      return res.status(400).json({ success: false, message: "productID is required" });
    }
    const product = await Product.findById(req.query.productID).populate("categories", "name");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// Update Product
async function updateProduct(req, res, next) {
  try {
    if (!req.query.productID) {
      return res.status(400).json({ success: false, message: "productID is required" });
    }

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
    if (req.body.description !== undefined) updateData.description = req.body.description;

    // Use { new: true } so we get the updated document back
    const updatedProduct = await Product.findByIdAndUpdate(
      req.query.productID,
      updateData,
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (req.body.categories) {
      // Remove old categories
      const oldCategories = updatedProduct.categories || [];
      for (let i = 0; i < oldCategories.length; i++) {
        const categoryID = oldCategories[i]._id || oldCategories[i];
        await removeProductCategory(req.query.productID, categoryID);
      }

      // Add new categories
      const newCategoryMatches = req.body.categories.match(/\w+/g);
      if (newCategoryMatches) {
        for (let i = 0; i < newCategoryMatches.length; i++) {
          const categoryID = newCategoryMatches[i];
          await addProductCategory(req.query.productID, categoryID);
        }
      }
    }

    // Update images
    if (req.files && req.files.length > 0) {
      // Remove product images
      await removeProductImages(req.query.productID);

      // Add product images
      for (let i = 0; i < req.files.length; i++) {
        const image = req.files[i];
        const pathMatch = /(\/uploads)(.+)/g.exec(image.path);
        if (pathMatch) {
          await addProductImage(req.query.productID, pathMatch[0]);
        }
      }
    }

    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    next(err);
  }
}

// Delete Product
async function deleteProduct(req, res, next) {
  try {
    if (!req.query.productID) {
      return res.status(400).json({ success: false, message: "productID is required" });
    }

    const deletedProduct = await Product.findByIdAndDelete(req.query.productID);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Remove product from shop
    if (deletedProduct.shop) {
      await Shop.findByIdAndUpdate(deletedProduct.shop, {
        $pull: { products: deletedProduct._id },
      });
    }

    // Remove product from categories
    if (deletedProduct.categories && deletedProduct.categories.length > 0) {
      for (let i = 0; i < deletedProduct.categories.length; i++) {
        const categoryID = deletedProduct.categories[i];
        await ProductCategory.findByIdAndUpdate(categoryID, {
          $pull: { products: req.query.productID },
        });
      }
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// Add product category
async function addProductCategory(productID, categoryID) {
  await Product.findByIdAndUpdate(productID, {
    $addToSet: { categories: categoryID },
  });

  await ProductCategory.findByIdAndUpdate(categoryID, {
    $addToSet: { products: productID },
  });
}

// Remove product category
async function removeProductCategory(productID, categoryID) {
  await Product.findByIdAndUpdate(productID, {
    $pull: { categories: categoryID },
  });

  await ProductCategory.findByIdAndUpdate(categoryID, {
    $pull: { products: productID },
  });
}

// Add product image
async function addProductImage(productID, imagePath) {
  await Product.findByIdAndUpdate(productID, { $push: { images: imagePath } });
}

// Remove product images
async function removeProductImages(productID) {
  await Product.findByIdAndUpdate(productID, { images: [] });
}

module.exports = {
  createProduct,
  showProduct,
  updateProduct,
  deleteProduct,
};
