import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroBanner = () => {
  const slides = [
    {
      id: 1,
      title: 'Summer Collection 2026',
      subtitle: 'Discover the latest trends',
      description: 'Get up to 50% off on selected items',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
      buttonText: 'Shop Now',
      buttonLink: '/products'
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Fresh styles for you',
      description: 'Check out our newest products',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=600&fit=crop',
      buttonText: 'Explore',
      buttonLink: '/products'
    },
    {
      id: 3,
      title: 'Exclusive Deals',
      subtitle: 'Limited time offers',
      description: 'Dont miss out on amazing savings',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop',
      buttonText: 'View Deals',
      buttonLink: '/products'
    }
  ];

  return (
    <div className="hero-banner w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        loop={true}
        className="h-screen md:h-screen lg:h-screen"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl mx-auto text-white">
                  <h2 className="text-xl md:text-2xl font-light mb-2 animate-fade-in">
                    {slide.subtitle}
                  </h2>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in-up">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 animate-fade-in-delay">
                    {slide.description}
                  </p>
                  <a
                    href={slide.buttonLink}
                    className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 animate-fade-in-delay"
                  >
                    {slide.buttonText}
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-in;
        }

        .animate-fade-in-delay {
          animation: fadeIn 1s ease-in 0.3s both;
        }
      `}</style>
    </div>
  );
};

export default HeroBanner;
