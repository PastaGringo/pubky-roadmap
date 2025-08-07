'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import LoginModal from '../../components/LoginModal';
import CreateFeatureModal from '../../components/CreateFeatureModal';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const statusColors = {
  idea: 'bg-gray-100 text-gray-800',
  discussion: 'bg-blue-100 text-blue-800',
  planned: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600'
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalFeatures: 0,
    totalVotes: 0,
    inProgress: 0,
    completed: 0
  });

  // Redirection si non connecté
  useEffect(() => {
    if (!user?.pubkey) {
      router.push('/');
      return;
    }
    loadMyFeatures();
  }, [user, refreshTrigger]);

  // Charger les features de l'utilisateur (même logique que FeatureList mais filtrée)
  const loadMyFeatures = async () => {
    if (!user?.pubkey) return;

    try {
      setLoading(true);
      const response = await fetch('/api/features');
      const result = await response.json();

      if (result.success) {
        // Filtrer seulement les features de l'utilisateur connecté
        const myFeatures = result.features.filter(f => f.author_pubkey === user.pubkey);
        
        // Trier par votes décroissants, puis par date
        myFeatures.sort((a, b) => {
          if (b.votes !== a.votes) {
            return b.votes - a.votes;
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        setFeatures(myFeatures);
        setError(null);
        
        // Calculer les statistiques
        const newStats = {
          totalFeatures: myFeatures.length,
          totalVotes: myFeatures.reduce((sum, f) => sum + (f.votes || 0), 0),
          inProgress: myFeatures.filter(f => f.status === 'in-progress').length,
          completed: myFeatures.filter(f => f.status === 'completed').length
        };
        setStats(newStats);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading features:', err);
      setError('Error loading features');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (featureId) => {
    if (!confirm('Are you sure you want to delete this feature? This action cannot be undone.')) {
      return;
    }

    try {
      // Supprimer du homeserver Pubky (utiliser PubkyService)
      const { PubkyService } = await import('../../services/pubkyService');
      const pubkyResult = await PubkyService.deleteFeatureFromPubky(user.pubkey, featureId);
      
      if (!pubkyResult.success) {
        console.warn('Failed to delete from homeserver:', pubkyResult.error);
        // Continue quand même pour supprimer du cache local
      }

      // Supprimer du cache local
      const localResponse = await fetch(`/api/features/${featureId}`, {
        method: 'DELETE'
      });

      if (localResponse.ok) {
        // Recharger la liste
        setRefreshTrigger(prev => prev + 1);
        alert('✅ Feature deleted successfully!');
      } else {
        throw new Error('Failed to delete from local cache');
      }
      
    } catch (err) {
      console.error('Error deleting feature:', err);
      alert('❌ Failed to delete feature: ' + err.message);
    }
  };

  const handleEdit = (featureId) => {
    router.push(`/admin/edit/${featureId}`);
  };

  const handleFeatureCreated = (feature) => {
    // Déclencher le rafraîchissement de la liste
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user?.pubkey) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Global */}
      <Header 
        onShowLoginModal={() => setShowLoginModal(true)}
        onShowCreateModal={() => setShowCreateModal(true)}
      />
      
      {/* Modal de connexion */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      
      {/* Modal de création de fonctionnalité */}
      {showCreateModal && (
        <CreateFeatureModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onFeatureCreated={handleFeatureCreated}
        />
      )}
      
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              My Features
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Manage your Pubky ecosystem feature proposals
          </p>
          
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalFeatures}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Features Created</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVotes}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Votes</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">In Progress</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Features */}
      <section className="py-16 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Your Feature Proposals
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              ➕ New Feature
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-slate-600 dark:text-slate-300">Loading your features...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">❌ {error}</p>
              <button
                onClick={loadMyFeatures}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : features.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300 text-lg">No features found</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-4">
                You haven't created any features yet.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Create Your First Feature
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {features.map((feature) => (
                <FeatureCard 
                  key={feature.id} 
                  feature={feature} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-6 mb-4">
              <a 
                href="https://pubky.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                pubky.org
              </a>
              <a 
                href="https://pubky.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                pubky.app
              </a>
              <a 
                href="/how-it-works" 
                className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
              >
                How it works
              </a>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © 2024 Pubky RoadMap. Decentralized feature voting for the Pubky ecosystem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Composant pour afficher une feature (même style que FeatureList)
function FeatureCard({ feature, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-purple-500/50 transition-all">
      <div className="p-6">
        {/* Header avec titre et badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[feature.status] || statusColors.idea}`}>
                {feature.status.charAt(0).toUpperCase() + feature.status.slice(1).replace('-', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[feature.priority] || priorityColors.medium}`}>
                {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {feature.category.charAt(0).toUpperCase() + feature.category.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>
          
          {/* Votes */}
          <div className="text-center ml-4">
            <div className="text-2xl font-bold text-purple-600">
              {feature.votes || 0}
            </div>
            <div className="text-sm text-slate-500">
              vote{(feature.votes || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
          {feature.description}
        </p>

        {/* Métadonnées */}
        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
          <div>
            Created {new Date(feature.created_at).toLocaleDateString('en-US')}
            {feature.updated_at !== feature.created_at && (
              <span> • Updated {new Date(feature.updated_at).toLocaleDateString('en-US')}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(feature.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(feature.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
          
          <div className="text-xs text-slate-400">
            Sync: {new Date(feature.last_sync).toLocaleString('en-US')}
          </div>
        </div>
      </div>
    </div>
  );
}
