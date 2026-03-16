import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <Head>
          <title>Real-Time Chat</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen animated-bg text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Component {...pageProps} />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default MyApp;
