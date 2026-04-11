import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

// Simple test component to verify routing works
const RouteTest = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const testRoutes = [
        '/profile',
        '/profile/orders',
        '/profile/account',
        '/',
        '/products'
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>🧪 Route Testing Component</h2>
            <p><strong>Current Location:</strong> {location.pathname}</p>
            
            <h3>Test Navigation:</h3>
            {testRoutes.map(route => (
                <button
                    key={route}
                    onClick={() => navigate(route)}
                    style={{
                        display: 'block',
                        margin: '10px 0',
                        padding: '10px 20px',
                        backgroundColor: location.pathname === route ? '#28a745' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Navigate to: {route}
                </button>
            ))}
            
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h4>✅ Route Fix Summary:</h4>
                <ul>
                    <li>Fixed nested route structure in App.jsx</li>
                    <li>Separated /profile routes from conflicting root path</li>
                    <li>Updated ProfileLayout redirect logic</li>
                    <li>Maintained proper authentication protection</li>
                </ul>
                
                <h4>🔗 Expected Working URLs:</h4>
                <ul>
                    <li><code>{`${currentOrigin}/profile/orders`}</code> - User Orders Page</li>
                    <li><code>{`${currentOrigin}/profile/account`}</code> - Account Info Page</li>
                    <li><code>{`${currentOrigin}/profile`}</code> - Redirects to orders</li>
                </ul>
            </div>
        </div>
    );
};

export default RouteTest;
