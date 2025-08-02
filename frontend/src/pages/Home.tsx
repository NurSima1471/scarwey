import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { fetchFeaturedProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/product/ProductCard';
import * as Icons from 'react-icons/fi';
import WhatsAppFloat from '../components/common/WhatsAppFloat';

const FiArrowRight = Icons.FiArrowRight as any;
const FiTruck = Icons.FiTruck as any;
const FiShield = Icons.FiShield as any;
const FiRefreshCw = Icons.FiRefreshCw as any;
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiChevronRight = Icons.FiChevronRight as any;
const FiPercent = Icons.FiPercent as any;
const FiClock = Icons.FiClock as any;
const FiMessageCircle = Icons.FiMessageCircle as any;

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { featuredProducts, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const { categories, isLoading: categoriesLoading } = useSelector((state: RootState) => state.categories);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      title: "Yaz İndirimleri Başladı!",
      subtitle: "Seçili ürünlerde %70'e varan indirimler",
      description: "Bu fırsat kaçmaz! Binlerce üründe mega indirimler sizi bekliyor.",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop",
      cta: "İndirimleri Keşfet",
      link: "/products?sale=true",
      badge: "YENI",
      gradient: "from-orange-500 to-red-600"
    },
    {
      id: 2,
      title: "Teknoloji Tutkunları İçin",
      subtitle: "En yeni teknolojik ürünler burada",
      description: "iPhone, Samsung, laptop ve daha fazlası için özel fırsatlar.",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop",
      cta: "Teknoloji Ürünleri",
      link: "/products?categoryId=1",
      badge: "POPÜLER",
      gradient: "from-blue-600 to-purple-700"
    },
    {
      id: 3,
      title: "Moda Trendleri",
      subtitle: "2024'ün en trend parçaları",
      description: "Kadın, erkek ve çocuk giyiminde şık seçenekler.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      cta: "Moda Ürünleri",
      link: "/products?categoryId=2",
      badge: "TREND",
      gradient: "from-pink-500 to-purple-600"
    }
  ];

  // Flash deals data
  const flashDeals = [
    { 
      id: 1, 
      name: "Premium Kulaklık", 
      originalPrice: 299, 
      salePrice: 199, 
      discount: 33, 
      timeLeft: "2s 14d 6s", 
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      stock: 15
    },
    { 
      id: 2, 
      name: "Akıllı Saat", 
      originalPrice: 1299, 
      salePrice: 899, 
      discount: 31, 
      timeLeft: "2s 14d 6s", 
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      stock: 8
    },
    { 
      id: 3, 
      name: "Bluetooth Speaker", 
      originalPrice: 199, 
      salePrice: 99, 
      discount: 50, 
      timeLeft: "2s 14d 6s", 
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
      stock: 23
    },
    { 
      id: 4, 
      name: "Gaming Mouse", 
      originalPrice: 149, 
      salePrice: 89, 
      discount: 40, 
      timeLeft: "2s 14d 6s", 
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
      stock: 5
    }
  ];

  // WhatsApp iletişim fonksiyonu
  const handleWhatsAppClick = (message = 'Merhaba! Scarwey hakkında bilgi almak istiyorum.') => {
    const phoneNumber = '905419407534';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    try {
      dispatch(fetchFeaturedProducts());
      dispatch(fetchCategories());
    } catch (error) {
      console.error('API Error:', error);
    }
  }, [dispatch]);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Hero Section with Carousel */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <span className="inline-block bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full mb-4 font-medium backdrop-blur-sm">
                    {slide.badge}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-3xl font-light mb-4 opacity-90">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg mb-8 opacity-80 max-w-lg">
                    {slide.description}
                  </p>
                  <Link
                    to={slide.link}
                    className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-lg"
                  >
                    {slide.cta}
                    <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition z-10"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-30 transition z-10"
        >
          <FiChevronRight size={24} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      

      {/* 3. Featured Products Section - DOĞRU YERİNE TAŞINDI */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Öne Çıkan Ürünler</h2>
            <Link
              to="/products?featured=true"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              Tümünü Gör <FiArrowRight className="ml-1" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Henüz öne çıkan ürün bulunmuyor.</p>
              <Link to="/products" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
                Tüm ürünleri görüntüle
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. Flash Deals */}
      <section className="py-16 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <FiPercent className="text-yellow-300" />
              Flaş Fırsatlar
            </h2>
            <p className="text-white text-lg opacity-90">Sınırlı süre! Kaçırma!</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition duration-300">
                <div className="relative mb-4">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                    -%{deal.discount}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{deal.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold text-red-500">₺{deal.salePrice}</span>
                  <span className="text-gray-400 line-through">₺{deal.originalPrice}</span>
                </div>
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-600 mb-1 flex items-center justify-center gap-1">
                    <FiClock size={12} />
                    Kalan Süre:
                  </div>
                  <div className="text-lg font-mono font-bold text-red-500">{deal.timeLeft}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-2">
                    Sadece {deal.stock} adet kaldı!
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(10, (deal.stock / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Kategoriler</h2>
            <p className="text-gray-600 text-lg">İhtiyacınız olan her şey burada</p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category, index) => {
                // Kategori adına göre emoji ve renk belirleme
                const getCategoryStyle = (name: string, index: number) => {
                  const categoryMappings: { [key: string]: { emoji: string; color: string } } = {
                    'elektronik': { emoji: '📱', color: 'bg-blue-500' },
                    'telefon': { emoji: '📱', color: 'bg-blue-500' },
                    'bilgisayar': { emoji: '💻', color: 'bg-gray-600' },
                    'laptop': { emoji: '💻', color: 'bg-gray-600' },
                    'moda': { emoji: '👗', color: 'bg-pink-500' },
                    'giyim': { emoji: '👕', color: 'bg-pink-500' },
                    'kadın': { emoji: '👗', color: 'bg-pink-500' },
                    'erkek': { emoji: '👔', color: 'bg-blue-600' },
                    'çocuk': { emoji: '🧸', color: 'bg-yellow-500' },
                    'ev': { emoji: '🏠', color: 'bg-green-500' },
                    'yaşam': { emoji: '🏠', color: 'bg-green-500' },
                    'spor': { emoji: '⚽', color: 'bg-orange-500' },
                    'fitness': { emoji: '💪', color: 'bg-orange-500' },
                    'kitap': { emoji: '📚', color: 'bg-purple-500' },
                    'oyuncak': { emoji: '🧸', color: 'bg-yellow-500' },
                    'oyun': { emoji: '🎮', color: 'bg-red-500' },
                    'mutfak': { emoji: '🍳', color: 'bg-green-600' },
                    'banyo': { emoji: '🛁', color: 'bg-blue-400' },
                    'bahçe': { emoji: '🌱', color: 'bg-green-400' },
                    'otomotiv': { emoji: '🚗', color: 'bg-gray-700' },
                    'aksesuar': { emoji: '💍', color: 'bg-purple-400' },
                    'saat': { emoji: '⌚', color: 'bg-black' },
                    'ayakkabı': { emoji: '👟', color: 'bg-brown-500' },
                    'çanta': { emoji: '👜', color: 'bg-brown-600' },
                    'kozmetik': { emoji: '💄', color: 'bg-pink-400' },
                    'sağlık': { emoji: '🏥', color: 'bg-red-400' }
                  };

                  const lowerName = name.toLowerCase();
                  
                  // Önce tam eşleşme ara
                  for (const [key, value] of Object.entries(categoryMappings)) {
                    if (lowerName.includes(key)) {
                      return value;
                    }
                  }

                  // Fallback renkler
                  const fallbackColors = [
                    'bg-blue-500', 'bg-pink-500', 'bg-green-500', 
                    'bg-orange-500', 'bg-purple-500', 'bg-yellow-500',
                    'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
                  ];
                  
                  return {
                    emoji: '🏷️',
                    color: fallbackColors[index % fallbackColors.length]
                  };
                };

                const { emoji, color } = getCategoryStyle(category.name, index);

                return (
                  <Link
                    key={category.id}
                    to={`/products?categoryId=${category.id}`}
                    className="group"
                  >
                    <div className={`${color} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 text-center transform hover:scale-105 hover:rotate-1`}>
                      <div className="text-4xl mb-3">{emoji}</div>
                      <h3 className="font-semibold text-gray-900 text-sm drop-shadow-sm">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">Kategoriler yükleniyor...</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Customer Benefits */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Müşteri Memnuniyeti Önceliğimiz</h2>
            <p className="text-gray-600">Size en iyi alışveriş deneyimini sunmak için çalışıyoruz</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[
              { title: 'Ücretsiz Kargo', subtitle: '100₺ üzeri', icon: '🚚', color: 'bg-green-100', textColor: 'text-green-600' },
              { title: 'Hızlı Teslimat', subtitle: '1-3 gün içinde', icon: '⚡', color: 'bg-yellow-100', textColor: 'text-yellow-600' },
              { title: 'Kapıda Ödeme', subtitle: 'Güvenli teslimat', icon: '💰', color: 'bg-green-100', textColor: 'text-green-600' },
              { title: 'Kolay İade', subtitle: '14 gün', icon: '↩', color: 'bg-purple-100', textColor: 'text-purple-600' },
              { title: 'WhatsApp Destek', subtitle: 'Anında yanıt', icon: '💬', color: 'bg-green-100', textColor: 'text-green-600' },
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="text-center group cursor-pointer"
                onClick={() => {
                  if (benefit.title === 'WhatsApp Destek') {
                    handleWhatsAppClick();
                  }
                }}
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                  <span className="text-xl md:text-2xl">{benefit.icon}</span>
                </div>
                <h3 className={`font-bold text-xs md:text-sm ${benefit.textColor} mb-1`}>
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {benefit.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Features Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Neden Bizi Seçmelisiniz?</h2>
            <p className="text-purple-100 text-lg">Size en iyi alışveriş deneyimini sunuyoruz</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 group">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all transform group-hover:scale-110">
                <FiTruck className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hızlı Teslimat</h3>
              <p className="text-purple-100">Siparişleriniz 1-3 iş günü içinde kapınızda</p>
            </div>
            
            <div className="text-center p-6 group">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all transform group-hover:scale-110">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Kapıda Ödeme</h3>
              <p className="text-purple-100">Güvenli teslimat ile kapınızda ödeme imkanı</p>
            </div>
            
            <div className="text-center p-6 group">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all transform group-hover:scale-110">
                <FiRefreshCw className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kolay İade</h3>
              <p className="text-purple-100">14 gün içinde koşulsuz iade garantisi</p>
            </div>
            
            <div 
              className="text-center p-6 group cursor-pointer"
              onClick={() => handleWhatsAppClick('Merhaba! 7/24 destek almak istiyorum.')}
            >
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all transform group-hover:scale-110">
                <FiMessageCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold mb-3">WhatsApp Destek</h3>
              <p className="text-purple-100">Anında WhatsApp ile iletişime geçin</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer CTA */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Hemen alışverişe başlayın! 🛍
          </h3>
          <Link
            to="/products"
            className="inline-flex items-center bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300"
          >
            Ürünleri Keşfet
            <FiArrowRight className="ml-2" /> 
          </Link>
        </div>
      </section>

      <WhatsAppFloat />
    </div>
  );
};

export default Home;