import { AuthProvider } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navigation />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
