'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

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

// Composant pour afficher l'avatar de l'auteur avec lien vers son profil
const AuthorAvatar = ({ authorPubkey }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthorAvatar = async () => {
      if (!authorPubkey) {
        setLoading(false);
        return;
      }

      try {
        const avatarEndpoint = `https://nexus.pubky.app/static/avatar/${authorPubkey}`;
        const response = await fetch(avatarEndpoint);
        
        if (response.ok) {
          setAvatarUrl(avatarEndpoint);
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error(`Error loading author avatar for ${authorPubkey}:`, error);
        setAvatarUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadAuthorAvatar();
  }, [authorPubkey]);

  const profileUrl = `https://pubky.app/profile/${authorPubkey}`;

  return (
    <a 
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:text-purple-400 transition-colors duration-200 group"
      title={`View ${authorPubkey.slice(0, 12)}...${authorPubkey.slice(-12)} profile on Pubky`}
    >
      <span className="text-gray-400">By</span>
      <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden border border-slate-600 group-hover:border-purple-400 transition-all duration-200">
        {loading ? (
          <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>
        ) : avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={`Author avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector('.fallback-icon');
                if (fallback) fallback.style.display = 'block';
              }
            }}
          />
        ) : null}
        <User 
          className={`w-3 h-3 text-slate-400 fallback-icon ${
            avatarUrl && !loading ? 'hidden' : 'block'
          }`} 
        />
      </div>
      <span className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">
        {authorPubkey.slice(0, 8)}...{authorPubkey.slice(-8)}
      </span>
    </a>
  );
};

// Composant pour afficher les avatars des votants
const VotersAvatars = ({ voters = [] }) => {
  const [avatarUrls, setAvatarUrls] = useState({});
  const [loadingAvatars, setLoadingAvatars] = useState({});

  useEffect(() => {
    const loadAvatars = async () => {
      if (!voters || voters.length === 0) return;

      const newAvatarUrls = {};
      const newLoadingAvatars = {};

      // Initialize loading state
      voters.forEach(pubkey => {
        newLoadingAvatars[pubkey] = true;
      });
      setLoadingAvatars(newLoadingAvatars);

      // Load each avatar
      await Promise.all(
        voters.map(async (pubkey) => {
          try {
            const avatarUrl = `https://nexus.pubky.app/static/avatar/${pubkey}`;
            const response = await fetch(avatarUrl);
            
            if (response.ok) {
              newAvatarUrls[pubkey] = avatarUrl;
            } else {
              newAvatarUrls[pubkey] = null; // Will show fallback
            }
          } catch (error) {
            console.error(`Error loading avatar for ${pubkey}:`, error);
            newAvatarUrls[pubkey] = null;
          } finally {
            setLoadingAvatars(prev => ({ ...prev, [pubkey]: false }));
          }
        })
      );

      setAvatarUrls(newAvatarUrls);
    };

    loadAvatars();
  }, [voters]);

  if (!voters || voters.length === 0) {
    return (
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <h4 className="text-sm font-medium text-slate-300 mb-2">
          🚀 Pubkynauts who've voted for this feature
        </h4>
        <p className="text-xs text-slate-400">No votes yet. Be the first to vote!</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
      <h4 className="text-sm font-medium text-slate-300 mb-3">
        🚀 Pubkynauts who've voted for this feature ({voters.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {voters.map((pubkey, index) => (
          <div 
            key={pubkey}
            className="relative group"
            title={`Pubkynaut: ${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`}
          >
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-600 hover:border-purple-400 transition-all duration-200">
              {loadingAvatars[pubkey] ? (
                <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : avatarUrls[pubkey] ? (
                <img 
                  src={avatarUrls[pubkey]} 
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.fallback-icon');
                      if (fallback) fallback.style.display = 'block';
                    }
                  }}
                />
              ) : null}
              <User 
                className={`w-4 h-4 text-slate-400 fallback-icon ${
                  avatarUrls[pubkey] && !loadingAvatars[pubkey] ? 'hidden' : 'block'
                }`} 
              />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {pubkey.slice(0, 12)}...{pubkey.slice(-12)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FeatureList({ refreshTrigger }) {
  const { user } = useAuth();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBounty, setFilterBounty] = useState('all');
  const [isBountyFilterOpen, setIsBountyFilterOpen] = useState(false); // Contrôle l'ouverture du filtre bounty
  const [isFiltersOpen, setIsFiltersOpen] = useState(false); // Contrôle l'ouverture de toute la section des filtres
  const [userVotes, setUserVotes] = useState(new Set()); // Track user votes
  const [hoveredVoteButton, setHoveredVoteButton] = useState(null); // Track hover state

  // Charger les features
  const loadFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/features');
      const result = await response.json();

      if (result.success) {
        setFeatures(result.features);
        setError(null);
        
        // Load user votes if authenticated
        if (user?.pubkey) {
          const votedFeatures = new Set();
          result.features.forEach(feature => {
            if (feature.voters && feature.voters.includes(user.pubkey)) {
              votedFeatures.add(feature.id);
            }
          });
          setUserVotes(votedFeatures);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Erreur chargement features:', err);
      setError('Erreur lors du chargement des fonctionnalités');
    } finally {
      setLoading(false);
    }
  };

  // Voter pour une feature
  const handleVote = async (featureId) => {
    if (!user?.pubkey) {
      alert('Vous devez être connecté pour voter');
      return;
    }

    try {
      const response = await fetch(`/api/features/${featureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voterPubkey: user.pubkey
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour le nombre de votes ET la liste des votants localement
        setFeatures(prev => prev.map(feature => 
          feature.id === featureId 
            ? { 
                ...feature, 
                votes: result.votes,
                voters: feature.voters 
                  ? (feature.voters.includes(user.pubkey) ? feature.voters : [...feature.voters, user.pubkey])
                  : [user.pubkey]
              }
            : feature
        ));
        
        // Add to user votes
        setUserVotes(prev => new Set([...prev, featureId]));
        
        alert('✅ Vote enregistré !');
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur vote:', error);
      alert('❌ Erreur lors du vote');
    }
  };

  // Annuler un vote
  const handleCancelVote = async (featureId) => {
    if (!user?.pubkey) {
      alert('You must be connected to cancel a vote');
      return;
    }

    try {
      const response = await fetch(`/api/features/${featureId}/cancel-vote`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voterPubkey: user.pubkey
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour le nombre de votes ET retirer de la liste des votants localement
        setFeatures(prev => prev.map(feature => 
          feature.id === featureId 
            ? { 
                ...feature, 
                votes: result.votes,
                voters: feature.voters ? feature.voters.filter(pubkey => pubkey !== user.pubkey) : []
              }
            : feature
        ));
        
        // Remove from user votes
        setUserVotes(prev => {
          const newVotes = new Set(prev);
          newVotes.delete(featureId);
          return newVotes;
        });
        
        alert('✅ Vote cancelled!');
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error cancelling vote:', error);
      alert('❌ Error cancelling vote');
    }
  };

  // Filtrer et trier les features
  const filteredAndSortedFeatures = features
    .filter(feature => {
      if (filterCategory === 'all') return true;
      return feature.category === filterCategory;
    })
    .filter(feature => {
      if (filterStatus === 'all') return true;
      return feature.status === filterStatus;
    })
    .filter(feature => {
      if (filterBounty === 'all') return true;
      if (filterBounty === 'bounty') return feature.bounty === true;
      if (filterBounty === 'no-bounty') return !feature.bounty;
      return true;
    })
    .sort((a, b) => {
      // Tri par nombre de votes décroissant (plus de votes en premier)
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      // En cas d'égalité de votes, tri par date de création (plus récent en premier)
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Charger au montage et quand refreshTrigger change
  useEffect(() => {
    loadFeatures();
  }, [refreshTrigger, user?.pubkey]);

  // Synchroniser userVotes avec la liste des voters des features
  useEffect(() => {
    if (user?.pubkey && features.length > 0) {
      const votedFeatures = new Set();
      features.forEach(feature => {
        if (feature.voters && feature.voters.includes(user.pubkey)) {
          votedFeatures.add(feature.id);
        }
      });
      setUserVotes(votedFeatures);
    }
  }, [features, user?.pubkey]);

  // Obtenir les catégories uniques
  const categories = [...new Set(features.map(f => f.category))];
  const statuses = [...new Set(features.map(f => f.status))];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Chargement des fonctionnalités...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">❌ {error}</p>
        <button 
          onClick={loadFeatures}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        {/* Header avec bouton pour ouvrir/fermer les filtres */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </div>
              <div>
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                   Filters & Sorting
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400">
                   Customize the display of features
                 </p>
               </div>
            </div>
            <div className="flex items-center space-x-2">
               <span className="text-sm text-slate-500 dark:text-slate-400">
                 {isFiltersOpen ? 'Hide' : 'Show'}
               </span>
              <div className={`transform transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
        
        {/* Contenu des filtres (collapsible) */}
        {isFiltersOpen && (
          <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          {/* Sort Options */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Sort by
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'created_at', label: 'Latest' },
                { value: 'votes', label: 'Most Voted' },
                { value: 'title', label: 'Alphabetical' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                All Status
              </button>
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Bounty Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              💰 Bounty
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Features' },
                { value: 'bounty', label: '💰 Bounty Features' },
                { value: 'no-bounty', label: 'Regular Features' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterBounty(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterBounty === option.value
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={loadFeatures}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              🔄 Refresh
            </button>
          </div>
          </div>
        )}
      </div>

      {/* Liste des features */}
      {filteredAndSortedFeatures.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
          <p className="text-gray-300 text-lg">No features found</p>
          <p className="text-gray-400 text-sm mt-2">
            {features.length === 0 
              ? "Soyez le premier à proposer une fonctionnalité !" 
              : "Essayez de modifier les filtres"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedFeatures.map((feature) => (
            <div key={feature.id} className={`bg-gray-900 rounded-lg shadow-lg border transition-all ${
              feature.bounty 
                ? 'border-yellow-400 shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:border-yellow-300 bg-gradient-to-br from-gray-900 to-yellow-900/10' 
                : 'border-gray-700 hover:shadow-xl hover:border-purple-500/50'
            }`}>
              <div className="p-6">
                {/* Header avec titre et badges */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
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
                      {feature.bounty && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                          💰 Bounty
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Votes */}
                  <div className="text-center ml-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {feature.votes}
                    </div>
                    <div className="text-sm text-gray-500">
                      vote{feature.votes !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {feature.description}
                </p>

                {/* Métadonnées */}
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <div>
                    Créé le {new Date(feature.created_at).toLocaleDateString('fr-FR')}
                    {feature.updated_at !== feature.created_at && (
                      <span> • Modifié le {new Date(feature.updated_at).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                  <AuthorAvatar authorPubkey={feature.author_pubkey} />
                </div>

                {/* Pubkynauts Voters */}
                <VotersAvatars voters={feature.voters} />

                {/* Actions */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-2">
                    {userVotes.has(feature.id) ? (
                      <button
                        onClick={() => handleCancelVote(feature.id)}
                        onMouseEnter={() => setHoveredVoteButton(feature.id)}
                        onMouseLeave={() => setHoveredVoteButton(null)}
                        className="px-4 py-2 bg-green-600 hover:bg-red-600 text-white rounded-md flex items-center space-x-2 transition-all duration-200"
                        title="Click to cancel your vote"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>
                          {hoveredVoteButton === feature.id ? 'Cancel my vote' : "You've voted for this"}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVote(feature.id)}
                        disabled={!user?.pubkey}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span>Vote</span>
                      </button>
                    )}
                    
                    {/* Bounty Interest Button */}
                    {feature.bounty && (
                      <a
                        href="mailto:da@synonym.to"
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-md hover:from-yellow-600 hover:to-orange-700 transition-all flex items-center space-x-2 shadow-lg"
                        title="Contact us about this bounty feature"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>I'm interested</span>
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    Sync: {new Date(feature.last_sync).toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
