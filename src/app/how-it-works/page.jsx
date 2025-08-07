'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import LoginModal from '../../components/LoginModal';
import { useAuth } from '../../contexts/AuthContext';

export default function HowItWorksPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = (session) => {
    login(session);
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header partagé */}
      <Header 
        onShowLoginModal={() => setShowLoginModal(true)}
        onShowCreateModal={() => {}} // Pas utilisé sur cette page
      />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header de la page */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
            🔧 How it works?
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Discover the decentralized architecture of Pubky RoadMap and how your data is managed securely and transparently.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            🏠️ Decentralized Architecture
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Frontend (Your Browser)</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Next.js user interface with Tailwind CSS
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Pubky WASM client for direct interaction with your homeserver
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Pubky Ring authentication (QR code + cryptographic signature)
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                  Automatic backup to your personal homeserver
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Backend (Roadky Server)</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Node.js API for aggregation and public display
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Local JSON cache for metadata and votes
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Periodic synchronization with homeservers
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  No storage of sensitive user data
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Authentication Flow */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            🔐 Authentification Pubky Ring
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Scan QR Code</h3>
              <p className="text-gray-300 text-sm">
                Scannez le QR code avec l'app Pubky Ring ou copiez le challenge manuellement
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">2. Signature Cryptographique</h3>
              <p className="text-gray-300 text-sm">
                Votre clé privée Ed25519 signe le challenge de manière sécurisée
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔓</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Vérification & Accès</h3>
              <p className="text-gray-300 text-sm">
                La signature est vérifiée et vous accédez à votre session sécurisée
              </p>
            </div>
          </div>
        </div>

        {/* Data Storage */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            💾 Stockage des Données
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">
                🏠 Votre Homeserver Pubky
              </h3>
              <p className="text-gray-300 mb-3">
                Chaque fonctionnalité que vous créez est sauvegardée sur votre homeserver personnel dans :
              </p>
              <code className="bg-gray-900 text-green-400 px-3 py-1 rounded text-sm">
                /pub/roadky-app/features/[feature-id].json
              </code>
              <ul className="mt-3 space-y-1 text-gray-300 text-sm">
                <li>• Vous gardez le contrôle total de vos données</li>
                <li>• Vous pouvez modifier/supprimer vos fonctionnalités à tout moment</li>
                <li>• Accès direct via le protocole <code className="text-purple-400">pubky://</code></li>
              </ul>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                🌐 Cache Local Roadky
              </h3>
              <p className="text-gray-300 mb-3">
                Le serveur Roadky maintient un cache local pour l'affichage public contenant :
              </p>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Métadonnées des fonctionnalités (titre, description, catégorie)</li>
                <li>• Compteurs de votes et liste des votants</li>
                <li>• Références vers les homeservers d'origine</li>
                <li>• Timestamps de synchronisation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Lifecycle */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            🔄 Cycle de Vie d'une Fonctionnalité
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Création</h3>
                <p className="text-gray-300">
                  Vous créez une fonctionnalité via l'interface. Elle est automatiquement sauvegardée sur votre homeserver Pubky 
                  ET ajoutée au cache local pour l'affichage public.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Vote Communautaire</h3>
                <p className="text-gray-300">
                  Les utilisateurs connectés peuvent voter pour vos fonctionnalités. Les votes sont stockés localement 
                  et les fonctionnalités sont triées par popularité.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Synchronisation</h3>
                <p className="text-gray-300">
                  Si vous modifiez une fonctionnalité sur votre homeserver, elle sera automatiquement synchronisée 
                  lors de la prochaine mise à jour (les votes locaux sont préservés).
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Gestion via Backoffice</h3>
                <p className="text-gray-300">
                  Accédez à votre backoffice personnel pour voir toutes vos fonctionnalités créées, 
                  leurs statistiques de votes et les gérer facilement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            ⚙️ Détails Techniques
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Technologies Utilisées</h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Frontend:</strong> Next.js 14, React, Tailwind CSS</li>
                <li><strong>Backend:</strong> Node.js, API Routes Next.js</li>
                <li><strong>Pubky:</strong> Client WASM, Homeserver Protocol</li>
                <li><strong>Crypto:</strong> Ed25519, SHA-256, BIP39</li>
                <li><strong>Stockage:</strong> JSON local + Homeserver Pubky</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Sécurité & Confidentialité</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Authentification cryptographique forte</li>
                <li>• Pas de mots de passe, uniquement des clés</li>
                <li>• Vos données restent sur votre homeserver</li>
                <li>• Code source ouvert et auditable</li>
                <li>• Protocole décentralisé Pubky</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            🚀 Prêt à contribuer à l'écosystème Pubky ?
          </h2>
          <p className="text-purple-100 mb-6">
            Connectez-vous avec Pubky Ring et proposez vos idées pour faire évoluer le web décentralisé !
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
