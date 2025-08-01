using Microsoft.EntityFrameworkCore;
using ECommerce.API.Data;
using ECommerce.API.Models;
using ECommerce.API.Services.Interfaces;

namespace ECommerce.API.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductService> _logger;

        public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<(IEnumerable<Product> products, int totalItems)> GetProductsAsync(
            int page,
            int pageSize,
            string? search,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            bool? featured = null,
            bool? sale = null,
            string? gender = null) // 🆕 YENİ PARAMETRE
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .Include(p => p.Variants) // 🆕 Variants dahil et
                    .Where(p => p.IsActive);

                // Apply filters
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(search.ToLower()) ||
                        p.Description.ToLower().Contains(search.ToLower()) ||
                        p.Brand.ToLower().Contains(search.ToLower()));
                }

                if (categoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                // 🆕 Gender filtresi
                if (!string.IsNullOrWhiteSpace(gender))
                {
                    query = query.Where(p => p.Gender == gender);
                }

                if (minPrice.HasValue)
                {
                    query = query.Where(p => p.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    query = query.Where(p => p.Price <= maxPrice.Value);
                }

                if (featured.HasValue && featured.Value)
                {
                    query = query.Where(p => p.IsFeatured);
                }

                if (sale.HasValue && sale.Value)
                {
                    query = query.Where(p =>
                        p.DiscountPrice.HasValue &&
                        p.DiscountPrice.Value > 0 &&
                        p.DiscountPrice.Value < p.Price);
                }

                // Apply sorting
                query = sortBy?.ToLower() switch
                {
                    "price" => query.OrderBy(p => p.Price),
                    "price_desc" => query.OrderByDescending(p => p.Price),
                    "newest" => query.OrderByDescending(p => p.CreatedAt),
                    "popular" => query.OrderByDescending(p => p.ViewCount),
                    _ => query.OrderBy(p => p.Name)
                };

                var totalItems = await query.CountAsync();

                var products = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (products, totalItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products");
                throw;
            }
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .Include(p => p.Variants.Where(v => v.IsActive && v.IsAvailable)) // 🆕 Aktif varyantları dahil et
                    .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product by id: {ProductId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count = 8)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Variants.Where(v => v.IsActive && v.IsAvailable))
                    .Where(p => p.IsActive && p.IsFeatured)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting featured products");
                throw;
            }
        }

        // 🆕 YENİ METOTLAR - VARIANT YÖNETİMİ
        public async Task<ProductVariant> CreateProductVariantAsync(ProductVariant variant)
        {
            try
            {
                // 🔧 GÜNCELLENMIŞ - Önce mevcut variant'ı kontrol et (aktif/pasif fark etmez)
                var existingVariant = await _context.ProductVariants
                    .FirstOrDefaultAsync(v => v.ProductId == variant.ProductId && v.Size == variant.Size);

                if (existingVariant != null)
                {
                    // 🆕 YENİ YAKLAŞIM - Mevcut variant'ı güncelle, yeni oluşturma
                    _logger.LogInformation("Updating existing variant: ProductId={ProductId}, Size={Size}",
                        variant.ProductId, variant.Size);

                    existingVariant.SizeDisplay = variant.SizeDisplay;
                    existingVariant.StockQuantity = variant.StockQuantity;
                    existingVariant.PriceModifier = variant.PriceModifier;
                    existingVariant.IsAvailable = variant.IsAvailable;
                    existingVariant.SortOrder = variant.SortOrder;
                    existingVariant.IsActive = true; // 🔧 Aktif yap
                    existingVariant.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    // Ürünün toplam stokunu güncelle
                    await UpdateProductTotalStockAsync(variant.ProductId);

                    _logger.LogInformation("Existing variant updated: ProductId={ProductId}, Size={Size}",
                        variant.ProductId, variant.Size);
                    return existingVariant;
                }

                // 🔧 Yeni variant oluştur
                variant.CreatedAt = DateTime.UtcNow;
                variant.UpdatedAt = DateTime.UtcNow;
                variant.IsActive = true;

                _context.ProductVariants.Add(variant);
                await _context.SaveChangesAsync();

                // Ürünün toplam stokunu güncelle
                await UpdateProductTotalStockAsync(variant.ProductId);

                _logger.LogInformation("New product variant created: ProductId={ProductId}, Size={Size}",
                    variant.ProductId, variant.Size);
                return variant;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating/updating product variant: ProductId={ProductId}, Size={Size}",
                    variant.ProductId, variant.Size);
                throw;
            }
        }

        public async Task<ProductVariant?> UpdateProductVariantAsync(int variantId, ProductVariant variant)
        {
            try
            {
                var existingVariant = await _context.ProductVariants.FindAsync(variantId);
                if (existingVariant == null)
                {
                    return null;
                }

                existingVariant.Size = variant.Size;
                existingVariant.SizeDisplay = variant.SizeDisplay;
                existingVariant.StockQuantity = variant.StockQuantity;
                existingVariant.PriceModifier = variant.PriceModifier;
                existingVariant.IsAvailable = variant.IsAvailable;
                existingVariant.SortOrder = variant.SortOrder;
                existingVariant.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Ürünün toplam stokunu güncelle
                await UpdateProductTotalStockAsync(existingVariant.ProductId);

                _logger.LogInformation("Product variant updated: ID={VariantId}", variantId);
                return existingVariant;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product variant: {VariantId}", variantId);
                throw;
            }
        }

        public async Task<bool> DeleteProductVariantAsync(int variantId)
        {
            try
            {
                var variant = await _context.ProductVariants.FindAsync(variantId);
                if (variant == null)
                {
                    return false;
                }

                // 🔧 HARD DELETE - Tamamen sil (soft delete değil)
                _context.ProductVariants.Remove(variant); // Remove() = HARD DELETE
                await _context.SaveChangesAsync();

                // Ürünün toplam stokunu güncelle
                await UpdateProductTotalStockAsync(variant.ProductId);

                _logger.LogInformation("Product variant HARD deleted: ID={VariantId}", variantId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error hard deleting product variant: {VariantId}", variantId);
                throw;
            }
        }

        public async Task<IEnumerable<ProductVariant>> GetProductVariantsAsync(int productId)
        {
            try
            {
                return await _context.ProductVariants
                    .Where(v => v.ProductId == productId && v.IsActive)
                    .OrderBy(v => v.SortOrder)
                    .ThenBy(v => v.Size)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product variants for product: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> CheckVariantStockAsync(int variantId, int requestedQuantity)
        {
            try
            {
                var variant = await _context.ProductVariants
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.Id == variantId && v.IsActive && v.IsAvailable);

                return variant != null && variant.StockQuantity >= requestedQuantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking variant stock: {VariantId}", variantId);
                throw;
            }
        }

        public async Task<decimal> GetVariantPriceAsync(int variantId)
        {
            try
            {
                var variant = await _context.ProductVariants
                    .Include(v => v.Product)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.Id == variantId);

                if (variant == null) return 0;

                var basePrice = variant.Product?.DiscountPrice ?? variant.Product?.Price ?? 0;
                return basePrice + (variant.PriceModifier ?? 0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting variant price: {VariantId}", variantId);
                throw;
            }
        }

        // 🆕 Ürünün toplam stokunu güncelle (tüm varyantların toplamı)
        private async Task UpdateProductTotalStockAsync(int productId)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null) return;

                if (product.HasSizes)
                {
                    // Varyantları olan ürünler için toplam stok hesapla
                    var totalStock = await _context.ProductVariants
                        .Where(v => v.ProductId == productId && v.IsActive)
                        .SumAsync(v => v.StockQuantity);

                    product.StockQuantity = totalStock;
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product total stock: {ProductId}", productId);
            }
        }

        // Mevcut metotlar devam ediyor... (GetSearchSuggestionsAsync, CreateProductAsync, vs.)
        public async Task<IEnumerable<string>> GetSearchSuggestionsAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return new List<string>();
            }

            try
            {
                return await _context.Products
                    .Where(p => p.IsActive && p.Name.ToLower().Contains(query.ToLower()))
                    .Select(p => p.Name)
                    .Distinct()
                    .Take(10)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting search suggestions for query: {Query}", query);
                throw;
            }
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            try
            {
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;
                product.IsActive = true;

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product created with ID: {ProductId}", product.Id);
                return product;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                throw;
            }
        }

        public async Task<Product?> UpdateProductAsync(int id, Product product)
        {
            try
            {
                var existingProduct = await _context.Products.FindAsync(id);
                if (existingProduct == null)
                {
                    return null;
                }

                // Update properties
                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.DiscountPrice = product.DiscountPrice;
                existingProduct.StockQuantity = product.StockQuantity;
                existingProduct.SKU = product.SKU;
                existingProduct.Brand = product.Brand;
                existingProduct.CategoryId = product.CategoryId;
                existingProduct.IsFeatured = product.IsFeatured;
                existingProduct.Gender = product.Gender; // 🆕
                existingProduct.HasSizes = product.HasSizes; // 🆕
                existingProduct.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product updated with ID: {ProductId}", id);
                return existingProduct;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product with ID: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Variants) // Variant'ları da dahil et
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                {
                    return false;
                }

                // 🔧 SOFT DELETE - Güvenli silme
                _logger.LogInformation("Performing SOFT DELETE for product: {ProductId}", id);

                product.IsActive = false;
                product.UpdatedAt = DateTime.UtcNow;

                // Variant'ları da pasif yap
                if (product.Variants != null)
                {
                    foreach (var variant in product.Variants)
                    {
                        variant.IsActive = false;
                        variant.UpdatedAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product SOFT DELETED: {ProductId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting product: {ProductId}", id);
                throw;
            }
        }

        public async Task<bool> UpdateStockAsync(int productId, int quantity)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                product.StockQuantity = quantity;
                product.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Stock updated for product ID: {ProductId}, New quantity: {Quantity}",
                    productId, quantity);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> CheckStockAvailabilityAsync(int productId, int requestedQuantity)
        {
            try
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == productId && p.IsActive);

                return product != null && product.StockQuantity >= requestedQuantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking stock availability for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold = 10)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.IsActive && p.StockQuantity < threshold)
                    .OrderBy(p => p.StockQuantity)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting low stock products");
                throw;
            }
        }

        public async Task<ProductImage> AddProductImageAsync(int productId, ProductImage image)
        {
            try
            {
                var productExists = await _context.Products
                    .AnyAsync(p => p.Id == productId && p.IsActive);

                if (!productExists)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                image.ProductId = productId;
                image.CreatedAt = DateTime.UtcNow;
                image.UpdatedAt = DateTime.UtcNow;

                _context.ProductImages.Add(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image added for product ID: {ProductId}", productId);
                return image;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding image for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> RemoveProductImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null)
                {
                    return false;
                }

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image removed with ID: {ImageId}", imageId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing image with ID: {ImageId}", imageId);
                throw;
            }
        }

        public async Task<bool> IncrementViewCountAsync(int productId)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    return false;
                }

                product.ViewCount++;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing view count for product ID: {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> SetMainImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null) return false;

                var productImages = await _context.ProductImages
                    .Where(pi => pi.ProductId == image.ProductId)
                    .ToListAsync();

                foreach (var img in productImages)
                {
                    img.IsMainImage = false;
                }

                image.IsMainImage = true;

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteImageAsync(int imageId)
        {
            try
            {
                var image = await _context.ProductImages.FindAsync(imageId);
                if (image == null) return false;

                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", image.ImageUrl.TrimStart('/'));
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<decimal> CalculateDiscountPriceAsync(int productId, decimal discountPercentage)
        {
            try
            {
                var product = await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == productId);

                if (product == null)
                {
                    throw new InvalidOperationException($"Product with ID {productId} not found");
                }

                var discountAmount = product.Price * (discountPercentage / 100);
                return product.Price - discountAmount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating discount price for product ID: {ProductId}", productId);
                throw;
            }
        }
    }
}