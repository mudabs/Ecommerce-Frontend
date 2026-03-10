const About = () => {
  return (
    <div className="about-page min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re passionate about bringing you the best products at the best prices
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Founded in 2020, our e-commerce platform has been dedicated to providing
            customers with high-quality products and exceptional service. We believe
            in making online shopping easy, convenient, and enjoyable for everyone.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our team works tirelessly to curate the best selection of products,
            ensuring that every item meets our high standards of quality and value.
            We&apos;re committed to your satisfaction and strive to exceed your expectations
            with every purchase.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To provide quality products and exceptional customer service that
              exceeds expectations
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-5xl mb-4">👁️</div>
            <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To be the most trusted and customer-centric e-commerce platform
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-5xl mb-4">💎</div>
            <h3 className="text-2xl font-bold mb-3">Our Values</h3>
            <p className="text-gray-600">
              Quality, integrity, customer satisfaction, and continuous improvement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
