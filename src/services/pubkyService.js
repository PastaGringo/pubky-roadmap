// Service Pubky côté frontend (inspiré de l'app Picky)
// Le client Pubky ne peut être initialisé que côté client (navigateur)

// Configuration (même que Picky)
const TESTNET = process.env.NEXT_PUBLIC_TESTNET?.toLowerCase() === 'true';
const RAW_HTTP_RELAY = process.env.NEXT_PUBLIC_HTTP_RELAY || 'https://httprelay.pubky.app/link';
const HTTP_RELAY = (() => {
  let r = RAW_HTTP_RELAY.replace(/\/+$/, '');
  if (!/\/link$/.test(r)) r = `${r}/link`;
  return r;
})();
const PKARR_RELAYS = process.env.NEXT_PUBLIC_PKARR_RELAYS ? 
  JSON.parse(process.env.NEXT_PUBLIC_PKARR_RELAYS) : 
  ['https://pkarr.pubky.app', 'https://pkarr.pubky.org'];
const CAPABILITIES = ('/pub/roadky-app/:rw').trim();

// Variable globale pour le client
let client = null;

// Initialise le client uniquement côté client (exactement comme Picky)
const initClient = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Pubky client can only be initialized on client side');
  }

  if (!client) {
    const { Client } = await import('@synonymdev/pubky');
    client = new Client({
      pkarr: {
        relays: PKARR_RELAYS,
        requestTimeout: null
      },
      userMaxRecordAge: null
    });
  }
  
  return client;
};

// Helper: obtenir un homeserver pour un utilisateur (comme Picky)
async function getHomeserverFor(session) {
  const clientInstance = await initClient();
  const { PublicKey } = await import('@synonymdev/pubky');
  const userPk = PublicKey.from(session.pubkey || session);
  return clientInstance.getHomeserver(userPk);
}

/**
 * Service Pubky pour la gestion des fonctionnalités côté frontend
 */
export class PubkyService {
  
  /**
   * Sauvegarde une fonctionnalité sur le homeserver Pubky de l'utilisateur
   */
  static async saveFeatureToPubky(userPubkey, featureData) {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PubkyService can only be used on client side');
      }

      const clientInstance = await initClient();
      const pubkyPath = `/pub/roadky-app/features/${featureData.id}.json`;
      const url = `pubky://${userPubkey}${pubkyPath}`;
      
      // Structure de la feature pour Pubky
      const pubkyFeature = {
        id: featureData.id,
        title: featureData.title,
        description: featureData.description,
        category: featureData.category || 'general',
        status: featureData.status || 'idea',
        priority: featureData.priority || 'medium',
        created_at: featureData.created_at,
        updated_at: featureData.updated_at || new Date().toISOString(),
        author_pubkey: userPubkey,
        // Métadonnées Roadky
        app: 'roadky',
        version: '1.0'
      };

      console.log(`🚀 Attempting to save feature via client.fetch: ${url}`);

      // Sauvegarder sur le homeserver (comme Picky)
      const jsonBlob = new Blob([JSON.stringify(pubkyFeature, null, 2)], { type: 'application/json' });
      const response = await clientInstance.fetch(url, {
        method: 'PUT',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: jsonBlob,
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ Feature PUT failed with 404, creating /pub/ and /pub/roadky-app/ then retry...');
          
          // Créer les dossiers nécessaires
          const pubFolderUrl = `pubky://${userPubkey}/pub/`;
          const appFolderUrl = `pubky://${userPubkey}/pub/roadky-app/`;

          // Créer /pub/
          const mkdirPub = await clientInstance.fetch(pubFolderUrl, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/x-directory' }),
            body: '',
            credentials: 'include'
          });
          if (!mkdirPub.ok && mkdirPub.status !== 409) {
            throw new Error(`Failed to create /pub/ directory, status: ${mkdirPub.status}`);
          }

          // Créer /pub/roadky-app/
          const mkdirApp = await clientInstance.fetch(appFolderUrl, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/x-directory' }),
            body: '',
            credentials: 'include'
          });
          if (!mkdirApp.ok && mkdirApp.status !== 409) {
            throw new Error(`Failed to create /pub/roadky-app/ directory, status: ${mkdirApp.status}`);
          }

          console.log('✅ Required folders created. Retrying feature save...');
          
          // Retry la sauvegarde
          const retryBody = new Blob([JSON.stringify(pubkyFeature, null, 2)], { type: 'application/json' });
          const retryResponse = await clientInstance.fetch(url, {
            method: 'PUT',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: retryBody,
            credentials: 'include'
          });

          if (!retryResponse.ok) {
            if (retryResponse.status === 401) {
              throw new Error('Unauthorized (401) after mkdir. Please re-login to grant /pub/roadky-app/:rw');
            }
            throw new Error(`Direct PUT error after retry (${retryResponse.status})`);
          }
        } else if (response.status === 401) {
          throw new Error('Unauthorized (401). Please re-login to grant /pub/roadky-app/:rw');
        } else {
          throw new Error(`Direct PUT error (${response.status})`);
        }
      }
      
      console.log(`✅ Feature ${featureData.id} sauvegardée sur homeserver Pubky`);
      return {
        success: true,
        pubky_path: url
      };

    } catch (error) {
      console.error('❌ Erreur sauvegarde Pubky:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupère une fonctionnalité depuis un homeserver Pubky
   */
  static async getFeatureFromPubky(userPubkey, featureId) {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PubkyService can only be used on client side');
      }

      const homeserver = await getHomeserverFor(userPubkey);
      const pubkyPath = `/pub/roadky-app/features/${featureId}.json`;
      
      const data = await homeserver.get(pubkyPath);
      if (!data) {
        return { success: false, error: 'Feature not found' };
      }

      const feature = JSON.parse(data);
      console.log(`✅ Feature ${featureId} récupérée depuis homeserver Pubky`);
      
      return {
        success: true,
        feature
      };

    } catch (error) {
      console.error('❌ Erreur récupération Pubky:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Liste toutes les fonctionnalités d'un utilisateur sur son homeserver
   */
  static async listUserFeatures(userPubkey) {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PubkyService can only be used on client side');
      }

      const homeserver = await getHomeserverFor(userPubkey);
      const basePath = '/pub/roadky-app/features/';
      
      // Lister les fichiers dans le dossier features
      const files = await homeserver.list(basePath);
      const features = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = await homeserver.get(`${basePath}${file}`);
            const feature = JSON.parse(data);
            features.push(feature);
          } catch (error) {
            console.warn(`⚠️ Erreur lecture feature ${file}:`, error.message);
          }
        }
      }

      console.log(`✅ ${features.length} features récupérées depuis homeserver Pubky`);
      return {
        success: true,
        features
      };

    } catch (error) {
      console.error('❌ Erreur listage features Pubky:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupère un fichier (image, etc.) depuis un homeserver Pubky
   */
  static async getFileFromPubky(userPubkey, filePath) {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PubkyService can only be used on client side');
      }

      const clientInstance = await initClient();
      const url = `pubky://${userPubkey}${filePath}`;
      
      console.log(`📁 Fetching file via client.fetch: ${url}`);
      
      // Récupérer le fichier depuis le homeserver (comme dans Picky)
      const response = await clientInstance.fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`File fetch failed with status: ${response.status}`);
      }

      // Pour les fichiers binaires (images), utiliser arrayBuffer
      const fileData = await response.arrayBuffer();
      
      console.log(`✅ File ${filePath} retrieved from Pubky homeserver`);
      return fileData;

    } catch (error) {
      console.error('❌ Error fetching file from Pubky:', error);
      throw error;
    }
  }

  /**
   * Supprime une fonctionnalité du homeserver Pubky
   */
  static async deleteFeatureFromPubky(userPubkey, featureId) {
    try {
      if (typeof window === 'undefined') {
        throw new Error('PubkyService can only be used on client side');
      }

      const clientInstance = await initClient();
      const pubkyPath = `/pub/roadky-app/features/${featureId}.json`;
      const url = `pubky://${userPubkey}${pubkyPath}`;
      
      console.log(`🗑️ Attempting to delete feature via client.fetch: ${url}`);
      
      // Supprimer du homeserver (comme pour la sauvegarde)
      const response = await clientInstance.fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
      
      console.log(`✅ Feature ${featureId} supprimée du homeserver Pubky`);
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur suppression Pubky:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default PubkyService;
