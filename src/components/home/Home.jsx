import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, fetchCategories, fetchProductsAction } from '../../store/actions';
import { getImageUrl } from '../../utils/imageUtils';
import { formatPrice } from '../../utils/formatPrice';

const Home = () => {
  const dispatch = useDispatch();
  const { products, categories } = useSelector((state) => state.product);
  const { isLoading } = useSelector((state) => state.errors);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProductsAction('pageNumber=0&pageSize=24'));
    }
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, products, categories]);

  const featuredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.slice(0, 8);
  }, [products]);

  const dealsProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products]
      .sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0))
      .slice(0, 12);
  }, [products]);

  const categoryTiles = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list.slice(0, 8);
  }, [categories]);

  const quickPanels = useMemo(
    () => [
      {
        title: 'Gaming accessories',
        products: (products || []).slice(0, 4),
      },
      {
        title: 'Shop by Category',
        products: (products || []).slice(4, 8),
      },
      {
        title: 'Top deals this week',
        products: (products || []).slice(8, 12),
      },
      {
        title: 'Best sellers in store',
        products: (products || []).slice(12, 16),
      },
    ],
    [products]
  );

  return (
    <div className="bg-[#e3e6e6] min-h-screen">
      <section className="w-full bg-[#131921] text-white text-sm px-4 sm:px-8 lg:px-14 py-2">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-2">
          <p className="truncate">Free delivery on orders above $50 | Daily deals live now</p>
          <Link to="/products" className="whitespace-nowrap underline">Shop deals</Link>
        </div>
      </section>

      <section className="relative w-full h-[320px] sm:h-[380px] lg:h-[440px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=700&fit=crop"
          alt="shopping banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#e3e6e6]" />
      </section>

      <section className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 -mt-56 sm:-mt-48 relative z-10 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickPanels.map((panel, panelIndex) => (
            <div key={panelIndex} className="bg-white p-4 border border-[#ddd] min-h-[360px]">
              <h2 className="text-xl font-bold text-[#0f1111] mb-3">{panel.title}</h2>
              <div className="grid grid-cols-2 gap-2">
                {panel.products.slice(0, 4).map((product, index) => (
                  <Link key={product?.productId ?? `${panelIndex}-${index}`} to="/products" className="block">
                    <div className="bg-[#f7f7f7] border border-[#efefef] p-2 h-[120px] flex items-center justify-center">
                      <img
                        src={getImageUrl(product?.image)}
                        alt={product?.productName || 'product'}
                        className="max-h-[100px] object-contain"
                      />
                    </div>
                    <p className="text-xs text-[#0f1111] mt-1 leading-snug">
                      {product?.productName || 'Product'}
                    </p>
                  </Link>
                ))}
              </div>
              <Link to="/products" className="inline-block mt-4 text-sm text-[#007185] hover:underline">
                See more
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white border border-[#ddd] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-2xl font-bold text-[#0f1111]">Shop by category</h2>
            <Link
              to="/products"
              className="text-[#007185] hover:underline"
            >
              View all products
            </Link>
          </div>
          {categoryTiles.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categoryTiles.map((category) => (
                <Link
                  key={category?.categoryId ?? category?.categoryName}
                  to={`/products?category=${encodeURIComponent(category?.categoryName || '')}`}
                  className="border border-[#e6e6e6] p-3 bg-[#fafafa] hover:bg-white transition-colors"
                >
                  <p className="text-sm font-medium text-[#0f1111] line-clamp-2 min-h-10">
                    {category?.categoryName || 'Category'}
                  </p>
                  <p className="text-xs text-[#565959] mt-2">Browse category</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-600">
              {isLoading ? 'Loading categories...' : 'No categories available yet.'}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white border border-[#ddd] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-2xl font-bold text-[#0f1111]">Deals inspired by your browsing history</h2>
            <Link to="/products" className="text-[#007185] hover:underline">See all deals</Link>
          </div>
          {dealsProducts.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dealsProducts.map((product) => {
                const basePrice = Number(product?.price ?? 0);
                const currentPrice = Number(product?.specialPrice ?? product?.price ?? 0);
                const discount = Number(product?.discount ?? 0);

                return (
                  <div key={product?.productId} className="border border-[#efefef] p-3 bg-white">
                    <Link to="/products" className="block">
                      <div className="h-[140px] bg-[#f7f7f7] flex items-center justify-center">
                        <img src={getImageUrl(product?.image)} alt={product?.productName || 'product'} className="max-h-[120px] object-contain" />
                      </div>
                      <p className="text-sm text-[#0f1111] mt-2 line-clamp-2 min-h-10">{product?.productName}</p>
                    </Link>
                    <div className="mt-2">
                      <p className="text-[#B12704] font-bold">{formatPrice(currentPrice)}</p>
                      {basePrice > currentPrice && <p className="text-xs text-[#565959] line-through">{formatPrice(basePrice)}</p>}
                      {discount > 0 && <p className="text-xs font-semibold text-[#B12704]">Up to {discount}% off</p>}
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-sm font-medium py-2 rounded-full disabled:opacity-60"
                      onClick={() => dispatch(addToCart(product, 1))}
                      disabled={!product?.quantity || Number(product.quantity) <= 0}
                    >
                      {!product?.quantity || Number(product.quantity) <= 0 ? 'Out of stock' : 'Add to cart'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-600">{isLoading ? 'Loading products...' : 'No deals available yet.'}</div>
          )}
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white border border-[#ddd] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-2xl font-bold text-[#0f1111]">Top picks for you</h2>
            <Link to="/products" className="text-[#007185] hover:underline">Discover more</Link>
          </div>
          {featuredProducts.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <div key={product?.productId} className="border border-[#efefef] p-3">
                  <Link to="/products" className="block">
                    <div className="h-[180px] bg-[#f7f7f7] flex items-center justify-center">
                      <img src={getImageUrl(product?.image)} alt={product?.productName || 'product'} className="max-h-[150px] object-contain" />
                    </div>
                    <p className="mt-3 text-sm text-[#0f1111] line-clamp-2 min-h-10">{product?.productName}</p>
                    <p className="mt-2 text-lg font-bold text-[#0f1111]">{formatPrice(product?.specialPrice ?? product?.price ?? 0)}</p>
                  </Link>
                  <button
                    type="button"
                    className="mt-3 w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-sm font-medium py-2 rounded-full disabled:opacity-60"
                    onClick={() => dispatch(addToCart(product, 1))}
                    disabled={!product?.quantity || Number(product.quantity) <= 0}
                  >
                    {!product?.quantity || Number(product.quantity) <= 0 ? 'Out of stock' : 'Add to cart'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-600">{isLoading ? 'Loading products...' : 'No products available yet.'}</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
