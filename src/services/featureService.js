import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service de gestion des fonctionnalités avec stockage dual :
 * - Homeserver Pubky de l'utilisateur (ownership)
 * - Cache local Roadky (performance + votes)
 */
class FeatureService {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'features');
    this.ensureDataDir();
  }

  /**
   * Initialise le dossier de données
   */
  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Erreur création dossier data:', error);
    }
  }

  /**
   * Crée une nouvelle fonctionnalité dans le cache local
   * La sauvegarde Pubky est gérée côté frontend
   */
  async createFeature(userPubkey, featureData) {
    const featureId = uuidv4();
    const now = new Date().toISOString();

    // Structure de la feature pour le cache local
    const localFeature = {
      id: featureId,
      title: featureData.title,
      description: featureData.description,
      category: featureData.category || 'general',
      status: featureData.status || 'idea',
      priority: featureData.priority || 'medium',
      application: featureData.application || 'None',
      bounty: featureData.bounty || false,
      created_at: now,
      updated_at: now,
      author_pubkey: userPubkey,
      pubky_path: `/pub/roadky-app/features/${featureId}.json`,
      votes: 0,
      voters: [],
      indexed_at: now,
      last_sync: now
    };

    try {
      // Sauvegarder dans le cache local

      await this.saveLocalFeature(localFeature);

      console.log(`✅ Feature ${featureId} créée avec succès`);
      return {
        success: true,
        feature: localFeature
      };

    } catch (error) {
      console.error('Erreur création feature:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sauvegarde une feature dans le cache local
   */
  async saveLocalFeature(localFeature) {
    const filePath = path.join(this.dataDir, `${localFeature.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(localFeature, null, 2));
  }

  /**
   * Récupère toutes les features locales
   */
  async getAllFeatures() {
    try {
      const files = await fs.readdir(this.dataDir);
      const features = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.dataDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            // Vérifier que le contenu n'est pas vide
            if (content.trim()) {
              const feature = JSON.parse(content);
              features.push(feature);
            }
          } catch (parseError) {
            console.error(`Erreur parsing ${file}:`, parseError);
            // Continuer avec les autres fichiers
          }
        }
      }
      
      // Trier par date de création (plus récent en premier)
      return features.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

    } catch (error) {
      console.error('Erreur récupération features:', error);
      return [];
    }
  }

  /**
   * Récupère une feature par ID
   */
  async getFeatureById(featureId) {
    try {
      const filePath = path.join(this.dataDir, `${featureId}.json`);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Vérifier que le contenu n'est pas vide
      if (!content.trim()) {
        return null;
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error(`Feature ${featureId} non trouvée:`, error);
      return null;
    }
  }

  /**
   * Vote pour une feature
   */
  async voteForFeature(featureId, voterPubkey) {
    const feature = await this.getFeatureById(featureId);
    if (!feature) {
      return { success: false, error: 'Feature not found' };
    }

    // Vérifier si l'utilisateur a déjà voté
    if (feature.voters.includes(voterPubkey)) {
      return { success: false, error: 'You have already voted for this feature' };
    }

    // Ajouter le vote
    feature.voters.push(voterPubkey);
    feature.votes = feature.voters.length;

    await this.saveLocalFeature(feature);

    return {
      success: true,
      votes: feature.votes
    };
  }

  /**
   * Cancel vote for a feature
   */
  async cancelVote(featureId, voterPubkey) {
    const feature = await this.getFeatureById(featureId);
    if (!feature) {
      return { success: false, error: 'Feature not found' };
    }

    // Vérifier si l'utilisateur a voté
    if (!feature.voters.includes(voterPubkey)) {
      return { success: false, error: 'You have not voted for this feature' };
    }

    // Retirer le vote
    feature.voters = feature.voters.filter(voter => voter !== voterPubkey);
    feature.votes = feature.voters.length;

    await this.saveLocalFeature(feature);

    return {
      success: true,
      votes: feature.votes
    };
  }

  /**
   * Met à jour une feature dans le cache local
   */
  async updateFeature(featureId, updatedData) {
    try {
      const existingFeature = await this.getFeatureById(featureId);
      if (!existingFeature) {
        console.error(`Feature ${featureId} not found in local cache`);
        return false;
      }
      
      // Fusionner les données existantes avec les nouvelles
      const updatedFeature = {
        ...existingFeature,
        ...updatedData,
        id: featureId, // Préserver l'ID
        author_pubkey: existingFeature.author_pubkey, // Préserver l'auteur
        created_at: existingFeature.created_at, // Préserver la date de création
        votes: existingFeature.votes, // Préserver les votes
        voters: existingFeature.voters, // Préserver les votants
        updated_at: new Date().toISOString() // Mettre à jour la date de modification
      };
      
      await this.saveLocalFeature(updatedFeature);
      console.log(`✅ Feature ${featureId} updated in local cache`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error updating feature ${featureId}:`, error);
      return false;
    }
  }

  /**
   * Supprime une feature du cache local
   */
  async deleteFeature(featureId) {
    try {
      const filePath = path.join(this.dataDir, `${featureId}.json`);
      
      // Vérifier que le fichier existe
      try {
        await fs.access(filePath);
      } catch (error) {
        console.error(`Feature ${featureId} not found in local cache`);
        return false;
      }
      
      // Supprimer le fichier
      await fs.unlink(filePath);
      console.log(`✅ Feature ${featureId} deleted from local cache`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error deleting feature ${featureId}:`, error);
      return false;
    }
  }

  /**
   * Synchronise une feature depuis son homeserver Pubky
   */
  async syncFeature(featureId) {
    const localFeature = await this.getFeatureById(featureId);
    if (!localFeature) {
      console.error(`Feature locale ${featureId} non trouvée`);
      return false;
    }

    try {
      // Récupérer la version à jour depuis le homeserver
      const response = await this.pubkyClient.get(localFeature.pubky_path);
      const remoteFeature = JSON.parse(response);

      // Mettre à jour le cache local (garder les votes !)
      localFeature.cached_content = remoteFeature;
      localFeature.last_sync = new Date().toISOString();

      await this.saveLocalFeature(localFeature);

      console.log(`✅ Feature ${featureId} synchronisée`);
      return true;

    } catch (error) {
      console.error(`❌ Erreur sync feature ${featureId}:`, error);
      return false;
    }
  }

  /**
   * Synchronise toutes les features depuis leurs homeservers
   */
  async syncAllFeatures() {
    const features = await this.getAllFeatures();
    let syncCount = 0;

    console.log(`🔄 Synchronisation de ${features.length} features...`);

    for (const feature of features) {
      const success = await this.syncFeature(feature.id);
      if (success) syncCount++;
      
      // Petite pause pour éviter de surcharger les homeservers
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ ${syncCount}/${features.length} features synchronisées`);
    return syncCount;
  }

  /**
   * Récupère les statistiques des features
   */
  async getStats() {
    const features = await this.getAllFeatures();
    
    const stats = {
      total: features.length,
      totalVotes: features.reduce((sum, f) => sum + f.votes, 0),
      byStatus: {},
      byCategory: {},
      topVoted: features
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5)
        .map(f => ({
          id: f.id,
          title: f.cached_content.title,
          votes: f.votes
        }))
    };

    // Grouper par statut
    features.forEach(f => {
      const status = f.cached_content.status;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    // Grouper par catégorie
    features.forEach(f => {
      const category = f.cached_content.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }
}

export default FeatureService;
